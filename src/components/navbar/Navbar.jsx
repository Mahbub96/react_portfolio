"use client";
import React, { useState, useEffect, useRef } from "react";
import { useDataContext } from "../../contexts/useAllContext";
import { useTheme } from "../../contexts/ThemeContext";
import LoginModal from "../auth/LoginModal";
import styles from "./navbar.module.css";

function Header({ data }) {
  const { auth, logout, isLoaded } = useDataContext();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const menuRef = useRef(null);

  // Extract name from database data
  const profile = data?.profile?.data || {};
  const bannerData = data?.Banner?.data || {};
  const name = profile.name || bannerData.name || "Mahbub Alam";

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  // Prevent background scroll while the mobile menu is open.
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.body.classList.toggle("nav-menu-open", isMenuOpen);

    return () => {
      document.body.classList.remove("nav-menu-open");
    };
  }, [isMenuOpen]);

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

  const handleLogout = () => {
    logout(); // Call the logout function from context
  };

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(`.${styles.header}`);
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add(styles.scrolled);
        } else {
          header.classList.remove(styles.scrolled);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "about", label: "About", number: "01" },
    { id: "projects", label: "Projects", number: "02" },
    { id: "skills", label: "Skills", number: "03" },
    { id: "experience", label: "Experience", number: "04" },
    { id: "education", label: "Education", number: "05" },
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
    <>
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
              aria-expanded={isMenuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div
              ref={menuRef}
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
                      <a
                        href="#contact"
                        className={styles.authButton}
                        onClick={(e) => handleNavClick(e, "contact")}
                      >
                        Hire Me
                      </a>
                    )}
                  </>
                )}
                {isLoaded && !auth && (
                  <button
                    className={styles.themeButton}
                    onClick={() => setShowLoginModal(true)}
                    title="Admin Login / Analytics"
                    aria-label="Admin Login"
                  >
                    <span style={{ fontSize: "1.05rem", lineHeight: 1 }}>
                      🔐
                    </span>
                  </button>
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

      {/* Admin Login Modal */}
      <LoginModal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
      />
    </>
  );
}

export default Header;
