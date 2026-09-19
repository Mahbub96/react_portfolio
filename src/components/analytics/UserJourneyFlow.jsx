"use client";
import React from "react";
import {
  FaRoute,
  FaArrowRight,
  FaClock,
  FaMousePointer,
  FaArrowDown,
  FaDoorOpen,
  FaCheckCircle,
} from "react-icons/fa";
import AnalyticsCard from "./AnalyticsCard";
import styles from "./userJourneyFlow.module.css";

export default function UserJourneyFlow({ journeySteps = [], onSelectStep }) {
  // Default fallback sample journey if no steps recorded yet
  const displaySteps =
    journeySteps.length > 0
      ? journeySteps
      : [
          { name: "/", type: "page_view", dwellMs: 45000, interactions: 12, maxScrollDepth: 45 },
          { name: "#skills", type: "section_view", dwellMs: 32000, interactions: 8, maxScrollDepth: 65 },
          { name: "#projects", type: "section_view", dwellMs: 78000, interactions: 24, maxScrollDepth: 85 },
          { name: "#contact", type: "section_view", dwellMs: 55000, interactions: 15, maxScrollDepth: 100 },
        ];

  return (
    <AnalyticsCard
      title="VISITOR JOURNEY PIPELINE"
      icon={FaRoute}
      subtitle="Step-by-Step Navigation & Dwell Progression"
      className={styles.fullSpanCard}
    >
      <div className={styles.journeyWrapper}>
        <div className={styles.journeyFlow}>
          <div className={`${styles.journeyNode} ${styles.entryNode}`}>
            <div className={styles.nodeIcon}>
              <FaDoorOpen size={14} />
            </div>
            <div className={styles.nodeLabel}>Entry</div>
            <div className={styles.nodeDetail}>Direct / Search</div>
          </div>

          {displaySteps.map((step, idx) => {
            const dwellSec = Math.round((step.dwellMs || 0) / 1000);
            return (
              <React.Fragment key={idx}>
                <div className={styles.flowArrow}>
                  <FaArrowRight size={12} />
                </div>

                <div
                  className={styles.journeyNode}
                  onClick={() => onSelectStep && onSelectStep(step)}
                  title="Click to jump replay to this stage"
                >
                  <div className={styles.nodeHeader}>
                    <span className={styles.nodeStepNumber}>Step {idx + 1}</span>
                    <span className={styles.nodeName}>{step.name}</span>
                  </div>

                  <div className={styles.nodeMetrics}>
                    <div className={styles.metricRow}>
                      <FaClock size={10} />
                      <span>{dwellSec}s dwell</span>
                    </div>
                    <div className={styles.metricRow}>
                      <FaMousePointer size={10} />
                      <span>{step.interactions || 0} clicks/actions</span>
                    </div>
                    {step.maxScrollDepth > 0 && (
                      <div className={styles.metricRow}>
                        <FaArrowDown size={10} />
                        <span>{Math.round(step.maxScrollDepth)}% scroll</span>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          <div className={styles.flowArrow}>
            <FaArrowRight size={12} />
          </div>

          <div className={`${styles.journeyNode} ${styles.exitNode}`}>
            <div className={styles.nodeIcon}>
              <FaCheckCircle size={14} />
            </div>
            <div className={styles.nodeLabel}>Outcome</div>
            <div className={styles.nodeDetail}>Browsed / Converted</div>
          </div>
        </div>
      </div>
    </AnalyticsCard>
  );
}
