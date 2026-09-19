"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import analytics, {
  isAdminLoggedIn,
  MouseCollector,
  ScrollCollector,
  InteractionCollector,
  FormCollector,
  getElementIdentifier,
} from "@/services/analytics";
import { useDataContext } from "@/contexts/useAllContext";

/**
 * AnalyticsTracker — Lightweight React Lifecycle Integration Component
 * Complies with Section 208:
 * - Extremely thin React integration layer
 * - Connects collectors to browser lifecycle
 * - Observes page/route changes and portfolio section views
 * - Performs immediate zero-overhead bail-out if logged in as admin
 */
const ActiveTracker = () => {
  const pathname = usePathname();
  const mouseCollectorRef = useRef(null);
  const scrollCollectorRef = useRef(null);
  const interactionCollectorRef = useRef(null);
  const formCollectorRef = useRef(null);
  const sectionObserversRef = useRef([]);

  // Initialize analytics collectors on mount
  useEffect(() => {
    analytics.init({
      endpoint: "/api/analytics/batch",
      batchInterval: 4000,
      maxBatchSize: 25,
    });

    const onCriticalAction = () => {
      mouseCollectorRef.current?.concludeSegment();
      scrollCollectorRef.current?.concludeSegment();
    };

    const mouseCollector = new MouseCollector(analytics.track, analytics.getGovernorState);
    const scrollCollector = new ScrollCollector(analytics.track);
    const interactionCollector = new InteractionCollector(analytics.track, onCriticalAction);
    const formCollector = new FormCollector(analytics.track, onCriticalAction);

    mouseCollectorRef.current = mouseCollector;
    scrollCollectorRef.current = scrollCollector;
    interactionCollectorRef.current = interactionCollector;
    formCollectorRef.current = formCollector;

    mouseCollector.init();
    scrollCollector.init();
    interactionCollector.init();
    formCollector.init();

    return () => {
      mouseCollector.destroy();
      scrollCollector.destroy();
      interactionCollector.destroy();
      formCollector.destroy();
    };
  }, []);

  // Track page navigation and observe portfolio section views on route change
  useEffect(() => {
    // Finalize ongoing segments on page transition
    mouseCollectorRef.current?.concludeSegment();
    scrollCollectorRef.current?.concludeSegment();

    // Track page view
    analytics.page(pathname, {
      title: typeof document !== "undefined" ? document.title : "",
    });

    // Cleanup previous observers
    sectionObserversRef.current.forEach((obs) => obs.disconnect());
    sectionObserversRef.current = [];

    // Observe portfolio sections for section_view dwell time
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

    // Observe forms for form_view
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      const formId = getElementIdentifier(form);
      const formObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              analytics.track("form_view", { formId }, formId);
              formObserver.disconnect();
            }
          });
        },
        { threshold: 0.2 }
      );
      formObserver.observe(form);
      sectionObserversRef.current.push(formObserver);
    });

    return () => {
      sectionObserversRef.current.forEach((obs) => obs.disconnect());
      sectionObserversRef.current = [];
    };
  }, [pathname]);

  return null;
};

/**
 * AnalyticsTracker wrapper:
 * Only mounts tracker if NOT logged in as admin
 */
const AnalyticsTracker = () => {
  const { isLogIn } = useDataContext();

  if (isLogIn || isAdminLoggedIn()) {
    return null;
  }

  return <ActiveTracker />;
};

export default AnalyticsTracker;
