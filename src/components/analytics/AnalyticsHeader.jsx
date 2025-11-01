"use client";
import { FaCalendarAlt, FaSync } from "react-icons/fa";
import styles from "../../app/analytics/analytics.module.css";

/**
 * Analytics Page Header Component
 */
export default function AnalyticsHeader({
  onRefresh,
  timeRange = "Last 14 days",
}) {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>WEB ANALYTICS</h1>
        <div className={styles.headerActions}>
          <button
            className={styles.refreshBtn}
            onClick={onRefresh}
            title="Refresh"
          >
            <FaSync size={16} />
          </button>
        </div>
      </div>
      <div className={styles.timeRange}>
        <FaCalendarAlt size={14} />
        <span>{timeRange}</span>
      </div>
    </div>
  );
}
