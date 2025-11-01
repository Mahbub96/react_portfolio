"use client";
import { FaCalendarAlt } from "react-icons/fa";
import styles from "../../app/analytics/analytics.module.css";

/**
 * Reusable Analytics Card Component
 */
export default function AnalyticsCard({
  title,
  icon: Icon,
  subtitle = "Last 14 days",
  children,
  className = "",
}) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          {Icon && <Icon size={16} />}
          <span>{title}</span>
        </div>
        <div className={styles.cardSubtitle}>
          <FaCalendarAlt size={14} />
          <span>{subtitle}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
