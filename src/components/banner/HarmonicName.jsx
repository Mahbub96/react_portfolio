"use client";

import React from "react";
import HarmonicHeading from "@/components/HarmonicHeading";
import styles from "./banner.module.css";

/**
 * HarmonicName Component
 * Renders name with Simple Harmonic Motion (SHM) rotational physics on each character.
 * Uses the shared HarmonicHeading component for consistent physics and theming.
 */
export default function HarmonicName({ name = "Mahbub Alam" }) {
  return (
    <HarmonicHeading
      as="h1"
      id="hero-heading"
      className={styles.name}
      text={name}
    />
  );
}
