"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  FaFire,
  FaMousePointer,
  FaClock,
  FaRoute,
  FaArrowDown,
  FaFilter,
} from "react-icons/fa";
import AnalyticsCard from "./AnalyticsCard";
import styles from "./multiModeHeatmap.module.css";
import { useDataContext } from "@/contexts/useAllContext";

const MODES = [
  { id: "click", label: "Clicks", icon: FaMousePointer },
  { id: "hover", label: "Hover Attention", icon: FaClock },
  { id: "movement", label: "Movement Density", icon: FaRoute },
  { id: "scroll", label: "Scroll Milestones", icon: FaArrowDown },
];

export default function MultiModeHeatmap({ initialPoints = [] }) {
  const [activeMode, setActiveMode] = useState("click");
  const [points, setPoints] = useState(initialPoints);
  const [loading, setLoading] = useState(false);
  const { makeAuthenticatedRequest } = useDataContext();

  const fetchHeatmapData = useCallback(
    async (mode) => {
      try {
        setLoading(true);
        const res = await makeAuthenticatedRequest(
          `/api/analytics/heatmap?mode=${mode}&days=14`
        );
        if (res && res.response) {
          const data = await res.response.json();
          if (data.success && Array.isArray(data.points)) {
            setPoints(data.points);
          }
        }
      } catch {
        // Fallback to initial points
      } finally {
        setLoading(false);
      }
    },
    [makeAuthenticatedRequest]
  );

  useEffect(() => {
    fetchHeatmapData(activeMode);
  }, [activeMode, fetchHeatmapData]);

  // Normalize points to viewport percentages
  const normalizedPoints = points.map((p) => {
    const normX = Math.max(2, Math.min(98, ((p.x || 0) / 1366) * 100));
    const normY = Math.max(2, Math.min(98, ((p.y || 0) / 768) * 100));
    return { ...p, normX, normY };
  });

  return (
    <AnalyticsCard
      title="INTERACTION HEATMAP ENGINE"
      icon={FaFire}
      subtitle="Visual Density & Hotspots"
      className={styles.heatmapCardSpan}
    >
      {/* Mode Switcher Navigation */}
      <div className={styles.headerToolbar}>
        <div className={styles.modeTabs}>
          {MODES.map((m) => {
            const Icon = m.icon;
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                className={`${styles.modeTab} ${isActive ? styles.activeTab : ""}`}
                onClick={() => setActiveMode(m.id)}
              >
                <Icon size={12} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.pointCountBadge}>
          {loading ? "Loading..." : `${points.length} data points`}
        </div>
      </div>

      {/* Viewport Canvas with Multi-Mode Overlay */}
      <div className={styles.canvasContainer}>
        <div className={styles.canvasBrowserBar}>
          <span className={styles.bDot} />
          <span className={styles.bDot} />
          <span className={styles.bDot} />
          <span className={styles.bUrl}>
            https://mahbub.dev/ — Mode: {activeMode.toUpperCase()}
          </span>
        </div>

        <div className={styles.canvasContent}>
          {/* Simulated page wireframe */}
          <div className={styles.pageHero}>
            <div className={styles.heroTextPlaceholder} />
            <div className={styles.heroAvatarPlaceholder} />
          </div>
          <div className={styles.pageGrid}>
            <div className={styles.gridCard} />
            <div className={styles.gridCard} />
            <div className={styles.gridCard} />
          </div>

          {/* Mode: Scroll Milestones Bands */}
          {activeMode === "scroll" && (
            <div className={styles.scrollBandsOverlay}>
              <div className={`${styles.scrollBand} ${styles.band25}`}>25% Depth Barrier</div>
              <div className={`${styles.scrollBand} ${styles.band50}`}>50% Depth Barrier</div>
              <div className={`${styles.scrollBand} ${styles.band75}`}>75% Depth Barrier</div>
              <div className={`${styles.scrollBand} ${styles.band90}`}>90% Depth Barrier</div>
              <div className={`${styles.scrollBand} ${styles.band100}`}>100% Full Page Reach</div>
            </div>
          )}

          {/* Mode: Points & Density clusters */}
          {activeMode !== "scroll" &&
            normalizedPoints.map((pt, idx) => {
              let dotClass = styles.clickDot;
              if (activeMode === "hover") dotClass = styles.hoverDot;
              if (activeMode === "movement") dotClass = styles.movementDot;

              return (
                <div
                  key={idx}
                  className={`${styles.heatPoint} ${dotClass}`}
                  style={{ left: `${pt.normX}%`, top: `${pt.normY}%` }}
                  title={`${activeMode.toUpperCase()} at (${pt.x}, ${pt.y})`}
                />
              );
            })}

          {points.length === 0 && activeMode !== "scroll" && (
            <div className={styles.emptyNotice}>
              No {activeMode} data points collected yet
            </div>
          )}
        </div>
      </div>
    </AnalyticsCard>
  );
}
