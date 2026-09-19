"use client";
import React from "react";
import Link from "next/link";
import { FaCalendarAlt, FaSync, FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import styles from "./analyticsHeader.module.css";

/**
 * Redesigned Modern Analytics Header Component
 * Fully themed to match portfolio aesthetics with Home navigation
 */
export default function AnalyticsHeader({
  onRefresh,
  timeRange = "Last 14 days",
}) {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.leftSection}>
        <Link href="/" className={styles.homeBtn}>
          <FaArrowLeft size={13} />
          <span>Back to Portfolio</span>
        </Link>

        <div className={styles.brandWrapper}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>BEHAVIORAL COMMAND CENTER</h1>
            <span className={styles.liveBadge}>
              <span className={styles.pulseDot} />
              Live Telemetry
            </span>
          </div>
          <p className={styles.subtitle}>
            Session Replay, Real-Time Interaction Tracking & Audience Insights
          </p>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.timeRangeBadge}>
          <FaCalendarAlt size={13} color="#20c997" />
          <span>{timeRange}</span>
        </div>

        <button
          className={styles.refreshBtn}
          onClick={onRefresh}
          title="Refresh telemetry stream"
        >
          <FaSync size={13} />
          <span>Sync Data</span>
        </button>
      </div>
    </header>
  );
}
