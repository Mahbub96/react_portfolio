"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import analytics from "@/services/analyticsSdk";

/**
 * Helper to get a stable, semantic identifier for an element
 */
function getElementIdentifier(target) {
  if (!target || !(target instanceof Element)) return "unknown";

  const idAttr =
    target.getAttribute("data-analytics-id") ||
    target.getAttribute("data-component") ||
    target.getAttribute("data-testid") ||
    target.id ||
    target.getAttribute("aria-label") ||
    target.getAttribute("name");

  if (idAttr) return idAttr;

  let parent = target.parentElement;
  let depth = 0;
  while (parent && depth < 3) {
    const parentId =
      parent.getAttribute("data-analytics-id") ||
      parent.getAttribute("data-component") ||
      parent.id;
    if (parentId) return `${parentId} > ${target.tagName.toLowerCase()}`;
    parent = parent.parentElement;
    depth++;
  }

  const tagName = target.tagName.toLowerCase();
  const role = target.getAttribute("role");
  const type = target.getAttribute("type");
  const href = target.getAttribute("href");

  if (role) return `${tagName}[role=${role}]`;
  if (type) return `${tagName}[type=${type}]`;
  if (href) return `${tagName}[href=${href.substring(0, 30)}]`;

  const cleanClass =
    typeof target.className === "string"
      ? target.className
          .split(" ")
          .filter((c) => c && !c.includes("module") && c.length > 2)[0]
      : null;

  if (cleanClass) return `${tagName}.${cleanClass}`;

  return tagName;
}

/**
 * Check whether an input field is sensitive and must be masked
 */
function isSensitiveInput(input) {
  if (!input) return true;
  const type = (input.getAttribute("type") || "").toLowerCase();
  const name = (input.getAttribute("name") || "").toLowerCase();
  const id = (input.getAttribute("id") || "").toLowerCase();
  const autocomplete = (input.getAttribute("autocomplete") || "").toLowerCase();
  const isMasked = input.hasAttribute("data-analytics-mask");

  if (isMasked || type === "password" || type === "hidden") return true;

  const sensitiveKeywords = [
    "pass",
    "pwd",
    "token",
    "secret",
    "card",
    "cvv",
    "cvc",
    "ssn",
    "otp",
    "auth",
  ];

  return sensitiveKeywords.some(
    (kw) => name.includes(kw) || id.includes(kw) || autocomplete.includes(kw)
  );
}

