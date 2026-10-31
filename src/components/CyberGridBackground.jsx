"use client";

import React from "react";
import styles from "./cyberGrid.module.css";

export default function CyberGridBackground() {
  return (
    <div className={styles.gridWrapper} aria-hidden="true">
      <div className={styles.gridPerspective} />
      <div className={styles.horizonGlow} />
    </div>
  );
}
