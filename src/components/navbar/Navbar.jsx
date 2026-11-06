"use client";
import React, { useState, useEffect, useRef } from "react";
import { LuLock, LuLogOut, LuMoon, LuSun } from "react-icons/lu";
import { useDataContext } from "../../contexts/useAllContext";
import { useTheme } from "../../contexts/ThemeContext";
import LoginModal from "../auth/LoginModal";
import ContactDialog from "../contact/ContactDialog";
import DownloadResumeButton from "../banner/DownloadResumeButton";
import styles from "./navbar.module.css";
import { APP_VERSION, BUILD_NUMBER } from "@/config/version";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";

const NAV_HEIGHT = 68;

function Header() {
  const { auth, logout, isLoaded } = useDataContext();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const contactRef = useRef(null);

  const openContact = () => {
    setIsMenuOpen(false);
    contactRef.current?.open();
  };

  // Close the mobile menu on outside click or Escape.
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onPointer = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !toggleRef.current?.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  // Prevent background scroll while the mobile menu is open.
  useEffect(() => {
    document.body.classList.toggle("nav-menu-open", isMenuOpen);
    return () => document.body.classList.remove("nav-menu-open");
  }, [isMenuOpen]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Links point at "/#section" so they also work from sub-pages (where the
  // section does not exist and the browser should navigate home). Only when
  // the section is on the current page is the click intercepted for smooth
  // scrolling.
  const handleNavClick = (e, sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    e.preventDefault();
    window.scrollTo({ top: section.offsetTop - NAV_HEIGHT, behavior: "smooth" });
    setIsMenuOpen(false);
  };

  // "About" scrolls to the homepage hero (id="about"); the /about/ page stays
  // for search engines and is linked from the footer. "Contact" opens the
  // contact form dialog from any page.
  const navItems = [
    { id: "about", label: "About" },
    { id: "projects", label: "Work" },
    { id: "experience", label: "Experience" },
    { id: "skills", label: "Stack" },
    { id: "blog", label: "Writing", href: "/blog/" },
    { id: "contact", label: "Contact", action: openContact },
    ...(auth && isLoaded
      ? [
          { id: "analytics", label: "Analytics", href: "/analytics/" },
          { id: "admin", label: "Admin", href: "/admin/portfolio/" },
        ]
      : []),
  ];

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
        <nav className={styles.inner} aria-label="Primary">
          <a className={styles.brand} href="/">
            <span className={styles.mark} aria-hidden="true">
              MA
            </span>
            <span className={styles.brandText}>
              {SITE_AUTHOR.name}
              <small>{SITE_AUTHOR.jobTitle}</small>
            </span>
          </a>

          <div
            ref={menuRef}
            id="primary-navigation"
            className={`${styles.menu} ${isMenuOpen ? styles.open : ""}`}
          >
            <ul className={styles.links}>
              {navItems.map(({ id, label, href, action }) => (
                <li key={id}>
                  {action ? (
                    <button type="button" className={styles.linkButton} onClick={action} aria-haspopup="dialog">
                      {label}
                    </button>
                  ) : href ? (
                    <a href={href}>{label}</a>
                  ) : (
                    <a href={`/#${id}`} onClick={(e) => handleNavClick(e, id)}>
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            <div className={styles.actions}>
              {isLoaded && auth && (
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={logout}
                  title="Log out"
                  aria-label="Log out"
                >
                  <LuLogOut aria-hidden="true" />
                </button>
              )}
              {isLoaded && !auth && (
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => setShowLoginModal(true)}
                  title="Owner login"
                  aria-label="Owner login"
                >
                  <LuLock aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                className={styles.iconButton}
                onClick={toggleTheme}
                aria-label={`Switch to ${isDarkMode ? "light" : "dark"} theme`}
                title={`Switch to ${isDarkMode ? "light" : "dark"} theme`}
              >
                {isDarkMode ? <LuSun aria-hidden="true" /> : <LuMoon aria-hidden="true" />}
              </button>
              <DownloadResumeButton
                className={styles.resume}
                label="Résumé"
                showIcon={false}
                fileName="Mahbub_Alam_Resume.pdf"
              />
            </div>

            <p className={styles.version}>
              v{APP_VERSION} • Build {BUILD_NUMBER}
            </p>
          </div>

          <button
            ref={toggleRef}
            type="button"
            className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonOpen : ""}`}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
          >
            <span />
            <span />
          </button>
        </nav>
      </header>

      <LoginModal show={showLoginModal} onHide={() => setShowLoginModal(false)} />
      <ContactDialog ref={contactRef} />
    </>
  );
}

export default Header;
