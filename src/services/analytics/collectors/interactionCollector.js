/**
 * User Interaction Collector (Clicks, Rage Clicks, Hovers, Navigation)
 * Complies with Sections 64, 71, 74, 120:
 * - Free event handler (<1 microsecond execution)
 * - Immediate idle override for critical user actions
 * - Rage click detection
 * - Hover & long-hover friction detection
 */

import { getElementIdentifier } from "./elementResolver";

export class InteractionCollector {
  constructor(trackFn, onCriticalActionFn) {
    this.track = trackFn;
    this.onCriticalAction = onCriticalActionFn; // Finalizes pending mouse/scroll segments immediately
    this.recentClicks = [];
    this.activeHover = null;

    this.handleClick = this.handleClick.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.concludeHover = this.concludeHover.bind(this);
  }

  init() {
    if (typeof window === "undefined") return;
    document.addEventListener("click", this.handleClick, { capture: true, passive: true });
    document.addEventListener("mouseover", this.handleMouseOver, { passive: true });
  }

  destroy() {
    if (typeof window === "undefined") return;
    document.removeEventListener("click", this.handleClick, { capture: true });
    document.removeEventListener("mouseover", this.handleMouseOver);
    this.concludeHover();
  }

  handleClick(e) {
    if (this.onCriticalAction) this.onCriticalAction();

    const target = e.target;
    if (!target) return;

    const elementId = getElementIdentifier(target);
    const clientX = Math.round(e.clientX);
    const clientY = Math.round(e.clientY);
    const scrollY = Math.round(window.pageYOffset || document.documentElement.scrollTop || 0);
    const now = Date.now();

    // Rage click detection: >=3 clicks within 600ms in a 30px radius on same element
    this.recentClicks.push({ time: now, x: clientX, y: clientY, target: elementId });
    this.recentClicks = this.recentClicks.filter((c) => now - c.time < 600);

    const matches = this.recentClicks.filter(
      (c) =>
        c.target === elementId &&
        Math.abs(c.x - clientX) < 30 &&
        Math.abs(c.y - clientY) < 30
    );

    if (matches.length === 3) {
      this.track(
        "rage_click",
        {
          x: clientX,
          y: clientY,
          scrollY,
          clickCount: matches.length,
          timeWindowMs: 600,
        },
        elementId
      );
    }

    // Semantic event classification (Section 120)
    let eventType = "click";
    const interactiveEl = target.closest
      ? target.closest("button, a, [role='button'], .projectCard, [data-component]")
      : null;

    if (interactiveEl) {
      const tagName = interactiveEl.tagName.toLowerCase();
      const role = interactiveEl.getAttribute("role");
      const comp = interactiveEl.getAttribute("data-component");

      if (comp === "project_card" || interactiveEl.classList.contains("projectCard")) {
        eventType = "card_click";
      } else if (tagName === "button" || role === "button") {
        eventType = "button_click";
      } else if (tagName === "a" || role === "link") {
        eventType = "link_click";
      }
    }

    this.track(
      eventType,
      {
        x: clientX,
        y: clientY,
        scrollY,
        tagName: target.tagName?.toLowerCase() || "",
        textContent: (target.textContent || "").trim().substring(0, 50),
      },
      elementId
    );
  }

  handleMouseOver(e) {
    const target = e.target;
    const interactiveSelector =
      "button, a, input, select, textarea, [role='button'], [data-analytics-id], [data-replay-id], .nav-link, [data-component]";
    const interactiveEl = target.closest ? target.closest(interactiveSelector) : null;

    if (!interactiveEl) {
      if (this.activeHover) this.concludeHover(e);
      return;
    }

    if (this.activeHover && this.activeHover.element === interactiveEl) {
      return;
    }

    if (this.activeHover) this.concludeHover(e);

    this.activeHover = {
      element: interactiveEl,
      elementId: getElementIdentifier(interactiveEl),
      startTime: Date.now(),
      x: Math.round(e.clientX),
      y: Math.round(e.clientY),
    };
  }

  concludeHover(e = null) {
    if (!this.activeHover) return;
    const { elementId, startTime, x, y } = this.activeHover;
    const durationMs = Date.now() - startTime;
    this.activeHover = null;

    if (durationMs >= 300) {
      this.track(
        "hover",
        {
          durationMs,
          x: e ? Math.round(e.clientX) : x,
          y: e ? Math.round(e.clientY) : y,
        },
        elementId
      );

      // Long hover indicates contemplation, confusion, or reading
      if (durationMs >= 2500) {
        this.track(
          "long_hover",
          {
            durationMs,
            x: e ? Math.round(e.clientX) : x,
            y: e ? Math.round(e.clientY) : y,
          },
          elementId
        );
      }
    }
  }
}
