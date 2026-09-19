"use client";
import React from "react";
import {
  FaChartLine,
  FaMousePointer,
  FaArrowDown,
  FaClock,
  FaBolt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { formatNumber } from "@/utils/analytics/formatters";
import { formatDurationReadable } from "@/utils/analytics/dataFormatters";
import AnalyticsCard from "./AnalyticsCard";
import styles from "./interactionCommandCenter.module.css";

export default function InteractionMetrics({
  mouseEvents = {},
  keyboardEvents = {},
  formEngagement = null,
  totalSessions = 0,
}) {
  const avgScrollDepth = mouseEvents?.avgScrollDepth || 0;
  const avgTimeOnPage = mouseEvents?.avgTimeOnPage || 0;
  const totalClicks = mouseEvents?.totalClicksOnPage || 0;
  const totalMoves = mouseEvents?.totalMoves || 0;
  const totalScrolls = mouseEvents?.totalScrolls || 0;
  const totalKeyEvents =
    (keyboardEvents?.totalKeyPresses || 0) +
    (keyboardEvents?.totalKeyDowns || 0);

  const totalInteractions = totalClicks + totalScrolls + totalKeyEvents;
  const submissions = formEngagement?.formSubmit?.count || 0;
  const formErrors = formEngagement?.formError?.count || 0;
  const conversionRate =
    totalSessions > 0
      ? ((submissions / totalSessions) * 100).toFixed(1)
      : "0.0";

  return (
    <AnalyticsCard
      title="BEHAVIORAL COMMAND CENTER"
      icon={FaChartLine}
      subtitle="Visitor Engagement & Friction KPIs"
      className={styles.commandCenterCard}
    >
      <div className={styles.commandGrid}>
        {/* KPI 1: Total Interactions */}
        <div className={styles.kpiBox}>
          <div className={styles.kpiIconWrapperBlue}>
            <FaMousePointer size={16} />
          </div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiLabel}>Total Interactions</div>
            <div className={styles.kpiValue}>
              {formatNumber(totalInteractions)}
            </div>
            <div className={styles.kpiSub}>
              {formatNumber(totalClicks)} clicks • {formatNumber(totalScrolls)} scrolls
            </div>
          </div>
        </div>

        {/* KPI 2: Scroll Depth Reach */}
        <div className={styles.kpiBox}>
          <div className={styles.kpiIconWrapperGreen}>
            <FaArrowDown size={16} />
          </div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiLabel}>Avg Scroll Reach</div>
            <div className={styles.kpiValue}>{avgScrollDepth.toFixed(1)}%</div>
            <div className={styles.kpiMeter}>
              <div
                className={styles.meterFill}
                style={{ width: `${Math.min(100, avgScrollDepth)}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 3: Active Time */}
        <div className={styles.kpiBox}>
          <div className={styles.kpiIconWrapperAmber}>
            <FaClock size={16} />
          </div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiLabel}>Avg Active Time</div>
            <div className={styles.kpiValue}>
              {formatDurationReadable(avgTimeOnPage || 0)}
            </div>
            <div className={styles.kpiSub}>
              {Math.round(mouseEvents?.avgMouseHoldDuration || 0)}ms cursor dwell
            </div>
          </div>
        </div>

        {/* KPI 4: Form Conversions */}
        <div className={styles.kpiBox}>
          <div className={styles.kpiIconWrapperEmerald}>
            <FaCheckCircle size={16} />
          </div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiLabel}>Form Conversions</div>
            <div className={styles.kpiValue}>{submissions}</div>
            <div className={styles.kpiSub}>{conversionRate}% conversion rate</div>
          </div>
        </div>

        {/* KPI 5: Friction & Validation Errors */}
        <div className={styles.kpiBox}>
          <div className={styles.kpiIconWrapperRed}>
            <FaExclamationTriangle size={16} />
          </div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiLabel}>Friction / Validation Errors</div>
            <div className={styles.kpiValue}>{formErrors}</div>
            <div className={styles.kpiSub}>
              {formEngagement?.inputTyping?.avgBackspaces || 0} avg corrections/field
            </div>
          </div>
        </div>

        {/* KPI 6: Key Engagement */}
        <div className={styles.kpiBox}>
          <div className={styles.kpiIconWrapperPurple}>
            <FaBolt size={16} />
          </div>
          <div className={styles.kpiContent}>
            <div className={styles.kpiLabel}>Key Presses & Input</div>
            <div className={styles.kpiValue}>
              {formatNumber(totalKeyEvents)}
            </div>
            <div className={styles.kpiSub}>
              {formatNumber(totalMoves)} cursor movements
            </div>
          </div>
        </div>
      </div>
    </AnalyticsCard>
  );
}
