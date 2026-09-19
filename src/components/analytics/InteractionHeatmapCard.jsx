"use client";
import React, { useState } from "react";
import { FaFire, FaMousePointer, FaFilter } from "react-icons/fa";
import AnalyticsCard from "./AnalyticsCard";
import styles from "./heatmapCard.module.css";

export default function InteractionHeatmapCard({ heatmapPoints = [] }) {
  const [filter, setFilter] = useState("all"); // 'all', 'click', 'hover'

  const filteredPoints = heatmapPoints.filter((pt) => {
    if (filter === "all") return true;
    return pt.eventType === filter;
  });

  // Normalize coordinates into percentage relative to simulated reference resolution (1440x900)
  const normalizedPoints = filteredPoints.map((pt) => {
    const normX = Math.max(2, Math.min(98, ((pt.x || 0) / 1366) * 100));
    const normY = Math.max(2, Math.min(98, ((pt.y || 0) / 768) * 100));
    return {
      ...pt,
      normX,
      normY,
    };
  });

  const clickCount = heatmapPoints.filter((p) => p.eventType === "click").length;
  const hoverCount = heatmapPoints.filter((p) => p.eventType === "hover").length;

  return (
    <AnalyticsCard
      title="INTERACTION HEATMAP"
      icon={FaFire}
      subtitle="Click & Hover Distribution"
      className={styles.heatmapCardSpan}
    >
      <div className={styles.heatmapControls}>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterBtn} ${
              filter === "all" ? styles.filterActive : ""
            }`}
            onClick={() => setFilter("all")}
          >
            All ({heatmapPoints.length})
          </button>
          <button
            className={`${styles.filterBtn} ${
              filter === "click" ? styles.filterActive : ""
            }`}
            onClick={() => setFilter("click")}
          >
            Clicks ({clickCount})
          </button>
          <button
            className={`${styles.filterBtn} ${
              filter === "hover" ? styles.filterActive : ""
            }`}
            onClick={() => setFilter("hover")}
          >
            Hovers ({hoverCount})
          </button>
        </div>
        <div className={styles.heatmapLegend}>
          <span className={styles.legendItem}>
            <span className={styles.legendClickDot} /> Clicks
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendHoverDot} /> Hovers
          </span>
        </div>
      </div>

      <div className={styles.viewportCanvas}>
        <div className={styles.canvasHeader}>
          <span className={styles.browserDot} />
          <span className={styles.browserDot} />
          <span className={styles.browserDot} />
          <span className={styles.canvasUrl}>https://mahbub.dev/ (Simulated Viewport)</span>
        </div>

        <div className={styles.canvasArea}>
          {/* Background layout wireframe lines */}
          <div className={styles.wireframeNav} />
          <div className={styles.wireframeHero}>
            <div className={styles.wireframeHeroText} />
            <div className={styles.wireframeHeroAvatar} />
          </div>
          <div className={styles.wireframeGrid}>
            <div className={styles.wireframeCard} />
            <div className={styles.wireframeCard} />
            <div className={styles.wireframeCard} />
          </div>

          {/* Render interaction points */}
          {normalizedPoints.length === 0 ? (
            <div className={styles.emptyHeatmap}>
              <FaMousePointer size={24} />
              <p>No pointer coordinate points recorded yet</p>
            </div>
          ) : (
            normalizedPoints.map((pt, idx) => {
              const isClick = pt.eventType === "click";
              return (
                <div
                  key={idx}
                  className={`${styles.heatDot} ${
                    isClick ? styles.clickDot : styles.hoverDot
                  }`}
                  style={{
                    left: `${pt.normX}%`,
                    top: `${pt.normY}%`,
                  }}
                  title={`${pt.eventType.toUpperCase()} at (${pt.x}, ${pt.y}) ${
                    pt.elementId ? `on ${pt.elementId}` : ""
                  }`}
                />
              );
            })
          )}
        </div>
      </div>
    </AnalyticsCard>
  );
}
