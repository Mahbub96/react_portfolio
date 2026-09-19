"use client";

import React, { useState, useCallback } from "react";
import styles from "./banner.module.css";

/**
 * HarmonicName Component
 * Renders name with Simple Harmonic Motion (SHM) rotational physics on each character.
 * Supports hover re-trigger, tactile touch response, and word-level wrapping.
 */
export default function HarmonicName({ name = "Mahbub Alam" }) {
  // Track currently oscillating character indices to allow seamless re-triggers
  const [activeChars, setActiveChars] = useState({});

  const triggerHarmonic = useCallback((charId) => {
    setActiveChars((prev) => ({ ...prev, [charId]: Date.now() }));
  }, []);

  const handleAnimationEnd = useCallback((charId) => {
    setActiveChars((prev) => {
      const next = { ...prev };
      delete next[charId];
      return next;
    });
  }, []);

  const words = name.split(" ");
  let globalCharIndex = 0;

  return (
    <h1 id="hero-heading" className={styles.name} aria-label={name}>
      {/* Accessible text for screen readers and SEO */}
      <span className={styles.srOnly}>{name}</span>

      {/* Visual interactive harmonic characters */}
      <span className={styles.harmonicWrapper} aria-hidden="true">
        {words.map((word, wordIdx) => (
          <span key={wordIdx} className={styles.harmonicWord}>
            {word.split("").map((char) => {
              const charId = `char-${globalCharIndex++}`;
              const isOscillating = !!activeChars[charId];

              return (
                <span
                  key={charId}
                  className={`${styles.harmonicChar} ${
                    isOscillating ? styles.oscillating : ""
                  }`}
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
    </h1>
  );
}
