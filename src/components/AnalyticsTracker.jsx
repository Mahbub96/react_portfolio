"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import analytics from "@/services/analyticsSdk";
import { useDataContext } from "@/contexts/useAllContext";

/**
 * Helper to get a stable, semantic identifier for an element
 */
function getElementIdentifier(target) {
  if (!target || !(target instanceof Element)) return "unknown";

  const idAttr =
    target.getAttribute("data-replay-id") ||
    target.getAttribute("data-replay-name") ||
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

/**
 * Ramer-Douglas-Peucker (RDP) Trajectory Simplification
 * Iterative stack-based algorithm: reduces 70-85% of redundant collinear points with zero recursive stack overhead
 */
function simplifyTrajectory(points, epsilon = 2.5) {
  if (!points || points.length <= 2) return points;

  function getSqDist(p, p1, p2) {
    let x = p1[1], y = p1[2];
    let dx = p2[1] - x, dy = p2[2] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p[1] - x) * dx + (p[2] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = p2[1];
        y = p2[2];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = p[1] - x;
    dy = p[2] - y;
    return dx * dx + dy * dy;
  }

  const sqEpsilon = epsilon * epsilon;
  const len = points.length;
  const marker = new Uint8Array(len);
  marker[0] = 1;
  marker[len - 1] = 1;

  const stack = [[0, len - 1]];

  while (stack.length > 0) {
    const [first, last] = stack.pop();
    let maxSqDist = 0;
    let index = -1;

    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqDist(points[i], points[first], points[last]);
      if (sqDist > maxSqDist) {
        maxSqDist = sqDist;
        index = i;
      }
    }

    if (maxSqDist > sqEpsilon && index !== -1) {
      marker[index] = 1;
      if (index - first > 1) stack.push([first, index]);
      if (last - index > 1) stack.push([index, last]);
    }
  }

  const result = [];
  for (let i = 0; i < len; i++) {
    if (marker[i]) result.push(points[i]);
  }
  return result;
}

