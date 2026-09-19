/**
 * Core Analytics Engine Orchestrator
 * Complies with Sections 71-78, 137, 148, 204:
 * - Framework-independent runtime orchestrating collectors, buffer, and transport
 * - requestIdleCallback background scheduling
 * - Event-driven: completely idle when no user activity occurs
 */

import { EVENT_PRIORITIES, CRITICAL_EVENTS } from "./constants";
import { getDeviceContext } from "./device";
import { sanitizeMetadata } from "./sanitizer";
import {
  isAdminLoggedIn,
  getOrCreateSessionId,
  getSessionDurationMs,
  clearSession,
  OPT_OUT_KEY,
} from "./session";
import { EventBuffer } from "../buffering/eventBuffer";
import { HttpTransport } from "../transport/httpTransport";
import { RetryPolicy } from "../transport/retryPolicy";
import { performanceGovernor } from "../performance/governor";

export class AnalyticsTrackerCore {
  constructor(options = {}) {
    this.endpoint = options.endpoint || "/api/analytics/batch";
    this.batchInterval = options.batchInterval || 4000;
    this.maxBatchSize = options.maxBatchSize || 25;
    this.maxBatchBytes = options.maxBatchBytes || 24 * 1024;

    this.buffer = new EventBuffer(64 * 1024, 50);
    this.transport = new HttpTransport(this.endpoint);
    this.retryPolicy = new RetryPolicy();

    this.sessionId = null;
    this.userId = null;
    this.userTraits = {};
    this.isOptedOut = false;
    this.isFlushing = false;
    this.flushTimer = null;
    this.isOffline = false;
    this.initialized = false;

    // Bind public methods
    this.track = this.track.bind(this);
    this.page = this.page.bind(this);
    this.identify = this.identify.bind(this);
    this.flush = this.flush.bind(this);
    this.startSession = this.startSession.bind(this);
    this.endSession = this.endSession.bind(this);
    this.optOut = this.optOut.bind(this);
    this.getGovernorState = this.getGovernorState.bind(this);
    this.getBufferPressure = this.getBufferPressure.bind(this);
    this.runIdle = this.runIdle.bind(this);
    this.scheduleFlush = this.scheduleFlush.bind(this);
    this.scheduleImmediateFlush = this.scheduleImmediateFlush.bind(this);
  }

  isLoggedIn() {
    return isAdminLoggedIn();
  }

  getGovernorState() {
    return performanceGovernor.getGovernorState(this.buffer.bytes, this.buffer.maxBufferBytes);
  }

  getBufferPressure() {
    return this.buffer.getPressure();
  }

  get bufferBytes() {
    return this.buffer.bytes;
  }

  get queue() {
    return this.buffer.queue;
  }

  set queue(val) {
    this.buffer.queue = val;
  }

