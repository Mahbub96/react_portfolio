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
          "#050811"
        );
        document.documentElement.style.setProperty(
          "--background-secondary",
          "#0b1220"
        );
        document.documentElement.style.setProperty(
          "--background-tertiary",
          "#111827"
        );
        document.documentElement.style.setProperty(
          "--background-card",
          "rgba(255, 255, 255, 0.055)"
        );
        document.documentElement.style.setProperty(
          "--background-elevated",
          "rgba(255, 255, 255, 0.085)"
        );
        document.documentElement.style.setProperty(
          "--background-glass",
          "rgba(255, 255, 255, 0.095)"
        );
        document.documentElement.style.setProperty("--text-primary", "#f8fafc");
        document.documentElement.style.setProperty(
          "--text-secondary",
          "#cbd5e1"
        );
        document.documentElement.style.setProperty("--text-muted", "#94a3b8");
        document.documentElement.style.setProperty(
          "--border-secondary",
          "rgba(255, 255, 255, 0.095)"
        );
        document.documentElement.style.setProperty(
          "--border-muted",
          "rgba(255, 255, 255, 0.085)"
        );
        document.documentElement.style.setProperty(
          "--border-light",
          "rgba(255, 255, 255, 0.095)"
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
          "rgba(32, 201, 151, 0.25)"
        );
        document.documentElement.style.setProperty(
          "--border-accent",
          "rgba(32, 201, 151, 0.45)"
        );
        document.documentElement.style.setProperty(
          "--shadow-glow",
          "0 0 30px rgba(32, 201, 151, 0.2)"
        );
        document.documentElement.style.setProperty(
          "--shadow-glow-strong",
          "0 0 55px rgba(32, 201, 151, 0.34)"
        );
        document.documentElement.style.setProperty(
          "--gradient-primary",
          "linear-gradient(135deg, #20c997 0%, #17a2b8 50%, #15a085 100%)"
        );
        document.documentElement.style.setProperty(
          "--gradient-text",
          "linear-gradient(135deg, #20c997 0%, #17a2b8 100%)"
        );
        document.documentElement.style.setProperty(
          "--gradient-premium",
          "radial-gradient(circle at 18% 8%, rgba(45, 212, 191, 0.18), transparent 28%), radial-gradient(circle at 82% 18%, rgba(59, 130, 246, 0.12), transparent 26%), linear-gradient(135deg, #050811 0%, #07111f 52%, #0d1727 100%)"
        );
        document.documentElement.style.setProperty(
          "--shadow-premium",
          "0 24px 80px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
        );
      } else {
        // Light theme with beautiful Teal colors
        document.documentElement.style.setProperty(
          "--background-primary",
          "#f8fbff"
        );
        document.documentElement.style.setProperty(
          "--background-secondary",
          "#f8fbff"
        );
        document.documentElement.style.setProperty(
          "--background-tertiary",
          "#eaf1f8"
        );
        document.documentElement.style.setProperty(
          "--background-card",
          "rgba(255, 255, 255, 0.72)"
        );
        document.documentElement.style.setProperty(
          "--background-elevated",
          "rgba(255, 255, 255, 0.86)"
        );
        document.documentElement.style.setProperty(
          "--background-glass",
          "rgba(255, 255, 255, 0.76)"
        );
        document.documentElement.style.setProperty("--text-primary", "#0f172a");
        document.documentElement.style.setProperty(
          "--text-secondary",
          "#334155"
        );
        document.documentElement.style.setProperty("--text-muted", "#64748b");
        document.documentElement.style.setProperty(
          "--border-secondary",
          "rgba(15, 23, 42, 0.1)"
        );
        document.documentElement.style.setProperty(
          "--border-muted",
          "rgba(15, 23, 42, 0.08)"
        );
        document.documentElement.style.setProperty(
          "--border-light",
          "rgba(15, 23, 42, 0.1)"
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
          "rgba(13, 148, 136, 0.22)"
        );
        document.documentElement.style.setProperty(
          "--border-accent",
          "rgba(13, 148, 136, 0.35)"
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
        document.documentElement.style.setProperty(
          "--gradient-premium",
          "radial-gradient(circle at 18% 8%, rgba(13, 148, 136, 0.13), transparent 28%), radial-gradient(circle at 82% 18%, rgba(14, 165, 233, 0.11), transparent 26%), linear-gradient(135deg, #f8fbff 0%, #eef7fb 52%, #e8f3f2 100%)"
        );
        document.documentElement.style.setProperty(
          "--shadow-premium",
          "0 24px 70px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
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
