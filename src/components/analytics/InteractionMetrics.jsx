"use client";
import { FaChartBar, FaCalendarAlt } from "react-icons/fa";
import { formatNumber } from "@/utils/analytics/formatters";
import {
  formatDurationReadable,
  formatScrollDepthDescription,
} from "@/utils/analytics/dataFormatters";
import styles from "../../app/analytics/analytics.module.css";

/**
 * User Interaction Metrics Component
 */
export default function InteractionMetrics({ mouseEvents, keyboardEvents }) {
  const avgScrollDepth = mouseEvents?.avgScrollDepth || 0;
  const avgTimeOnPage = mouseEvents?.avgTimeOnPage || 0;

  const metrics = [
    {
      label: "Total Clicks",
      value: formatNumber(mouseEvents?.totalClicksOnPage || 0),
    },
    {
      label: "Mouse Moves",
      value: formatNumber(mouseEvents?.totalMoves || 0),
    },
    {
      label: "Avg Scroll Depth",
      value: `${avgScrollDepth.toFixed(1)}%`,
      description: formatScrollDepthDescription(avgScrollDepth),
    },
    {
      label: "Avg Time on Page",
      value: formatDurationReadable(avgTimeOnPage || 0),
    },
    {
      label: "Key Presses",
      value: formatNumber(keyboardEvents?.totalKeyPresses || 0),
    },
    {
      label: "Avg Mouse Hold",
      value: formatDurationReadable(mouseEvents?.avgMouseHoldDuration || 0),
    },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <FaChartBar size={16} />
          <span>USER INTERACTION METRICS</span>
        </div>
        <div className={styles.cardSubtitle}>
          <FaCalendarAlt size={14} />
          <span>Last 14 days</span>
        </div>
      </div>
      <div className={styles.metricsGrid}>
        {metrics.map((metric, idx) => (
          <div key={idx} className={styles.metricItem}>
            <div className={styles.metricLabel}>{metric.label}</div>
            <div className={styles.metricValue}>{metric.value}</div>
            {metric.description && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#999",
                  marginTop: "0.25rem",
                }}
              >
                {metric.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
