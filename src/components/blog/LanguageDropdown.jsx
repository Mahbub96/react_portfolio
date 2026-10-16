"use client";

import React, { useState, useRef, useEffect } from "react";
import { HiOutlineGlobeAlt, HiChevronDown, HiCheck, HiStop } from "react-icons/hi2";
import styles from "./languageDropdown.module.css";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧", native: "English" },
  { code: "bn", label: "Bangla", flag: "🇧🇩", native: "বাংলা" },
];

export default function LanguageDropdown({
  currentLang = "en",
  onSelectLang,
  isLoading = false,
  onStop,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeOption =
    LANGUAGES.find((lang) => lang.code === currentLang) || LANGUAGES[0];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    setIsOpen(false);
    if (code !== currentLang && onSelectLang) {
      onSelectLang(code);
    }
  };

  // When loading/translating, the trigger button itself becomes a STOP button
  if (isLoading) {
    return (
      <div
        className={`${styles.container} ${className}`}
        aria-label="Translating article"
      >
        <button
          type="button"
          className={`${styles.triggerButton} ${styles.stopButton}`}
          onClick={onStop}
          aria-label="Stop translation and return to English"
          title="Translating... Click to stop"
        >
          <span className={styles.spinner} aria-hidden="true" />
          <HiStop className={styles.stopIcon} aria-hidden="true" />
          <span className={styles.stopText}>Stop</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className={`${styles.container} ${className}`}
      aria-label="Language selector"
    >
      <button
        type="button"
        className={`${styles.triggerButton} ${isOpen ? styles.triggerActive : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current language: ${activeOption.native}. Click to switch language.`}
      >
        <HiOutlineGlobeAlt className={styles.globeIcon} aria-hidden="true" />
        <span className={styles.langLabel}>
          <span className={styles.flagIcon}>{activeOption.flag}</span>
          <span className={styles.labelText}>{activeOption.native}</span>
        </span>
        <HiChevronDown
          className={`${styles.chevronIcon} ${isOpen ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          className={styles.dropdownMenu}
          role="listbox"
          aria-label="Choose article language"
        >
          {LANGUAGES.map((item) => {
            const isSelected = item.code === currentLang;
            return (
              <li
                key={item.code}
                role="option"
                aria-selected={isSelected}
                className={`${styles.dropdownItem} ${
                  isSelected ? styles.itemSelected : ""
                }`}
                onClick={() => handleSelect(item.code)}
              >
                <div className={styles.itemContent}>
                  <span className={styles.itemFlag}>{item.flag}</span>
                  <div className={styles.itemNames}>
                    <span className={styles.itemNative}>{item.native}</span>
                    <span className={styles.itemSub}>{item.label}</span>
                  </div>
                </div>
                {isSelected && (
                  <HiCheck className={styles.checkIcon} aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
