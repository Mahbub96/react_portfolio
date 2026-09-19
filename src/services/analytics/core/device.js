/**
 * Device & Environment Context Extractor
 * Pure browser environment detection with lightweight caching
 */

let cachedDeviceContext = null;

export function detectDeviceType() {
  if (typeof window === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|windows ce|iemobile/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

export function getDeviceContext() {
  if (cachedDeviceContext) return cachedDeviceContext;
  if (typeof window === "undefined") return {};

  cachedDeviceContext = {
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || "en",
    platform: navigator.platform || "unknown",
    userAgent: navigator.userAgent || "",
    deviceType: detectDeviceType(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };
  return cachedDeviceContext;
}

export function clearDeviceContextCache() {
  cachedDeviceContext = null;
}
