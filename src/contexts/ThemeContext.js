"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isLoaded, setIsLoaded] = useState(false);

  // The pre-paint script in app/layout.js already set data-theme from
  // localStorage; read it back so React state matches what is on screen.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark");
      }
      setIsLoaded(true);
    }
  }, []);

  // All colours come from the [data-theme] token blocks in globals.css, so
  // switching themes is only an attribute change.
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      const theme = isDarkMode ? "dark" : "light";
      localStorage.setItem("theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [isDarkMode, isLoaded]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
