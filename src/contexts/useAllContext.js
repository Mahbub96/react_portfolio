"use client";
import { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext();
export const useDataContex = () => useContext(DataContext);

function DataContextProvider(props) {
  // Initialize auth state - start with false, then check localStorage on client
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check localStorage on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("isAuthenticated");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Update localStorage whenever auth state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isAuthenticated", isAuthenticated);
    }
  }, [isAuthenticated]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const values = {
    auth: isAuthenticated,
    login,
    logout,
  };

  return (
    <DataContext.Provider value={values}>{props.children}</DataContext.Provider>
  );
}

export default DataContextProvider;
