/**
 * Session Identity & Authentication Lifecycle Manager
 * Only tracks non-logged in anonymous visitors
 */

export const SESSION_STORAGE_KEY = "analytics_session_id";
export const SESSION_START_KEY = "analytics_session_start";
export const OPT_OUT_KEY = "analytics_opt_out";

/**
 * Check whether current client is logged in as an authenticated admin
 */
export function isAdminLoggedIn() {
  if (typeof window === "undefined") return false;
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return false;
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false;
      }
    }
    return true;
  } catch {
    return Boolean(localStorage.getItem("authToken"));
  }
}

/**
 * Get or create a session ID
 */
export function getOrCreateSessionId() {
  if (typeof window === "undefined" || isAdminLoggedIn()) return null;

  try {
    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
      sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    }
    return sessionId;
  } catch {
    return `fallback_${Date.now()}`;
  }
}

/**
 * Get current session duration in milliseconds
 */
export function getSessionDurationMs() {
  if (typeof window === "undefined") return 0;
  try {
    const sessionStart = parseInt(sessionStorage.getItem(SESSION_START_KEY) || "0", 10);
    return sessionStart > 0 ? Date.now() - sessionStart : 0;
  } catch {
    return 0;
  }
}

/**
 * Clear session from storage
 */
export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_START_KEY);
  } catch {
    // Ignore
  }
}
