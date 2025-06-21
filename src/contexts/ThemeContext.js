"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isLoaded, setIsLoaded] = useState(false);

  // Check localStorage on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark");
      }
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Set theme in localStorage and update document attribute
    if (typeof window !== "undefined" && isLoaded) {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      document.documentElement.setAttribute(
        "data-theme",
        isDarkMode ? "dark" : "light"
      );

      // Apply theme-specific CSS variables
      if (isDarkMode) {
        // Dark theme with beautiful Teal colors
        document.documentElement.style.setProperty(
          "--background-primary",
          "#0f1419"
        );
        document.documentElement.style.setProperty(
          "--background-secondary",
          "#1a1f2e"
        );
        document.documentElement.style.setProperty(
          "--background-tertiary",
          "#2a2f3e"
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
        document.documentElement.style.setProperty("--text-primary", "#f8f9fa");
        document.documentElement.style.setProperty(
          "--text-secondary",
          "#c8d0d8"
        );
        document.documentElement.style.setProperty("--text-muted", "#8a95a0");
        document.documentElement.style.setProperty(
          "--border-secondary",
          "rgba(255, 255, 255, 0.1)"
        );
        document.documentElement.style.setProperty(
          "--border-muted",
          "rgba(255, 255, 255, 0.08)"
        );
        // Teal accent colors for dark theme
        document.documentElement.style.setProperty(
          "--accent-primary",
          "#20c997"
        );
        document.documentElement.style.setProperty(
          "--accent-secondary",
          "#17a2b8"
        );
        document.documentElement.style.setProperty(
          "--accent-tertiary",
          "#15a085"
        );
        document.documentElement.style.setProperty("--text-accent", "#20c997");
        document.documentElement.style.setProperty(
          "--border-primary",
          "rgba(32, 201, 151, 0.2)"
        );
        document.documentElement.style.setProperty(
          "--border-accent",
          "rgba(32, 201, 151, 0.4)"
        );
        document.documentElement.style.setProperty(
          "--shadow-glow",
          "0 0 30px rgba(32, 201, 151, 0.2)"
        );
        document.documentElement.style.setProperty(
          "--shadow-glow-strong",
          "0 0 40px rgba(32, 201, 151, 0.3)"
        );
        document.documentElement.style.setProperty(
          "--gradient-primary",
          "linear-gradient(135deg, #20c997 0%, #17a2b8 50%, #15a085 100%)"
        );
        document.documentElement.style.setProperty(
          "--gradient-text",
          "linear-gradient(135deg, #20c997 0%, #17a2b8 100%)"
        );
      } else {
        // Light theme with beautiful Teal colors
        document.documentElement.style.setProperty(
          "--background-primary",
          "#ffffff"
        );
        document.documentElement.style.setProperty(
          "--background-secondary",
          "#f8fafc"
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
          "#4a5568"
        );
        document.documentElement.style.setProperty("--text-muted", "#718096");
        document.documentElement.style.setProperty(
          "--border-secondary",
          "rgba(0, 0, 0, 0.1)"
        );
        document.documentElement.style.setProperty(
          "--border-muted",
          "rgba(0, 0, 0, 0.08)"
        );
        // Teal accent colors for light theme
        document.documentElement.style.setProperty(
          "--accent-primary",
          "#0d9488"
        );
        document.documentElement.style.setProperty(
          "--accent-secondary",
          "#0891b2"
        );
        document.documentElement.style.setProperty(
          "--accent-tertiary",
          "#0f766e"
        );
        document.documentElement.style.setProperty("--text-accent", "#0d9488");
        document.documentElement.style.setProperty(
          "--border-primary",
          "rgba(13, 148, 136, 0.2)"
        );
        document.documentElement.style.setProperty(
          "--border-accent",
          "rgba(13, 148, 136, 0.4)"
        );
        document.documentElement.style.setProperty(
          "--shadow-glow",
          "0 0 30px rgba(13, 148, 136, 0.2)"
        );
        document.documentElement.style.setProperty(
          "--shadow-glow-strong",
          "0 0 40px rgba(13, 148, 136, 0.3)"
        );
        document.documentElement.style.setProperty(
          "--gradient-primary",
          "linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #0f766e 100%)"
        );
        document.documentElement.style.setProperty(
          "--gradient-text",
          "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)"
        );
      }
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
