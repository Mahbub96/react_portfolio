/**
 * Asynchronous Non-Blocking HTTP & Beacon Transport
 * Complies with Sections 71, 72, 101, 102, 106:
 * - Asynchronous HTTP POST with keepalive: true
 * - navigator.sendBeacon on visibilitychange / pagehide
 * - Never synchronous XHR
 * - Session metadata separation to shrink payloads by >40%
 */

export class HttpTransport {
  constructor(endpoint = "/api/analytics/batch") {
    this.endpoint = endpoint;
    this.offlineStorageKey = "analytics_offline_queue";
  }

  /**
   * Send batch asynchronously
   */
  async send(events, sessionContext, useBeacon = false) {
    if (!Array.isArray(events) || events.length === 0) return true;

    // Separate top-level session metadata from individual events (Section 106)
    const baseSessionId = sessionContext.sessionId;
    const baseDeviceContext = sessionContext.deviceContext;
    const basePage = sessionContext.page || (typeof window !== "undefined" ? window.location.pathname : "/");

    const sanitizedBatch = events.map(
      ({ _priority, _bytes, sessionId, deviceContext, page, ...rest }) => ({
        ...rest,
        ...(page && page !== basePage ? { page } : {}),
      })
    );

    const payload = JSON.stringify({
      sessionId: baseSessionId,
      deviceContext: baseDeviceContext,
      page: basePage,
      events: sanitizedBatch,
      sentAt: new Date().toISOString(),
    });

    // 1. Prefer sendBeacon on pagehide/exit
    if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const success = navigator.sendBeacon(this.endpoint, blob);
      if (success) return true;
    }

    // 2. Non-blocking asynchronous fetch with keepalive
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return true;
  }

  saveOffline(events) {
    if (typeof window === "undefined" || !Array.isArray(events) || events.length === 0) return;
    try {
      const existing = JSON.parse(sessionStorage.getItem(this.offlineStorageKey) || "[]");
      const highPriorityOnly = [...existing, ...events]
        .filter((e) => (e._priority || 2) <= 2)
        .slice(-50);
      sessionStorage.setItem(this.offlineStorageKey, JSON.stringify(highPriorityOnly));
    } catch {
      // Ignore
    }
  }

  restoreOffline() {
    if (typeof window === "undefined") return [];
    try {
      const stored = sessionStorage.getItem(this.offlineStorageKey);
      if (stored) {
        sessionStorage.removeItem(this.offlineStorageKey);
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch {
      // Ignore
    }
    return [];
  }
}
