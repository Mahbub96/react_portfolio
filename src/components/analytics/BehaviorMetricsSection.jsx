"use client";
import React from "react";
import {
  FaSlidersH,
  FaWpforms,
  FaMousePointer,
  FaArrowDown,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import AnalyticsCard from "./AnalyticsCard";
import styles from "./behaviorMetrics.module.css";

export default function BehaviorMetricsSection({
  scrollMilestones = [],
  formEngagement = null,
  popularElements = [],
}) {
  const milestones = [25, 50, 75, 90, 100];
  const maxEvents = Math.max(
    ...scrollMilestones.map((m) => m.totalEvents || 0),
    1
  );

  return (
    <>
      {/* 📜 Scroll Depth Milestones Card */}
      <AnalyticsCard
        title="SCROLL DEPTH DISTRIBUTION"
        icon={FaArrowDown}
        subtitle="Visitor Scroll Milestones"
      >
        <div className={styles.scrollMilestonesList}>
          {milestones.map((m) => {
            const found = scrollMilestones.find((item) => item.milestone === m);
            const count = found ? found.totalEvents : 0;
            const unique = found ? found.uniqueVisitors : 0;
            const percent = Math.round((count / maxEvents) * 100);

            return (
              <div key={m} className={styles.milestoneRow}>
                <div className={styles.milestoneLabel}>
                  <span className={styles.milestoneBadge}>{m}%</span>
                  <span className={styles.milestoneSub}>
                    {unique} visitors ({count} events)
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </AnalyticsCard>

      {/* 📝 Form Engagement & Abandonment Funnel */}
      <AnalyticsCard
        title="FORM ENGAGEMENT & FUNNEL"
        icon={FaWpforms}
        subtitle="Contact Form Dynamics"
      >
        <div className={styles.funnelContainer}>
          <div className={styles.funnelStage}>
            <div className={styles.stageIcon}>
              <FaMousePointer size={16} />
            </div>
            <div className={styles.stageDetails}>
              <div className={styles.stageTitle}>Field Focuses</div>
              <div className={styles.stageCount}>
                {formEngagement?.formFocus?.count || 0}
              </div>
              <div className={styles.stageSub}>
                {formEngagement?.formFocus?.uniqueSessions || 0} sessions
              </div>
            </div>
          </div>

          <div className={styles.funnelArrow}>↓</div>

          <div className={styles.funnelStage}>
            <div className={styles.stageIcon}>
              <FaClock size={16} />
            </div>
            <div className={styles.stageDetails}>
              <div className={styles.stageTitle}>Typing Engagement</div>
              <div className={styles.stageCount}>
                {formEngagement?.inputTyping?.count || 0} fields
              </div>
              <div className={styles.stageSub}>
                Avg {formEngagement?.inputTyping?.avgCharsTyped || 0} chars (
                {formEngagement?.inputTyping?.avgBackspaces || 0} backspaces)
              </div>
            </div>
          </div>

          <div className={styles.funnelArrow}>↓</div>

          <div className={styles.funnelSubGrid}>
            <div className={`${styles.subCard} ${styles.successSubCard}`}>
              <FaCheckCircle size={18} />
              <div>
                <span className={styles.subCount}>
                  {formEngagement?.formSubmit?.count || 0}
                </span>
                <span className={styles.subLabel}>Submissions</span>
              </div>
            </div>

            <div className={`${styles.subCard} ${styles.errorSubCard}`}>
              <FaExclamationTriangle size={18} />
              <div>
                <span className={styles.subCount}>
                  {formEngagement?.formError?.count || 0}
                </span>
                <span className={styles.subLabel}>Validation Errors</span>
              </div>
            </div>
          </div>
        </div>
      </AnalyticsCard>

      {/* 🎯 Popular Interactive Elements */}
      <AnalyticsCard
        title="POPULAR UI ELEMENTS"
        icon={FaSlidersH}
        subtitle="Clicks & Hover Attention"
      >
        <div className={styles.popularElementsList}>
          {popularElements.length === 0 ? (
            <div className={styles.emptyState}>No element interactions recorded yet.</div>
          ) : (
            popularElements.slice(0, 7).map((el, idx) => (
              <div key={idx} className={styles.elementRow}>
                <div className={styles.elementRank}>#{idx + 1}</div>
                <div className={styles.elementInfo}>
                  <div className={styles.elementId} title={el.elementId}>
                    {el.elementId}
                  </div>
                  <div className={styles.elementMetrics}>
                    <span>{el.clicks} clicks</span>
                    <span>•</span>
                    <span>{el.hovers} hovers</span>
                    {el.avgHoverDurationMs > 0 && (
                      <>
                        <span>•</span>
                        <span>{el.avgHoverDurationMs}ms avg dwell</span>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.elementTotal}>
                  {el.totalInteractions}
                </div>
              </div>
            ))
          )}
        </div>
      </AnalyticsCard>
    </>
  );
}
