/**
 * Trigger-Activated Mouse Movement Collector
 * Complies with Sections 54-59, 80-84:
 * - IDLE when still (0 active timers, 0 CPU work)
 * - Awakening on deliberate movement (>4px squared distance)
 * - RAF throttling with distance-squared and collinear curvature filtering
 * - Offline RDP trajectory simplification upon segment close
 */

import { simplifyTrajectory, getDistanceSq, isCollinear } from "@/Utils/analytics/trajectory";

export class MouseCollector {
  constructor(trackFn, getGovernorFn) {
    this.track = trackFn;
    this.getGovernor = getGovernorFn;
    this.mouseSegment = null;
    this.inactivityTimer = null;
    this.lastRestPos = null;
    this.rafPending = false;
    this.pendingMoveEvent = null;
    this.isTouchDevice = false;

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.processPointerMove = this.processPointerMove.bind(this);
    this.concludeSegment = this.concludeSegment.bind(this);
  }

  init() {
    if (typeof window === "undefined") return;

    this.isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

    // Touch devices bypass desktop mouse movement tracking to conserve battery & CPU
    if (this.isTouchDevice) return;

    window.addEventListener("pointermove", this.handleMouseMove, { passive: true });
  }

  destroy() {
    if (typeof window === "undefined") return;
    window.removeEventListener("pointermove", this.handleMouseMove);
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
    const seg = this.mouseSegment;
    if (!seg) return;
    this.mouseSegment = null;

    this.lastRestPos = { x: seg.lastX, y: seg.lastY };

    if (seg.points.length >= 2) {
      const now = Date.now();
      const duration = now - seg.startTime;
      const gov = this.getGovernor ? this.getGovernor() : "NORMAL";
      const epsilon = gov === "DEGRADED" ? 4.5 : gov === "PRESSURED" ? 3.2 : 2.0;
      const simplified = simplifyTrajectory(seg.points, epsilon);

      this.track("mouse_segment", {
        startTime: seg.startTime,
        duration,
        pointCount: simplified.length,
        rawCount: seg.points.length,
        points: simplified,
        endX: seg.lastX,
        endY: seg.lastY,
      });
    }
  }

  processPointerMove() {
    this.rafPending = false;
    if (!this.pendingMoveEvent) return;

    const { clientX, clientY, target } = this.pendingMoveEvent;
    this.pendingMoveEvent = null;

    const now = Date.now();
    const scrollY = Math.round(window.pageYOffset || document.documentElement.scrollTop || 0);

    // 1. IDLE -> MOUSE_ACTIVE transition check
    if (!this.mouseSegment) {
      let isDeliberate = true;
      if (this.lastRestPos) {
        const distRestSq = getDistanceSq(clientX, clientY, this.lastRestPos.x, this.lastRestPos.y);
        isDeliberate = distRestSq >= 16; // >4px movement threshold
      }

      if (isDeliberate) {
        this.mouseSegment = {
          startTime: now,
          points: [[0, clientX, clientY, scrollY]],
          lastSampleTime: now,
          lastX: clientX,
          lastY: clientY,
          target,
        };
      }
    } else {
      // 2. MOUSE_ACTIVE: sample meaningful trajectory using distance and curvature filtering
      const seg = this.mouseSegment;
      const deltaMs = now - seg.lastSampleTime;
      const distSq = getDistanceSq(clientX, clientY, seg.lastX, seg.lastY);

      const gov = this.getGovernor ? this.getGovernor() : "NORMAL";
      const minDistanceSq = gov === "DEGRADED" ? 64 : gov === "PRESSURED" ? 36 : 16;

      const isNearInteractive =
        target &&
        target.closest &&
        target.closest(
          "button, a, input, select, textarea, [role='button'], .nav-link, [data-analytics-id], [data-replay-id]"
        );
      const sampleThreshold = (isNearInteractive ? 60 : 90) * (gov === "DEGRADED" ? 1.5 : 1);

      if (deltaMs >= sampleThreshold && distSq >= minDistanceSq) {
        // Curvature filtering: if moving in a straight line, update vertex instead of piling redundant points
        if (seg.points.length >= 2) {
          const pA = seg.points[seg.points.length - 2];
          const pB = seg.points[seg.points.length - 1];
          if (isCollinear(pA[1], pA[2], pB[1], pB[2], clientX, clientY, 25)) {
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

        // Roll into next segment if bounded point count reached
        if (seg.points.length >= 25) {
          this.concludeSegment();
          this.mouseSegment = {
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

    // Inactivity timeout: 280ms threshold ONLY runs while pointer is moving
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => {
      this.concludeSegment();
    }, 280);
  }

  handleMouseMove(e) {
    if (this.isTouchDevice) return;

    this.pendingMoveEvent = {
      clientX: Math.round(e.clientX),
      clientY: Math.round(e.clientY),
      target: e.target,
    };

    if (!this.rafPending) {
      this.rafPending = true;
      requestAnimationFrame(this.processPointerMove);
    }
  }
}