  runIdle(callback) {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 50);
    }
  }

  init(options = {}) {
    if (typeof window === "undefined" || this.initialized) return this;

    if (options.endpoint) this.endpoint = options.endpoint;
    if (options.batchInterval) this.batchInterval = options.batchInterval;
    if (options.maxBatchSize) this.maxBatchSize = options.maxBatchSize;

    // Check opt-out status
    try {
      if (localStorage.getItem(OPT_OUT_KEY) === "true") {
        this.isOptedOut = true;
      }
    } catch {
      // Ignore
    }

    if (this.isLoggedIn()) {
      this.buffer.clear();
      return this;
    }

    this.sessionId = this.startSession();

    // Restore offline queue in idle callback
    this.runIdle(() => {
      const offlineEvents = this.transport.restoreOffline();
      if (offlineEvents.length > 0) {
        offlineEvents.forEach((ev) => this.buffer.push(ev));
        if (this.buffer.length > 0) this.scheduleFlush();
      }
    });

    // Network listeners
    window.addEventListener("online", () => {
      this.isOffline = false;
      this.retryPolicy.recordSuccess();
      this.flush();
    });

    window.addEventListener("offline", () => {
      this.isOffline = true;
    });

    // Lifecycle exits using sendBeacon / keepalive
    const handleExit = () => this.flush(true);
    window.addEventListener("pagehide", handleExit, { passive: true });
    window.addEventListener("beforeunload", handleExit, { passive: true });
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.visibilityState === "hidden") {
          this.flush(true);
        }
      },
      { passive: true }
    );

    this.initialized = true;
    return this;
  }

  startSession() {
    if (typeof window === "undefined" || this.isLoggedIn()) return null;

    const sessionId = getOrCreateSessionId();
    this.sessionId = sessionId;

    return sessionId;
  }

  endSession() {
    if (typeof window === "undefined" || !this.sessionId) return;

    this.track("session_end", {
      exitPage: window.location.pathname,
      sessionDurationMs: getSessionDurationMs(),
    });

    this.flush(true);
    clearSession();
    this.sessionId = null;
  }

  optOut(status = true) {
    this.isOptedOut = Boolean(status);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(OPT_OUT_KEY, this.isOptedOut ? "true" : "false");
      }
    } catch {
      // Ignore
    }
    if (this.isOptedOut) {
      this.buffer.clear();
    }
  }

  identify(userId, traits = {}) {
    this.userId = userId;
    this.userTraits = { ...this.userTraits, ...traits };
  }

  /**
   * Free event handler tracking (<1 microsecond execution)
   */
  track(eventType, metadata = {}, elementId = null) {
    try {
      if (this.isOptedOut || typeof window === "undefined" || this.isLoggedIn()) return;

      if (!this.sessionId) {
        this.startSession();
      }

      const priority = EVENT_PRIORITIES[eventType] || 2;
      const governor = this.getGovernorState();

      // Governor load shedding
      if (governor === "MINIMAL" && priority >= 3) return;
      if (governor === "DEGRADED" && priority >= 3 && eventType !== "mouse_segment") return;

      // Fast serialization byte estimate
      const metaStr = JSON.stringify(metadata || {});
      const eventBytes = 90 + metaStr.length + (elementId ? String(elementId).length : 0);

      const event = {
        sessionId: this.sessionId,
        eventType,
        page: window.location.pathname,
        elementId: elementId ? String(elementId).substring(0, 150) : null,
        timestamp: new Date().toISOString(),
        metadata: sanitizeMetadata(metadata),
        _priority: priority,
        _bytes: eventBytes,
      };

      if (this.userId) {
        event.userId = this.userId;
      }

      const accepted = this.buffer.push(event);
      if (!accepted) return;

      // Immediate flush override for critical events, byte ceiling, or max count
      if (
        CRITICAL_EVENTS.has(eventType) ||
        this.buffer.bytes >= this.maxBatchBytes ||
        this.buffer.length >= this.maxBatchSize
      ) {
        this.scheduleImmediateFlush();
      } else {
        this.scheduleFlush(this.batchInterval);
      }
    } catch {
      // Never throw into application
    }
  }

  page(pageName = null, metadata = {}) {
    const p = pageName || (typeof window !== "undefined" ? window.location.pathname : "/");
    this.track("page_view", {
      page: p,
      title: typeof document !== "undefined" ? document.title : "",
      referrer: typeof document !== "undefined" ? document.referrer || "direct" : "direct",
      ...metadata,
    });
  }

  async flush(useBeacon = false) {
    if (this.isLoggedIn()) {
      this.buffer.clear();
      return;
    }

    if (this.buffer.length === 0 || this.isOptedOut || this.isFlushing) return;

    try {
      // Offline fallback
      if ((typeof navigator !== "undefined" && !navigator.onLine) || this.isOffline) {
        this.transport.saveOffline(this.buffer.queue);
        this.buffer.clear();
        return;
      }

      const batch = this.buffer.extractBatch(this.maxBatchBytes, this.maxBatchSize);
      if (batch.length === 0) return;

      const sessionContext = {
        sessionId: this.sessionId,
        deviceContext: getDeviceContext(),
        page: typeof window !== "undefined" ? window.location.pathname : "/",
      };

      this.isFlushing = true;
      await this.transport.send(batch, sessionContext, useBeacon);

      this.retryPolicy.recordSuccess();

      // Schedule next flush if items remain; otherwise remain dormant
      if (this.buffer.length > 0) {
        this.scheduleFlush(this.batchInterval);
      }
    } catch (error) {
      this.retryPolicy.recordFailure();
    } finally {
      this.isFlushing = false;
    }
  }

  scheduleFlush(delayMs = this.batchInterval) {
    if (this.flushTimer || typeof window === "undefined" || this.isLoggedIn()) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.runIdle(() => this.flush(false));
    }, delayMs);
  }

  scheduleImmediateFlush() {
    if (typeof window === "undefined" || this.isLoggedIn()) return;
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.runIdle(() => this.flush(false));
  }
}
