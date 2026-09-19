/**
 * Antigravity Analytics Service — Main Modular Entry Point
 * Complies with Section 204:
 * Re-exports canonical singleton and modular building blocks
 */

import { AnalyticsTrackerCore } from "./core/tracker";

export const analytics = new AnalyticsTrackerCore();
export default analytics;

export { AnalyticsTrackerCore } from "./core/tracker";
export { EVENT_PRIORITIES, CRITICAL_EVENTS } from "./core/constants";
export { getDeviceContext, detectDeviceType } from "./core/device";
export { sanitizeMetadata } from "./core/sanitizer";
export { isAdminLoggedIn, getOrCreateSessionId, getSessionDurationMs } from "./core/session";
export { performanceGovernor } from "./performance/governor";
export { MouseCollector } from "./collectors/mouseCollector";
export { ScrollCollector } from "./collectors/scrollCollector";
export { InteractionCollector } from "./collectors/interactionCollector";
export { FormCollector } from "./collectors/formCollector";
export { getElementIdentifier, isSensitiveInput } from "./collectors/elementResolver";