const ActiveTracker = () => {
  const pathname = usePathname();
  const activeHoverRef = useRef(null);
  const inputSessionsRef = useRef(new Map());
  const milestonesFiredRef = useRef(new Set());
  const lastScrollTopRef = useRef(0);
  const totalScrollDistanceRef = useRef(0);
  const maxScrollDepthRef = useRef(0);
  const sectionObserversRef = useRef([]);

  // Section 54-59: Trigger-Activated Mouse Movement Segment State Machine
  const mouseSegmentRef = useRef(null); // { startTime, points: [], lastSampleTime, lastX, lastY, target }
  const mouseInactivityTimerRef = useRef(null);
  const lastRestPosRef = useRef(null);

  // Section 61: Trigger-Activated Scroll Segment State Machine
  const scrollSegmentRef = useRef(null); // { startTime, startY, lastY, maxDepth, samples: [], lastSampleTime }
  const scrollInactivityTimerRef = useRef(null);

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

  // Conclude mouse movement segment with RDP compression & return to IDLE (Section 55 & 59)
  const concludeMouseSegment = () => {
    if (mouseInactivityTimerRef.current) {
      clearTimeout(mouseInactivityTimerRef.current);
      mouseInactivityTimerRef.current = null;
    }
    const seg = mouseSegmentRef.current;
    if (!seg) return;
    mouseSegmentRef.current = null; // Return to MOUSE_IDLE

    lastRestPosRef.current = { x: seg.lastX, y: seg.lastY };

    if (seg.points.length >= 2) {
      const now = Date.now();
      const duration = now - seg.startTime;
      const gov = analytics.getGovernorState ? analytics.getGovernorState() : "NORMAL";
      const epsilon = gov === "DEGRADED" ? 4.5 : gov === "PRESSURED" ? 3.2 : 2.0;
      const simplified = simplifyTrajectory(seg.points, epsilon);

      analytics.track("mouse_segment", {
        startTime: seg.startTime,
        duration,
        pointCount: simplified.length,
        rawCount: seg.points.length,
        points: simplified,
        endX: seg.lastX,
        endY: seg.lastY,
      });
    }
  };

  // Conclude scroll segment & return to IDLE (Section 61)
  const concludeScrollSegment = () => {
    if (scrollInactivityTimerRef.current) {
      clearTimeout(scrollInactivityTimerRef.current);
      scrollInactivityTimerRef.current = null;
    }
    const seg = scrollSegmentRef.current;
    if (!seg) return;
    scrollSegmentRef.current = null; // Return to SCROLL_IDLE

    const now = Date.now();
    const duration = now - seg.startTime;
    const deltaY = Math.abs(seg.lastY - seg.startY);

    // Filter tiny non-movements (<15px)
    if (deltaY < 15 && duration < 200) return;

    if (deltaY > 1200 && duration < 400) {
      analytics.track("rapid_scroll", {
        distancePx: deltaY,
        durationMs: duration,
        direction: seg.lastY >= seg.startY ? "down" : "up",
      });
    }

    analytics.track("scroll_segment", {
      startTime: seg.startTime,
      duration,
      startY: seg.startY,
      endY: seg.lastY,
      deltaY,
      maxDepth: seg.maxDepth,
      direction: seg.lastY >= seg.startY ? "down" : "up",
      samples: seg.samples.slice(0, 30),
    });
  };

  // Track page navigation (Next.js SPA route changes)
  useEffect(() => {
    milestonesFiredRef.current.clear();
    lastScrollTopRef.current = 0;
    totalScrollDistanceRef.current = 0;
    maxScrollDepthRef.current = 0;
    concludeMouseSegment();
    concludeScrollSegment();

    analytics.page(pathname, {
      title: typeof document !== "undefined" ? document.title : "",
    });

    // Check for abandoned forms on page change
    inputSessionsRef.current.forEach((session) => {
      if (session.charsTyped > 0 && !session.isSubmitted) {
        analytics.track(
          "form_abandon",
          {
            fieldId: session.fieldId,
            charsTyped: session.charsTyped,
            dwellTimeMs: Date.now() - session.focusTime,
          },
          session.fieldId
        );
      }
    });
    inputSessionsRef.current.clear();

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

    // Observe forms for form_view (Section 3 & 41)
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      const formId = getElementIdentifier(form);
      const formObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              analytics.track("form_view", { formId }, formId);
              formObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      formObserver.observe(form);
      sectionObserversRef.current.push(formObserver);
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  // Setup DOM interaction listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    // --- 1. Mouse Clicks & Rage Click Detection ---
    const handleClick = (e) => {
      // Section 64: Conclude active movement and scroll segments immediately before click
      concludeMouseSegment();
      concludeScrollSegment();

      const now = Date.now();
      const target = e.target;
      const elementId = getElementIdentifier(target);
      const clickType =
        e.button === 0 ? "left" : e.button === 1 ? "middle" : "right";

      const clickX = Math.round(e.clientX);
      const clickY = Math.round(e.clientY);

      // Classify high-value interaction events (Section 3 & 64)
      const isCard = target.closest && target.closest(".project-card, [data-card], .portfolio-card, [class*='card']");
      const isBtn = target.closest && target.closest("button, [role='button']");
      const isLink = target.closest && target.closest("a, [href]");
      const isTab = target.closest && target.closest("[role='tab'], .tab, [data-tab], .nav-item");
      const isModal = target.closest && target.closest("[data-modal-toggle], [data-modal-close], .modal-close");

      let classifiedType = "click";
      if (isCard) classifiedType = "card_click";
      else if (isBtn) classifiedType = "button_click";
      else if (isLink) classifiedType = "link_click";
      else if (isTab) classifiedType = "tab_change";
      else if (isModal) classifiedType = "modal_open";

      analytics.track(
        classifiedType,
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

    // --- 2. Trigger-Activated Mouse Movement Segments (Sections 54–59) ---
    let rafPending = false;
    let pendingMoveEvent = null;

    const isTouchDevice =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0);

    const processPointerMove = () => {
      rafPending = false;
      if (!pendingMoveEvent) return;

      const { clientX, clientY, target } = pendingMoveEvent;
      const now = Date.now();
      const scrollY = Math.round(
        window.pageYOffset || document.documentElement.scrollTop || 0
      );

      // State check: MOUSE_IDLE -> MOUSE_ACTIVE
      if (!mouseSegmentRef.current) {
        // Section 56 & 57: Small threshold window (>4px) before starting segment
        if (lastRestPosRef.current) {
          const distFromLast = Math.hypot(
            clientX - lastRestPosRef.current.x,
            clientY - lastRestPosRef.current.y
          );
          if (distFromLast < 4) return;
        }

        // Begin movement segment
        mouseSegmentRef.current = {
          startTime: now,
          points: [[0, clientX, clientY, scrollY]],
          lastSampleTime: now,
          lastX: clientX,
          lastY: clientY,
          target,
        };
      } else {
        // MOUSE_ACTIVE: sample meaningful trajectory using distance and curvature filtering (Sections 81, 82, 83)
        const seg = mouseSegmentRef.current;
        const deltaMs = now - seg.lastSampleTime;

        // Section 82: Distance-based filtering using squared distance (avoids Math.sqrt)
        const dx = clientX - seg.lastX;
        const dy = clientY - seg.lastY;
        const distSq = dx * dx + dy * dy;

        const gov = analytics.getGovernorState ? analytics.getGovernorState() : "NORMAL";
        const minDistanceSq = gov === "DEGRADED" ? 64 : gov === "PRESSURED" ? 36 : 16;

        const isNearInteractive =
          target &&
          target.closest &&
          target.closest(
            "button, a, input, select, textarea, [role='button'], .nav-link, [data-analytics-id], [data-replay-id]"
          );
        const sampleThreshold = (isNearInteractive ? 60 : 90) * (gov === "DEGRADED" ? 1.5 : 1);

        if (deltaMs >= sampleThreshold && distSq >= minDistanceSq) {
          // Section 83: Curvature-based filtering. If moving in a straight line, update vertex instead of piling redundant points
          if (seg.points.length >= 2) {
            const pA = seg.points[seg.points.length - 2];
            const pB = seg.points[seg.points.length - 1];
            // 2 * Triangle Area cross-product between vector AB and vector AC
            const cross = Math.abs(
              (pB[1] - pA[1]) * (clientY - pA[2]) - (clientX - pA[1]) * (pB[2] - pA[2])
            );
            if (cross < 25) {
              // Redundant collinear point: update pB coordinates with new point C
              seg.points[seg.points.length - 1] = [now - seg.startTime, clientX, clientY, scrollY];
              seg.lastSampleTime = now;
              seg.lastX = clientX;
              seg.lastY = clientY;
              return;
            }
          }

          seg.lastSampleTime = now;
          seg.lastX = clientX;
          seg.lastY = clientY;
          seg.points.push([now - seg.startTime, clientX, clientY, scrollY]);

          // Bounded segment size (max 25 points): roll into next segment seamlessly
          if (seg.points.length >= 25) {
            concludeMouseSegment();
            mouseSegmentRef.current = {
              startTime: now,
              points: [[0, clientX, clientY, scrollY]],
              lastSampleTime: now,
              lastX: clientX,
              lastY: clientY,
              target,
            };
          }
        }
      }

      // Section 59: Short inactivity threshold (280ms) only runs while movement is active
      if (mouseInactivityTimerRef.current) clearTimeout(mouseInactivityTimerRef.current);
      mouseInactivityTimerRef.current = setTimeout(() => {
        concludeMouseSegment();
      }, 280);
    };

    const handleMouseMove = (e) => {
      // Don't poll mousemove on mobile/touch devices (Section 22.3)
      if (isTouchDevice) return;

      pendingMoveEvent = {
        clientX: Math.round(e.clientX),
        clientY: Math.round(e.clientY),
        target: e.target,
      };

      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(processPointerMove);
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

    // --- 4. Trigger-Activated Scroll Segments (Section 61) ---
    const handleScroll = () => {
      const now = Date.now();
      const scrollTop = Math.round(
        window.pageYOffset || document.documentElement.scrollTop || 0
      );
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollHeight <= 0) return;

      const scrollPercent = Math.min(
        100,
        Math.max(0, Math.round((scrollTop / scrollHeight) * 100))
      );

      // State check: SCROLL_IDLE -> SCROLL_ACTIVE
      if (!scrollSegmentRef.current) {
        scrollSegmentRef.current = {
          startTime: now,
          startY: scrollTop,
          lastY: scrollTop,
          maxDepth: scrollPercent,
          samples: [[0, scrollTop, scrollPercent]],
          lastSampleTime: now,
        };
      } else {
        // SCROLL_ACTIVE: sample every ~100ms
        const seg = scrollSegmentRef.current;
        if (now - seg.lastSampleTime >= 100) {
          seg.lastSampleTime = now;
          seg.lastY = scrollTop;
          seg.samples.push([now - seg.startTime, scrollTop, scrollPercent]);
          if (scrollPercent > seg.maxDepth) {
            seg.maxDepth = scrollPercent;
          }
        }
      }

      if (scrollPercent > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = scrollPercent;
      }

      // Check milestones (25%, 50%, 75%, 90%, 100%)
      const milestones = [25, 50, 75, 90, 100];
      milestones.forEach((m) => {
        if (scrollPercent >= m && !milestonesFiredRef.current.has(m)) {
          milestonesFiredRef.current.add(m);
          analytics.track("scroll_milestone", {
            milestone: m,
            scrollDepth: scrollPercent,
            scrollY: scrollTop,
          });
        }
      });

      // Reset inactivity timeout (300ms). Timer ONLY exists while scrolling is active!
      if (scrollInactivityTimerRef.current)
        clearTimeout(scrollInactivityTimerRef.current);
      scrollInactivityTimerRef.current = setTimeout(() => {
        concludeScrollSegment();
      }, 300);
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
      // Section 64: Conclude active movement and scroll segments immediately before form submit
      concludeMouseSegment();
      concludeScrollSegment();

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
      concludeMouseSegment();
      concludeScrollSegment();

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

/**
 * AnalyticsTracker wrapper:
 * Strictly ensures tracking is ONLY enabled for anonymous, non-logged-in visitors.
 * If user is logged in (admin / authenticated), tracking is 100% disabled with 0 listeners.
 */
const AnalyticsTracker = () => {
  const { isAuthenticated } = useDataContext();

  // Check both React auth context and localStorage token
  const isUserLoggedIn =
    isAuthenticated ||
    (typeof window !== "undefined" && Boolean(localStorage.getItem("authToken")));

  if (isUserLoggedIn) {
    return null;
  }

  return <ActiveTracker />;
};

export default AnalyticsTracker;
