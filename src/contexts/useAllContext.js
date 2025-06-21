"use client";
import { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext();
export const useDataContex = () => useContext(DataContext);

function DataContextProvider(props) {
  // Initialize auth state - start with false, then check localStorage on client
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check localStorage on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("isAuthenticated");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }
      setIsLoaded(true);
    }
  }, []);

  // Update localStorage whenever auth state changes
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      localStorage.setItem("isAuthenticated", isAuthenticated);
    }
  }, [isAuthenticated, isLoaded]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Track logout event in database
      if (typeof window !== "undefined") {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "admin",
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ip: "unknown",
          }),
        });
      }
    } catch (error) {
      console.error("Error tracking logout:", error);
    } finally {
      setIsAuthenticated(false);
    }
  };

  const values = {
    auth: isAuthenticated,
    login,
    logout,
    isLoaded,
  };

  return (
    <DataContext.Provider value={values}>{props.children}</DataContext.Provider>
  );
}

export default DataContextProvider;
