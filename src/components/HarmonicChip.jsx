"use client";

import React from "react";
import styles from "./harmonicChip.module.css";

/**
 * HarmonicChip Component
 * Renders chip, badge, or tag text where hovering over the chip triggers
 * Simple Harmonic Motion (SHM) rotational physics across every character in a smooth coordinated wave (not separately).
 */
export default function HarmonicChip({
  text = "",
  className = "",
  as: Component = "span",
  ...restProps
}) {
  const words = (text || "").split(" ");
  let globalCharIndex = 0;
  const Tag = Component || "span";

  return (
    <Tag className={`${styles.harmonicChip} ${className}`.trim()} {...restProps}>
      {/* Screen reader clean text for accessibility and SEO */}
      <span className={styles.srOnly}>{text}</span>

      {/* Visual interactive harmonic characters */}
      <span className={styles.harmonicWrapper} aria-hidden="true">
        {words.map((word, wordIdx) => (
          <span key={wordIdx} className={styles.harmonicWord}>
            {word.split("").map((char) => {
              const charIndex = globalCharIndex++;
              return (
                <span
                  key={charIndex}
                  className={styles.harmonicChar}
                  style={{ "--char-index": charIndex }}
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
    </Tag>
  );
}
