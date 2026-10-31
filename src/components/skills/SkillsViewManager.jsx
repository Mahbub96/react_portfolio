"use client";

import React, { useState } from "react";
import SkillsSphere3D from "./SkillsSphere3D";
import styles from "./skillsSphere3D.module.css";
import { HiOutlineCube, HiOutlineViewGrid } from "react-icons/hi";

export default function SkillsViewManager({ children, skills = [] }) {
  const [viewMode, setViewMode] = useState("bento"); // "bento" | "sphere"

  return (
    <>
      <div className={styles.viewToggleBar} role="tablist" aria-label="Skills display view mode">
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "bento"}
          className={`${styles.toggleBtn} ${viewMode === "bento" ? styles.active : ""}`}
          onClick={() => setViewMode("bento")}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <HiOutlineViewGrid aria-hidden="true" />
            Bento Grid
          </span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === "sphere"}
          className={`${styles.toggleBtn} ${viewMode === "sphere" ? styles.active : ""}`}
          onClick={() => setViewMode("sphere")}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <HiOutlineCube aria-hidden="true" />
            3D Sphere
          </span>
        </button>
      </div>

      {viewMode === "sphere" ? (
        <SkillsSphere3D skills={skills} />
      ) : (
        children
      )}
    </>
  );
}
