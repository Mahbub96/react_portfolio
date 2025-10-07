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

// Helper function to safely decode JWT payload
function decodeJWTPayload(token) {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Use proper base64 decoding with padding
    const payload = parts[1];
    // Add padding if needed
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);

    try {
      // Try using atob first (browser environment)
      if (typeof atob !== "undefined") {
        const decoded = atob(
          paddedPayload.replace(/-/g, "+").replace(/_/g, "/")
        );
        return JSON.parse(decoded);
      } else {
        // Fallback for Node.js environment
        const decoded = Buffer.from(paddedPayload, "base64").toString("utf8");
        return JSON.parse(decoded);
      }
    } catch (decodeError) {
      console.error("JWT decode error:", decodeError);
      return null;
    }
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
}

// Helper function to check if token needs refresh (within 5 minutes of expiry)
function shouldRefreshToken(payload) {
  if (!payload || !payload.exp) return false;
  const currentTime = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = payload.exp - currentTime;
  return timeUntilExpiry < 300; // 5 minutes
}

// Helper function to validate token structure
function isValidTokenStructure(payload) {
  // More lenient validation - only require exp field
  return (
    payload &&
    typeof payload === "object" &&
    payload.exp &&
    typeof payload.exp === "number"
  );
}

function DataContextProvider(props) {
  // Initialize auth state - start with false, then check JWT token on client
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Global profile image state for real-time updates across all components
  const [globalProfileImage, setGlobalProfileImage] = useState(
    "/assets/img/profile.png"
  );

  // Check JWT token on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");

      console.log("Checking stored token:", token ? "exists" : "none");
      console.log("Stored role:", role);

      if (token && role) {
        // Verify token validity using proper JWT decoding
        const payload = decodeJWTPayload(token);

        console.log("Decoded token payload:", payload);

        if (payload && isValidTokenStructure(payload)) {
          const currentTime = Math.floor(Date.now() / 1000);

          console.log("Token expiry:", payload.exp);
          console.log("Current time:", currentTime);
          console.log("Token valid:", payload.exp > currentTime);

          if (payload.exp > currentTime) {
            // Token is valid
            setAuthToken(token);
            setUserRole(role);
            setIsAuthenticated(true);

            // Check if token needs refresh
            if (shouldRefreshToken(payload)) {
              console.log("Token needs refresh, attempting to refresh...");
              // In a real app, you'd call a refresh endpoint here
              // For now, we'll just log it
            }
          } else {
            // Token expired, clear it
            console.log("JWT token expired, clearing authentication");
            localStorage.removeItem("authToken");
            localStorage.removeItem("userRole");
            setIsAuthenticated(false);
          }
        } else {
          // Invalid token structure, clear it
          console.log("Invalid JWT token structure, clearing authentication");
          console.log(
            "Expected structure: { exp: number, username: string, role: string }"
          );
          console.log("Received:", payload);
          localStorage.removeItem("authToken");
          localStorage.removeItem("userRole");
          setIsAuthenticated(false);
        }
      }

      // Load saved profile image from localStorage if available
      const savedProfileImage = localStorage.getItem("profileImage");
      if (savedProfileImage) {
        setGlobalProfileImage(savedProfileImage);
      }

      setIsLoaded(true);
    }
  }, []);

  // Set up token validation interval - only check every 5 minutes to reduce unnecessary API calls
  useEffect(() => {
    if (!isAuthenticated || !authToken) return;

    const interval = setInterval(() => {
      const payload = decodeJWTPayload(authToken);

      if (payload && isValidTokenStructure(payload)) {
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp <= currentTime) {
          // Token expired, logout user
          console.log("Token expired during session, logging out");
          logout();
        } else if (shouldRefreshToken(payload)) {
          console.log("Token needs refresh, attempting to refresh...");
          // In a real app, you'd call a refresh endpoint here
        }
      } else {
        // Invalid token structure, logout user
        console.log("Invalid token structure during session, logging out");
        logout();
      }
    }, 300000); // Check every 5 minutes instead of every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, authToken]);

  // Update localStorage whenever auth state changes
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      if (isAuthenticated && authToken && userRole) {
        localStorage.setItem("authToken", authToken);
        localStorage.setItem("userRole", userRole);
      } else {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
      }
    }
  }, [isAuthenticated, authToken, userRole, isLoaded]);

  // Update localStorage whenever profile image changes
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      localStorage.setItem("profileImage", globalProfileImage);
    }
  }, [globalProfileImage, isLoaded]);

  const login = (token, role) => {
    setAuthToken(token);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Track logout event in database
      if (typeof window !== "undefined" && authToken) {
        const payload = decodeJWTPayload(authToken);

        if (payload && payload.username) {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              username: payload.username,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              reason: "user_logout",
            }),
          });
        }
      }
    } catch (error) {
      console.error("Error tracking logout:", error);
    } finally {
      setAuthToken(null);
      setUserRole(null);
      setIsAuthenticated(false);

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
      }
    }
  };

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

  // Get auth headers for API calls
  const getAuthHeaders = useCallback(() => {
    if (authToken) {
      return {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      };
    }
    return { "Content-Type": "application/json" };
  }, [authToken]);

  // Enhanced API call function with better error handling
  const makeAuthenticatedRequest = useCallback(
    async (url, options = {}) => {
      try {
        const headers = getAuthHeaders();
        console.log("Making authenticated request to:", url);
        console.log("Auth headers:", headers);

        const response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
        });

        console.log("Response status:", response.status);

        if (response.status === 401) {
          console.log("Received 401 response, checking token validity...");
          // Check if token is actually expired or just invalid
          const payload = decodeJWTPayload(authToken);
          console.log("Token payload on 401:", payload);

          if (payload && isValidTokenStructure(payload)) {
            const currentTime = Math.floor(Date.now() / 1000);
            console.log(
              "Token expiry:",
              payload.exp,
              "Current time:",
              currentTime
            );

            if (payload.exp <= currentTime) {
              // Token is actually expired, logout user
              console.log("Token expired, logging out user");
              logout();
              return { error: "Token expired", status: 401 };
            }
          }
          // Token might be invalid but not expired, return error without logout
          console.log(
            "Token invalid but not expired, returning error without logout"
          );
          return { error: "Authentication failed", status: 401 };
        }

        return { response, status: response.status };
      } catch (error) {
        console.error("API request error:", error);
        return { error: "Network error", status: 0 };
      }
    },
    [authToken, getAuthHeaders, logout]
  );

  // Function to refresh authentication state
  const refreshAuth = useCallback(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");

      if (token && role) {
        const payload = decodeJWTPayload(token);
        if (payload && isValidTokenStructure(payload)) {
          const currentTime = Math.floor(Date.now() / 1000);
          if (payload.exp > currentTime) {
            setAuthToken(token);
            setUserRole(role);
            setIsAuthenticated(true);
            return true;
          }
        }
      }

      // Clear invalid authentication
      setAuthToken(null);
      setUserRole(null);
      setIsAuthenticated(false);
      return false;
    }
    return false;
  }, []);

  const values = {
    auth: isAuthenticated,
    login,
    logout,
    isLoaded,
    userRole,
    authToken,
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
