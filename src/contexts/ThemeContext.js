"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// v2 key: the previous provider saved "dark" for every visitor on first load,
// so reusing "theme" would keep returning visitors on dark even though light
// is now the default. Only an explicit toggle writes this key.
export const THEME_STORAGE_KEY = "color-theme";

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false); // Light is the default theme
  const [isLoaded, setIsLoaded] = useState(false);

  // The pre-paint script in app/layout.js already set data-theme from
  // localStorage; read it back so React state matches what is on screen.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
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
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [isDarkMode, isLoaded]);

  // Persist only an explicit choice, so visitors who never toggle keep
  // following the site default.
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
      } catch {
        // Storage can be unavailable (private mode); the toggle still works.
      }
      return next;
    });
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
