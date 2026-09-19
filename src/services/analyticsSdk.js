/**
 * Antigravity Analytics Client SDK — Compatibility Facade
 * Complies with Section 206:
 * Preserves existing public interfaces during refactoring.
 * Delegates seamlessly to modular src/services/analytics/ architecture.
 */

import analytics, {
  AnalyticsTrackerCore,
  EVENT_PRIORITIES,
  CRITICAL_EVENTS,
  getDeviceContext,
  detectDeviceType,
  sanitizeMetadata,
  isAdminLoggedIn,
  getOrCreateSessionId,
  getSessionDurationMs,
  performanceGovernor,
} from "./analytics";

export {
  analytics,
  AnalyticsTrackerCore,
  EVENT_PRIORITIES,
  CRITICAL_EVENTS,
  getDeviceContext,
  detectDeviceType,
  sanitizeMetadata,
  isAdminLoggedIn,
  getOrCreateSessionId,
  getSessionDurationMs,
  performanceGovernor,
};

export default analytics;
