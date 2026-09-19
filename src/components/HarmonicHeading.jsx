"use client";

import React, { useState, useCallback, useId } from "react";
import styles from "./harmonicHeading.module.css";

/**
 * HarmonicHeading Component
 * Renders headings with Simple Harmonic Motion (SHM) physics on each character on hover and touch.
 * Supports customizable heading levels (h1, h2, h3, span, etc.), accessible screen-reader text,
 * word wrapping, dynamic theme glow, and trailing child elements (like counters).
 */
export default function HarmonicHeading({
  text = "",
  as: Component = "h2",
  id,
  className = "",
  ariaLabel,
  children,
  ambient = true,
  ...restProps
}) {
  const [activeChars, setActiveChars] = useState({});
  const rawId = useId();
  const baseId = rawId.replace(/:/g, "_");

  const triggerHarmonic = useCallback((charId) => {
    setActiveChars((prev) => ({ ...prev, [charId]: Date.now() }));
  }, []);

  const handleAnimationEnd = useCallback((charId) => {
    setActiveChars((prev) => {
      if (!prev[charId]) return prev;
      const next = { ...prev };
      delete next[charId];
      return next;
    });
  }, []);

  // Split text into words to prevent unnatural mid-word breaks
  const words = (text || "").split(" ");
  let globalCharIndex = 0;

  const Tag = Component || "h2";

  return (
    <Tag
      id={id}
      className={`${styles.harmonicHeading} ${className}`.trim()}
      aria-label={ariaLabel || text}
      {...restProps}
    >
      {/* Accessible text for screen readers and SEO */}
      <span className={styles.srOnly}>{text}</span>

      {/* Visual interactive harmonic characters */}
      <span className={styles.harmonicWrapper} aria-hidden="true">
        {words.map((word, wordIdx) => (
          <span key={wordIdx} className={styles.harmonicWord}>
            {word.split("").map((char) => {
              const charId = `${baseId}-c-${globalCharIndex++}`;
              const isOscillating = !!activeChars[charId];

              return (
                <span
                  key={charId}
                  className={`${styles.harmonicChar} ${
                    ambient ? styles.ambient : ""
                  } ${isOscillating ? styles.oscillating : ""}`.trim()}
                  style={{
                    "--char-index": globalCharIndex,
                  }}
                  onMouseEnter={() => triggerHarmonic(charId)}
                  onTouchStart={() => triggerHarmonic(charId)}
                  onAnimationEnd={() => handleAnimationEnd(charId)}
                >
                  {char}
                </span>
              );
            })}
            {wordIdx < words.length - 1 && (
              <span className={styles.harmonicSpace}>&nbsp;</span>
            )}
          </span>
        ))}
      </span>

      {/* Trailing elements (e.g. project/experience count badges) */}
      {children}
    </Tag>
  );
}
