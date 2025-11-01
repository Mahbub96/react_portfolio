"use client";
import { useEffect, useRef, useCallback } from "react";
import {
  createInteractionEvent,
  getComponentIdentifier,
  calculateScrollDepth,
  aggregateInteractions,
} from "@/services/interactionTracker";

const AnalyticsTracker = () => {
  const sessionIdRef = useRef(null);
  const pageRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastSaveTimeRef = useRef(null);

  // Enhanced tracking state with detailed interaction timeline
  const trackingDataRef = useRef({
    mouseEvents: {
      clicks: 0,
      moves: 0,
      scrolls: 0,
      mouseUps: 0,
      mouseDowns: 0,
      mouseWheels: 0,
    },
    keyboardEvents: {
      keyPresses: 0,
      keyDowns: 0,
      keyUps: 0,
    },
    totalClicksOnPage: 0,
    totalScrollDistance: 0,
    maxScrollDepth: 0,
    mouseHoldDuration: 0,
    componentsInteracted: [], // Enhanced with full interaction details
    clickPositions: [],
    mousePositions: [],
    interactionTimeline: [], // New: Timeline of all interactions
    browserEvents: {
      focus: 0,
      blur: 0,
      resize: 0,
      load: 0,
    },
    visibilityEvents: {
      hidden: 0,
      visible: 0,
      totalHiddenTime: 0,
      totalVisibleTime: 0,
    },
    lastMouseDownTime: null,
    // Enhanced: Track delays and idle time
    idlePeriods: [],
    activeTime: 0,
    lastActivityTime: null,
  });

  // Generate or retrieve session ID
  const getSessionId = useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!sessionIdRef.current) {
      let sessionId = sessionStorage.getItem("analytics_session_id");
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        sessionStorage.setItem("analytics_session_id", sessionId);
      }
      sessionIdRef.current = sessionId;
    }
    return sessionIdRef.current;
  }, []);

  // Detect device type
  const getDeviceType = useCallback(() => {
    if (typeof window === "undefined") return "unknown";
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        ua
      )
    ) {
      return "mobile";
    }
    return "desktop";
  }, []);

  // Get visitor info
  const getVisitorInfo = useCallback(() => {
    if (typeof window === "undefined") return null;

    return {
      userAgent: navigator.userAgent,
      language: navigator.language || navigator.userLanguage,
      platform: navigator.platform || "Unknown",
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || "direct",
      deviceType: getDeviceType(),
    };
  }, [getDeviceType]);

  // Save analytics data to API
  const saveAnalytics = useCallback(
    async (isExit = false) => {
      if (typeof window === "undefined") return;

      const sessionId = getSessionId();
      const page = window.location.pathname;
      const now = Date.now();

      if (!sessionId || !page) return;

      // Calculate time on page
      const timeOnPage = startTimeRef.current ? now - startTimeRef.current : 0;

      // Throttle saves (max once every 5 seconds unless it's an exit)
      if (
        !isExit &&
        lastSaveTimeRef.current &&
        now - lastSaveTimeRef.current < 5000
      ) {
        return;
      }
      lastSaveTimeRef.current = now;

      const data = {
        sessionId,
        page,
        ...getVisitorInfo(),
        timeOnPage,
        entryTimestamp: startTimeRef.current
          ? new Date(startTimeRef.current)
          : new Date(),
        exitTimestamp: isExit ? new Date() : null,
        ...trackingDataRef.current,
        // Convert arrays to limited samples for storage
        clickPositions: trackingDataRef.current.clickPositions.slice(-50), // Last 50 clicks
        mousePositions: trackingDataRef.current.mousePositions.slice(-100), // Last 100 positions
        componentsInteracted:
          trackingDataRef.current.componentsInteracted.slice(-100), // Last 100 interactions
        // Enhanced: Aggregate interactions for efficient storage
        aggregatedInteractions: aggregateInteractions(
          trackingDataRef.current.interactionTimeline.slice(-500) // Last 500 events
        ),
        interactionTimeline:
          trackingDataRef.current.interactionTimeline.slice(-100), // Last 100 timeline events
        idlePeriods: trackingDataRef.current.idlePeriods.slice(-20), // Last 20 idle periods
        activeTime: Date.now() - (startTimeRef.current || Date.now()),
      };

      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } catch (error) {
        // Silent fail in production
      }
    },
    [getSessionId, getVisitorInfo]
  );

  // Track component interaction
  const trackComponentInteraction = useCallback(
    (componentName, interactionType = "click", metadata = {}) => {
      if (typeof window === "undefined") return;

      // Ensure componentName is always a string, never an object
      let componentStr = "unknown";
      if (componentName) {
        if (typeof componentName === "string") {
          componentStr = componentName;
        } else if (typeof componentName === "object") {
          // If it's an object, convert to string
          componentStr = JSON.stringify(componentName).substring(0, 100);
        } else {
          componentStr = String(componentName);
        }
      }

      trackingDataRef.current.componentsInteracted.push({
        component: componentStr,
        interactionType:
          typeof interactionType === "string" ? interactionType : "click",
        timestamp: new Date(),
        metadata: {
          ...(typeof metadata === "object" && metadata !== null
            ? metadata
            : {}),
          page: window.location.pathname,
        },
      });

      // Removed automatic saveAnalytics() call - user will trigger manually
    },
    []
  );

  // Setup event listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sessionId = getSessionId();
    const page = window.location.pathname;

    if (!sessionId || !page) return;

    pageRef.current = page;
    startTimeRef.current = Date.now();

    // Mouse events
    const handleClick = (e) => {
      trackingDataRef.current.mouseEvents.clicks++;
      trackingDataRef.current.totalClicksOnPage++;

      // Track click position
      trackingDataRef.current.clickPositions.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: new Date(),
      });

      // Enhanced component interaction tracking with full metadata
      const target = e.target;
      if (target) {
        const componentName = getComponentIdentifier(target);

        // Create detailed interaction event
        const interactionEvent = createInteractionEvent(
          "click",
          target,
          { x: e.clientX, y: e.clientY },
          {
            delay: trackingDataRef.current.lastActivityTime
              ? Date.now() - trackingDataRef.current.lastActivityTime
              : 0,
          }
        );

        // Add to timeline
        trackingDataRef.current.interactionTimeline.push(interactionEvent);

        // Track idle periods (delay > 2 seconds)
        if (interactionEvent.delay > 2000) {
          trackingDataRef.current.idlePeriods.push({
            duration: interactionEvent.delay,
            timestamp: interactionEvent.timestamp,
            beforeComponent: componentName,
          });
        }

        trackingDataRef.current.lastActivityTime = Date.now();

        trackComponentInteraction(componentName, "click", {
          x: e.clientX,
          y: e.clientY,
          tag: target.tagName,
          id: target.id,
          class: typeof target.className === "string" ? target.className : "",
          delay: interactionEvent.delay,
          scrollDepth: calculateScrollDepth(),
        });
      }
      // Removed automatic saveAnalytics() call - user will trigger manually
    };

    const handleMouseMove = (e) => {
      trackingDataRef.current.mouseEvents.moves++;

      // Sample mouse positions (every 10th move to avoid too much data)
      if (trackingDataRef.current.mouseEvents.moves % 10 === 0) {
        trackingDataRef.current.mousePositions.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: new Date(),
        });
      }
    };

    const handleMouseDown = () => {
      trackingDataRef.current.mouseEvents.mouseDowns++;
      trackingDataRef.current.lastMouseDownTime = Date.now();
    };

    const handleMouseUp = () => {
      trackingDataRef.current.mouseEvents.mouseUps++;
      if (trackingDataRef.current.lastMouseDownTime) {
        const holdDuration =
          Date.now() - trackingDataRef.current.lastMouseDownTime;
        trackingDataRef.current.mouseHoldDuration += holdDuration;
        trackingDataRef.current.lastMouseDownTime = null;
      }
    };

    const handleScroll = () => {
      trackingDataRef.current.mouseEvents.scrolls++;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent =
        scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      trackingDataRef.current.maxScrollDepth = Math.max(
        trackingDataRef.current.maxScrollDepth,
        scrollPercent
      );

      const scrollDelta = Math.abs(
        scrollTop - (trackingDataRef.current.lastScrollTop || 0)
      );
      trackingDataRef.current.totalScrollDistance += scrollDelta;
      trackingDataRef.current.lastScrollTop = scrollTop;
    };

    const handleWheel = () => {
      trackingDataRef.current.mouseEvents.mouseWheels++;
    };

    // Keyboard events
    const handleKeyPress = () => {
      trackingDataRef.current.keyboardEvents.keyPresses++;
    };

    const handleKeyDown = () => {
      trackingDataRef.current.keyboardEvents.keyDowns++;
    };

    const handleKeyUp = () => {
      trackingDataRef.current.keyboardEvents.keyUps++;
    };

    // Browser events
    const handleFocus = () => {
      trackingDataRef.current.browserEvents.focus++;
    };

    const handleBlur = () => {
      trackingDataRef.current.browserEvents.blur++;
    };

    const handleResize = () => {
      trackingDataRef.current.browserEvents.resize++;
    };

    const handleLoad = () => {
      trackingDataRef.current.browserEvents.load++;
    };

    // Visibility events
    let visibilityStartTime = Date.now();
    let isHidden = false;

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.hidden) {
        if (!isHidden) {
          trackingDataRef.current.visibilityEvents.hidden++;
          visibilityStartTime = now;
          isHidden = true;
        }
      } else {
        if (isHidden) {
          trackingDataRef.current.visibilityEvents.visible++;
          trackingDataRef.current.visibilityEvents.totalHiddenTime +=
            now - visibilityStartTime;
          isHidden = false;
        }
      }
    };

    // Attach event listeners
    document.addEventListener("click", handleClick);
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("wheel", handleWheel, { passive: true });
    document.addEventListener("keypress", handleKeyPress);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("resize", handleResize);
    window.addEventListener("load", handleLoad);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Removed automatic periodic saves - user will trigger manually
    // Only save on page unload (exit tracking)
    const handleBeforeUnload = () => {
      saveAnalytics(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    // Removed initial save - user will trigger manually

    // Cleanup
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("scroll", handleScroll);
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keypress", handleKeyPress);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", handleLoad);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);

      // Only save on cleanup (page exit)
      saveAnalytics(true);
    };
  }, [getSessionId, saveAnalytics, trackComponentInteraction]);

  // Track page changes (Next.js router)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleRouteChange = () => {
      // Save current page data before navigation
      if (pageRef.current) {
        saveAnalytics(true);
      }

      // Reset for new page
      pageRef.current = window.location.pathname;
      startTimeRef.current = Date.now();
      trackingDataRef.current = {
        ...trackingDataRef.current,
        clickPositions: [],
        mousePositions: [],
        componentsInteracted: [],
        maxScrollDepth: 0,
        totalScrollDistance: 0,
      };
    };

    // Listen to popstate for browser back/forward
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      // Only save on cleanup (page exit)
      saveAnalytics(true);
    };
  }, [saveAnalytics]);

  return null; // This component doesn't render anything
};

export default AnalyticsTracker;
