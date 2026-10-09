"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const DataContext = createContext();
export const useDataContext = () => useContext(DataContext);

// The session token lives in an httpOnly cookie that scripts cannot read.
// The browser only keeps this non-secret marker ({ role, expiresAt }) so it
// knows whether to ask /api/auth/session at all; public visitors never do.
export const ADMIN_MARKER_KEY = "adminSession";

function readMarker() {
  try {
    const marker = JSON.parse(localStorage.getItem(ADMIN_MARKER_KEY) || "null");
    if (marker?.expiresAt && Date.parse(marker.expiresAt) > Date.now()) {
      return marker;
    }
  } catch {
    // ignore malformed marker
  }
  return null;
}

function writeMarker(marker) {
  try {
    if (marker) localStorage.setItem(ADMIN_MARKER_KEY, JSON.stringify(marker));
    else localStorage.removeItem(ADMIN_MARKER_KEY);
  } catch {
    // storage unavailable (private mode); auth still works via the cookie
  }
}

function DataContextProvider(props) {
  // Initialize auth state - start with false, then check JWT token on client
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Global profile image state for real-time updates across all components
  const [globalProfileImage, setGlobalProfileImage] = useState(
    "/assets/img/profile.png"
  );

  const clearAuthState = useCallback(() => {
    writeMarker(null);
    setUserRole(null);
    setIsAuthenticated(false);
  }, []);

  // Confirm the cookie session with the server; the marker alone is a hint.
  const verifySession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const data = await response.json();
      if (data.authenticated) {
        writeMarker({ role: data.role, expiresAt: data.expiresAt });
        setUserRole(data.role);
        setIsAuthenticated(true);
        return true;
      }
    } catch {
      // network error: keep the optimistic state; API calls will 401 if stale
      return Boolean(readMarker());
    }
    clearAuthState();
    return false;
  }, [clearAuthState]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Tokens from the old localStorage scheme are no longer used.
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");

    const marker = readMarker();
    if (marker) {
      setUserRole(marker.role);
      setIsAuthenticated(true);
      verifySession();
    } else {
      writeMarker(null);
    }

    // Load saved profile image from localStorage if available
    const savedProfileImage = localStorage.getItem("profileImage");
    if (savedProfileImage) {
      setGlobalProfileImage(savedProfileImage);
    }

    setIsLoaded(true);
  }, [verifySession]);

  // Re-check every 5 minutes while logged in, so an expired or revoked
  // session logs the UI out.
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const interval = setInterval(verifySession, 300000);
    return () => clearInterval(interval);
  }, [isAuthenticated, verifySession]);

  // Update localStorage whenever profile image changes
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      localStorage.setItem("profileImage", globalProfileImage);
    }
  }, [globalProfileImage, isLoaded]);

  // Called after /api/auth/login succeeded (the cookie is already set).
  const login = useCallback((role = "admin", expiresAt) => {
    writeMarker({
      role,
      expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    setUserRole(role);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.log("Error during logout:", error);
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  // Check if user has specific permission
  const hasPermission = useCallback(
    (permission) => {
      if (!isAuthenticated || !userRole) return false;

      // Define role-based permissions
      const rolePermissions = {
        super_admin: [
          "read:portfolio",
          "write:portfolio",
          "delete:portfolio",
          "read:analytics",
          "read:visitors",
          "manage:users",
        ],
        admin: [
          "read:portfolio",
          "write:portfolio",
          "read:analytics",
          "read:visitors",
        ],
        editor: ["read:portfolio", "write:portfolio"],
        viewer: ["read:portfolio", "read:analytics"],
      };

      return rolePermissions[userRole]?.includes(permission) || false;
    },
    [isAuthenticated, userRole]
  );

  // Function to update profile image globally
  const updateProfileImage = useCallback((newImageUrl) => {
    setGlobalProfileImage(newImageUrl);

    // Also update localStorage immediately
    if (typeof window !== "undefined") {
      localStorage.setItem("profileImage", newImageUrl);
    }

    // Trigger a custom event so other components can listen for changes
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("profileImageUpdated", {
          detail: { imageUrl: newImageUrl },
        })
      );
    }
  }, []);

  // Kept for existing callers; the cookie carries authentication.
  const getAuthHeaders = useCallback(
    () => ({ "Content-Type": "application/json" }),
    []
  );

  // fetch wrapper for admin APIs: same-origin requests send the session
  // cookie automatically; a 401 means the session ended.
  const makeAuthenticatedRequest = useCallback(
    async (url, options = {}) => {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
        });

        if (response.status === 401) {
          clearAuthState();
          return { error: "Authentication failed", status: 401 };
        }

        return { response, status: response.status };
      } catch (error) {
        // Silent fail in production
        return { error: "Network error", status: 0 };
      }
    },
    [getAuthHeaders, clearAuthState]
  );

  // Re-check the session (used after a 401 or when a page mounts)
  const refreshAuth = useCallback(() => {
    if (typeof window === "undefined") return false;
    if (!readMarker()) {
      clearAuthState();
      return false;
    }
    verifySession();
    return true;
  }, [clearAuthState, verifySession]);

  const values = {
    auth: isAuthenticated,
    login,
    logout,
    isLoaded,
    userRole,
    hasPermission,
    getAuthHeaders,
    makeAuthenticatedRequest,
    refreshAuth,
    profileImage: globalProfileImage,
    updateProfileImage,
  };

  return (
    <DataContext.Provider value={values}>{props.children}</DataContext.Provider>
  );
}

export default DataContextProvider;
