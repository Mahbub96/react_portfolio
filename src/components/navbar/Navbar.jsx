"use client";
import React, { useState } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import { useTheme } from "../../contexts/ThemeContext";
import styles from "./navbar.module.css";
import LoginModal from "../auth/LoginModal";

function Header({ data }) {
  const { auth, login, logout, isLoaded } = useDataContex();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Extract name from database data
  const profile = data?.profile?.data || {};
  const bannerData = data?.Banner?.data || {};
  const name = profile.name || bannerData.name || "Mahbub Alam";

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const section = document.getElementById(sectionId);
      if (section) {
        const navHeight = 70; // Approximate navbar height
        const sectionTop = section.offsetTop - navHeight;
        window.scrollTo({
          top: sectionTop,
          behavior: "smooth",
        });
        setIsMenuOpen(false);
      }
    }
  };

  const handleLogin = () => {
    login(); // Call the login function from context
  };

  const handleLogout = () => {
    logout(); // Call the logout function from context
  };

  const navItems = [
    { id: "about", label: "About", number: "01" },
    { id: "skills", label: "Skills", number: "02" },
    { id: "experience", label: "Experience", number: "03" },
    { id: "education", label: "Education", number: "04" },
    { id: "projects", label: "Projects", number: "05" },
    { id: "contact", label: "Contact", number: "06" },
    // Only show Analytics link if authenticated and loaded
    ...(auth && isLoaded
      ? [
          {
            id: "analytics",
            label: "Analytics",
            number: "07",
            href: "/analytics",
          },
        ]
      : []),
  ];

  return (
    <div id="home">
      <header className={styles.header}>
        <nav className={styles.navbar}>
          <div className={styles.container}>
            <a className={styles.logo} href="/">
              <span className={styles.bracket}>{"<"}</span>
              {name}
              <span className={styles.bracket}>{"/>"}</span>
            </a>

            <button
              className={`${styles.menuButton} ${
                isMenuOpen ? styles.active : ""
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div
              className={`${styles.navContent} ${
                isMenuOpen ? styles.show : ""
              }`}
            >
              <ul className={styles.navLinks}>
                {navItems.map(({ id, label, number, href }) => (
                  <li key={id}>
                    {href ? (
                      <a href={href}>
                        <span className={styles.navNumber}>{number}.</span>
                        {label}
                      </a>
                    ) : (
                      <a href={`#${id}`} onClick={(e) => handleNavClick(e, id)}>
                        <span className={styles.navNumber}>{number}.</span>
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>

              <div className={styles.navButtons}>
                {isLoaded && (
                  <>
                    {auth ? (
                      <button
                        className={styles.authButton}
                        onClick={handleLogout}
                      >
                        Log Out
                      </button>
                    ) : (
                      <button
                        className={styles.authButton}
                        onClick={() => setShowLoginModal(true)}
                      >
                        Login
                      </button>
                    )}
                  </>
                )}
                <button
                  className={styles.themeButton}
                  onClick={toggleTheme}
                  aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
                >
                  {isDarkMode ? (
                    <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>
                      ☀️
                    </span>
                  ) : (
                    <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>
                      🌙
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
      />
    </div>
  );
}

export default Header;
