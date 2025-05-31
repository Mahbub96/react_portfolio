import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get theme from localStorage, default to dark if not set
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true; // true means dark mode is default
  });

  useEffect(() => {
    // Set theme in localStorage and update document attribute
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
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