const AnalyticsTracker = () => {
  const pathname = usePathname();
  const activeHoverRef = useRef(null);
  const inputSessionsRef = useRef(new Map());
  const milestonesFiredRef = useRef(new Set());
  const lastScrollTopRef = useRef(0);
  const lastScrollTimeRef = useRef(Date.now());
  const totalScrollDistanceRef = useRef(0);
  const maxScrollDepthRef = useRef(0);
  const scrollTimeoutRef = useRef(null);
  const sectionObserversRef = useRef([]);

  // High-fidelity movement delta buffer
  const movePointsBufferRef = useRef([]);
  const lastMoveTimeRef = useRef(Date.now());
  const moveFlushTimerRef = useRef(null);

  // Rage click detection buffer
  const recentClicksRef = useRef([]);

  // Initialize SDK
  useEffect(() => {
    analytics.init({
      endpoint: "/api/analytics/batch",
      batchInterval: 4000,
      maxBatchSize: 20,
    });
  }, []);

  // Flush mouse movement segment
  const flushMovementBuffer = () => {
    if (movePointsBufferRef.current.length >= 2) {
      analytics.track("mouse_movement", {
        startTime: Date.now(),
        pointCount: movePointsBufferRef.current.length,
        points: [...movePointsBufferRef.current],
      });
    }
    movePointsBufferRef.current = [];
  };

  // Track page navigation (Next.js SPA route changes)
  useEffect(() => {
    milestonesFiredRef.current.clear();
    lastScrollTopRef.current = 0;
    totalScrollDistanceRef.current = 0;
    maxScrollDepthRef.current = 0;
    flushMovementBuffer();

    analytics.page(pathname, {
      title: typeof document !== "undefined" ? document.title : "",
    });

    // Observe portfolio sections on this page
    const sections = document.querySelectorAll("section[id], div[id]");
    const sectionEnterTimes = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (!id) return;

          if (entry.isIntersecting) {
            sectionEnterTimes.set(id, Date.now());
          } else {
            const enterTime = sectionEnterTimes.get(id);
            if (enterTime) {
              const dwellTime = Date.now() - enterTime;
              if (dwellTime > 1000) {
                analytics.track(
                  "section_view",
                  {
                    sectionId: id,
                    dwellTimeMs: dwellTime,
                  },
                  `section#${id}`
                );
              }
              sectionEnterTimes.delete(id);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((sec) => observer.observe(sec));
    sectionObserversRef.current.push(observer);

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  // Setup DOM interaction listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    // --- 1. Mouse Clicks & Rage Click Detection ---
    const handleClick = (e) => {
      const now = Date.now();
      const target = e.target;
      const elementId = getElementIdentifier(target);
      const clickType =
        e.button === 0 ? "left" : e.button === 1 ? "middle" : "right";

      const clickX = Math.round(e.clientX);
      const clickY = Math.round(e.clientY);

      analytics.track(
        "click",
        {
          x: clickX,
          y: clickY,
          scrollY: Math.round(window.pageYOffset || document.documentElement.scrollTop || 0),
          clickType,
          tagName: target.tagName?.toLowerCase() || "",
        },
        elementId
      );

      // Check for rage clicking (3+ clicks within 600ms within 30px radius)
      recentClicksRef.current.push({ x: clickX, y: clickY, time: now });
      recentClicksRef.current = recentClicksRef.current.filter(
        (c) => now - c.time < 600
      );

      if (recentClicksRef.current.length >= 3) {
        const first = recentClicksRef.current[0];
        const isCluster = recentClicksRef.current.every(
          (c) => Math.hypot(c.x - first.x, c.y - first.y) < 30
        );
        if (isCluster) {
          analytics.track(
            "rage_click",
            {
              x: clickX,
              y: clickY,
              clickCount: recentClicksRef.current.length,
            },
            elementId
          );
          recentClicksRef.current = [];
        }
      }
    };

    // --- 2. Adaptive Mouse Movement Sampling with RAF & Inactivity Optimization ---
    let lastRecordedX = 0;
    let lastRecordedY = 0;
    let isUserInactive = false;
    let inactiveTimer = null;
    let rafPending = false;
    let pendingMoveEvent = null;

    const isTouchDevice =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0);

    const resetInactivity = () => {
      isUserInactive = false;
      if (inactiveTimer) clearTimeout(inactiveTimer);
      inactiveTimer = setTimeout(() => {
        isUserInactive = true;
      }, 4000);
    };
    resetInactivity();

    const processMouseMove = () => {
      rafPending = false;
      if (!pendingMoveEvent) return;

      const { clientX, clientY, target } = pendingMoveEvent;
      const now = Date.now();
      const deltaMs = now - lastMoveTimeRef.current;

      const dist = Math.hypot(clientX - lastRecordedX, clientY - lastRecordedY);

      // Inactivity Pause (Section 22.4): If user was idle, require deliberate movement (>40px)
      if (isUserInactive) {
        if (dist < 40) return;
        resetInactivity();
      } else {
        resetInactivity();
      }

      // Micro-jitter filter (<12px within 200ms)
      if (dist < 12 && deltaMs < 200) return;

      // Adaptive sampling: 60ms near interactive elements, 120ms elsewhere
      const isNearInteractive =
        target &&
        target.closest &&
        target.closest(
          "button, a, input, select, textarea, [role='button'], .nav-link, [data-analytics-id]"
        );
      const sampleThreshold = isNearInteractive ? 60 : 120;

      if (deltaMs >= sampleThreshold || movePointsBufferRef.current.length === 0) {
        lastMoveTimeRef.current = now;
        lastRecordedX = clientX;
        lastRecordedY = clientY;

        const currentScrollY = Math.round(
          window.pageYOffset || document.documentElement.scrollTop || 0
        );

        // Store compressed point: [x, y, deltaMs, scrollY]
        movePointsBufferRef.current.push([
          clientX,
          clientY,
          Math.min(deltaMs, 255),
          currentScrollY,
        ]);

        // Cap buffer per movement segment
        if (movePointsBufferRef.current.length >= 20) {
          flushMovementBuffer();
        }

        // Idle pause flush timer (if mouse stops moving for 250ms)
        if (moveFlushTimerRef.current) clearTimeout(moveFlushTimerRef.current);
        moveFlushTimerRef.current = setTimeout(() => {
          flushMovementBuffer();
        }, 250);
      }
    };

    const handleMouseMove = (e) => {
      // Don't poll mousemove on mobile/touch devices to conserve battery & CPU (Section 22.3)
      if (isTouchDevice) return;

      pendingMoveEvent = {
        clientX: Math.round(e.clientX),
        clientY: Math.round(e.clientY),
        target: e.target,
      };

      // Section 22.5: requestAnimationFrame for coordinated visual sampling (never floods main thread)
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(processMouseMove);
      }
    };

    // --- 3. Hover Tracking & Long Hover Detection ---
    const handleMouseOver = (e) => {
      const target = e.target;
      const interactiveSelector =
        "button, a, input, select, textarea, [role='button'], [data-analytics-id], .nav-link, [data-component]";
      const interactiveEl = target.closest
        ? target.closest(interactiveSelector)
        : null;

      if (!interactiveEl) {
        if (activeHoverRef.current) concludeHover(e);
        return;
      }

      if (
        activeHoverRef.current &&
        activeHoverRef.current.element === interactiveEl
      ) {
        return;
      }

      if (activeHoverRef.current) concludeHover(e);

      activeHoverRef.current = {
        element: interactiveEl,
        elementId: getElementIdentifier(interactiveEl),
        startTime: Date.now(),
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
      };
    };

    const concludeHover = (e) => {
      if (!activeHoverRef.current) return;
      const { elementId, startTime, x, y } = activeHoverRef.current;
      const durationMs = Date.now() - startTime;
      activeHoverRef.current = null;

      if (durationMs >= 300) {
        analytics.track(
          "hover",
          {
            durationMs,
            x: e ? Math.round(e.clientX) : x,
            y: e ? Math.round(e.clientY) : y,
          },
          elementId
        );

        // Detect Long Hover (>2500ms indicates contemplation or friction)
        if (durationMs >= 2500) {
          analytics.track(
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
    };

    const handleMouseLeave = (e) => {
      concludeHover(e);
    };

    // --- 4. Scroll Tracking, Milestones & Rapid Scroll Detection ---
    const handleScroll = () => {
      if (scrollTimeoutRef.current) return;

      scrollTimeoutRef.current = setTimeout(() => {
        scrollTimeoutRef.current = null;

        const now = Date.now();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight =
          document.documentElement.scrollHeight - window.innerHeight;

        if (scrollHeight <= 0) return;

        const scrollPercent = Math.min(
          100,
          Math.max(0, Math.round((scrollTop / scrollHeight) * 100))
        );
        const direction =
          scrollTop >= lastScrollTopRef.current ? "down" : "up";
        const delta = Math.abs(scrollTop - lastScrollTopRef.current);
        const timeDelta = now - lastScrollTimeRef.current;

        totalScrollDistanceRef.current += delta;

        // Check for rapid scrolling (>1200px in <400ms)
        if (delta > 1200 && timeDelta < 400) {
          analytics.track("rapid_scroll", {
            distancePx: delta,
            durationMs: timeDelta,
            direction,
          });
        }

        lastScrollTopRef.current = scrollTop;
        lastScrollTimeRef.current = now;

        if (scrollPercent > maxScrollDepthRef.current) {
          maxScrollDepthRef.current = scrollPercent;
        }

        // Check milestones
        const milestones = [25, 50, 75, 90, 100];
        milestones.forEach((m) => {
          if (scrollPercent >= m && !milestonesFiredRef.current.has(m)) {
            milestonesFiredRef.current.add(m);
            analytics.track("scroll_milestone", {
              milestone: m,
              scrollDepth: scrollPercent,
              direction,
              scrollY: Math.round(scrollTop),
              approxDistancePx: totalScrollDistanceRef.current,
            });
          }
        });
      }, 150);
    };

    // --- 5. Character-Level Input Dynamics (Metadata Only, No Text Values) ---
    const handleFocusIn = (e) => {
      const target = e.target;
      if (!target || !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
        return;
      if (isSensitiveInput(target)) return;

      const fieldId = getElementIdentifier(target);
      inputSessionsRef.current.set(target, {
        fieldId,
        focusTime: Date.now(),
        charsTyped: 0,
        backspaces: 0,
        deletions: 0,
        pastes: 0,
        corrections: 0,
      });

      analytics.track("form_focus", {}, fieldId);
    };

    const handleKeyDown = (e) => {
      const target = e.target;
      const state = inputSessionsRef.current.get(target);
      if (!state) return;

      if (e.key === "Backspace") {
        state.backspaces++;
        state.corrections++;
      } else if (e.key === "Delete") {
        state.deletions++;
        state.corrections++;
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        state.charsTyped++;
      }
    };

    const handlePaste = (e) => {
      const target = e.target;
      const state = inputSessionsRef.current.get(target);
      if (!state) return;
      state.pastes++;
    };

    const handleFocusOut = (e) => {
      const target = e.target;
      const state = inputSessionsRef.current.get(target);
      if (!state) return;

      const duration = Date.now() - state.focusTime;
      const isCompleted = target.value ? target.value.trim().length > 0 : false;

      analytics.track(
        "input_interaction",
        {
          charsTyped: state.charsTyped,
          backspaces: state.backspaces,
          deletions: state.deletions,
          pastes: state.pastes,
          corrections: state.corrections,
          typingDurationMs: duration,
          isCompleted,
        },
        state.fieldId
      );

      analytics.track(
        "form_blur",
        {
          durationMs: duration,
          isCompleted,
        },
        state.fieldId
      );

      inputSessionsRef.current.delete(target);
    };

    // --- 6. Form Submission & Validation Errors ---
    const handleSubmit = (e) => {
      const form = e.target;
      const formId = getElementIdentifier(form);
      analytics.track("form_submit", {}, formId);
    };

    const handleInvalid = (e) => {
      const target = e.target;
      const fieldId = getElementIdentifier(target);
      analytics.track(
        "form_error",
        {
          validationMessage: target.validationMessage
            ? target.validationMessage.substring(0, 100)
            : "Invalid",
        },
        fieldId
      );
    };

    // Section 22.1: Use non-blocking passive listeners for all user interactions
    const passiveCapture = { passive: true, capture: true };
    const passiveOnly = { passive: true };

    document.addEventListener("click", handleClick, passiveCapture);
    document.addEventListener("mousemove", handleMouseMove, passiveOnly);
    document.addEventListener("mouseover", handleMouseOver, passiveOnly);
    document.addEventListener("mouseleave", handleMouseLeave, passiveOnly);
    window.addEventListener("scroll", handleScroll, passiveOnly);
    document.addEventListener("focusin", handleFocusIn, passiveCapture);
    document.addEventListener("focusout", handleFocusOut, passiveCapture);
    document.addEventListener("keydown", handleKeyDown, passiveOnly);
    document.addEventListener("paste", handlePaste, passiveOnly);
    document.addEventListener("submit", handleSubmit, passiveCapture);
    document.addEventListener("invalid", handleInvalid, passiveCapture);

    return () => {
      document.removeEventListener("click", handleClick, passiveCapture);
      document.removeEventListener("mousemove", handleMouseMove, passiveOnly);
      document.removeEventListener("mouseover", handleMouseOver, passiveOnly);
      document.removeEventListener("mouseleave", handleMouseLeave, passiveOnly);
      window.removeEventListener("scroll", handleScroll, passiveOnly);
      document.removeEventListener("focusin", handleFocusIn, passiveCapture);
      document.removeEventListener("focusout", handleFocusOut, passiveCapture);
      document.removeEventListener("keydown", handleKeyDown, passiveOnly);
      document.removeEventListener("paste", handlePaste, passiveOnly);
      document.removeEventListener("submit", handleSubmit, passiveCapture);
      document.removeEventListener("invalid", handleInvalid, passiveCapture);

      if (inactiveTimer) clearTimeout(inactiveTimer);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (moveFlushTimerRef.current) clearTimeout(moveFlushTimerRef.current);
      flushMovementBuffer();
    };
  }, []);

  return null;
};

export default AnalyticsTracker;
