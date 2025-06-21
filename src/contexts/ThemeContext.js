"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  // Check localStorage on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark");
      }
    }
  }, []);

  useEffect(() => {
    // Set theme in localStorage and update document attribute
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      document.documentElement.setAttribute(
        "data-theme",
        isDarkMode ? "dark" : "light"
      );

      // Apply theme-specific CSS variables
      if (isDarkMode) {
        // Dark theme with enhanced tilt colors
        document.documentElement.style.setProperty(
          "--background-primary",
          "#1e1e24"
        );
        document.documentElement.style.setProperty(
          "--background-secondary",
          "#2d2d3a"
        );
        document.documentElement.style.setProperty(
          "--background-tertiary",
          "#3d3d4a"
        );
        document.documentElement.style.setProperty(
          "--background-card",
          "rgba(255, 255, 255, 0.05)"
        );
        document.documentElement.style.setProperty(
          "--background-elevated",
          "rgba(255, 255, 255, 0.08)"
        );
        document.documentElement.style.setProperty(
          "--background-glass",
          "rgba(255, 255, 255, 0.1)"
        );
        document.documentElement.style.setProperty("--text-primary", "#f8f8f2");
        document.documentElement.style.setProperty(
          "--text-secondary",
          "#c8c8d0"
        );
        document.documentElement.style.setProperty("--text-muted", "#8a8a95");
        document.documentElement.style.setProperty(
          "--border-secondary",
          "rgba(255, 255, 255, 0.1)"
        );
        document.documentElement.style.setProperty(
          "--border-muted",
          "rgba(255, 255, 255, 0.08)"
        );
      } else {
        // Light theme
        document.documentElement.style.setProperty(
          "--background-primary",
          "#ffffff"
        );
        document.documentElement.style.setProperty(
          "--background-secondary",
          "#f8f9fa"
        );
        document.documentElement.style.setProperty(
          "--background-tertiary",
          "#e9ecef"
        );
        document.documentElement.style.setProperty(
          "--background-card",
          "rgba(0, 0, 0, 0.05)"
        );
        document.documentElement.style.setProperty(
          "--background-elevated",
          "rgba(0, 0, 0, 0.08)"
        );
        document.documentElement.style.setProperty(
          "--background-glass",
          "rgba(0, 0, 0, 0.1)"
        );
        document.documentElement.style.setProperty("--text-primary", "#1a1a1a");
        document.documentElement.style.setProperty(
          "--text-secondary",
          "#666666"
        );
        document.documentElement.style.setProperty("--text-muted", "#8a8a95");
        document.documentElement.style.setProperty(
          "--border-secondary",
          "rgba(0, 0, 0, 0.1)"
        );
        document.documentElement.style.setProperty(
          "--border-muted",
          "rgba(0, 0, 0, 0.08)"
        );
      }
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
