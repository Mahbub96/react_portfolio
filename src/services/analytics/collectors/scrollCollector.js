/**
 * Trigger-Activated Scroll Collector
 * Complies with Sections 61 & 144:
 * - IDLE when still (0 active timers, 0 CPU work)
 * - Awakening on scroll event
 * - Seals segment into scroll_segment upon 300ms stillness
 * - Milestone tracking & max depth recording
 */

export class ScrollCollector {
  constructor(trackFn) {
    this.track = trackFn;
    this.scrollSegment = null;
    this.inactivityTimer = null;
    this.milestonesFired = new Set();
    this.maxScrollDepth = 0;

    this.handleScroll = this.handleScroll.bind(this);
    this.concludeSegment = this.concludeSegment.bind(this);
  }

  init() {
    if (typeof window === "undefined") return;
    window.addEventListener("scroll", this.handleScroll, { passive: true });
  }

  destroy() {
    if (typeof window === "undefined") return;
    window.removeEventListener("scroll", this.handleScroll);
    this.concludeSegment();
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  concludeSegment() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    const seg = this.scrollSegment;
    if (!seg) return;
    this.scrollSegment = null;

    const duration = Date.now() - seg.startTime;
    const distance = Math.abs(seg.lastY - seg.startY);

    if (seg.samples.length >= 2 || distance > 20) {
      const scrollSpeed = duration > 0 ? (distance / duration) * 1000 : 0;
      if (scrollSpeed > 2500 && distance > 600) {
        this.track("rapid_scroll", {
          speedPxPerSec: Math.round(scrollSpeed),
          distancePx: distance,
          durationMs: duration,
        });
      }

      this.track("scroll_segment", {
        startTime: seg.startTime,
        duration,
        startY: seg.startY,
        endY: seg.lastY,
        distance,
        maxDepth: seg.maxDepth,
        sampleCount: seg.samples.length,
        samples: seg.samples,
      });
    }
  }

  handleScroll() {
    const now = Date.now();
    const scrollTop = Math.round(window.pageYOffset || document.documentElement.scrollTop || 0);
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollHeight <= 0) return;

    const scrollPercent = Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));

    // State transition: SCROLL_IDLE -> SCROLL_ACTIVE
    if (!this.scrollSegment) {
      this.scrollSegment = {
        startTime: now,
        startY: scrollTop,
        lastY: scrollTop,
        maxDepth: scrollPercent,
        samples: [[0, scrollTop, scrollPercent]],
        lastSampleTime: now,
      };
    } else {
      const seg = this.scrollSegment;
      if (now - seg.lastSampleTime >= 100) {
        seg.lastSampleTime = now;
        seg.lastY = scrollTop;
        seg.samples.push([now - seg.startTime, scrollTop, scrollPercent]);
        if (scrollPercent > seg.maxDepth) {
          seg.maxDepth = scrollPercent;
        }
      }
    }

    if (scrollPercent > this.maxScrollDepth) {
      this.maxScrollDepth = scrollPercent;
    }

    // Milestones (25, 50, 75, 90, 100)
    const milestones = [25, 50, 75, 90, 100];
    milestones.forEach((m) => {
      if (scrollPercent >= m && !this.milestonesFired.has(m)) {
        this.milestonesFired.add(m);
        this.track("scroll_milestone", {
          milestone: m,
          scrollDepth: scrollPercent,
          scrollY: scrollTop,
        });
      }
    });

    // Inactivity timeout: 300ms threshold ONLY runs while scrolling
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => {
      this.concludeSegment();
    }, 300);
  }
}
