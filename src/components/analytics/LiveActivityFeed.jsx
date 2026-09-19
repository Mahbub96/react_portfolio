"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  FaCircle,
  FaDesktop,
  FaMobile,
  FaMapMarkerAlt,
  FaSync,
  FaClock,
} from "react-icons/fa";
import AnalyticsCard from "./AnalyticsCard";
import styles from "./liveActivityFeed.module.css";
import { useDataContext } from "@/contexts/useAllContext";

export default function LiveActivityFeed({ initialLiveVisitors = [] }) {
  const [visitors, setVisitors] = useState(initialLiveVisitors);
  const [loading, setLoading] = useState(false);
  const { makeAuthenticatedRequest } = useDataContext();

  const fetchLiveFeed = useCallback(async () => {
    try {
      setLoading(true);
      const res = await makeAuthenticatedRequest("/api/analytics/live?window=5");
      if (res && res.response) {
        const data = await res.response.json();
        if (data.success && Array.isArray(data.liveVisitors)) {
          setVisitors(data.liveVisitors);
        }
      }
    } catch {
      // Fallback to existing
    } finally {
      setLoading(false);
    }
  }, [makeAuthenticatedRequest]);

  // Poll live feed every 15 seconds
  useEffect(() => {
    fetchLiveFeed();
    const interval = setInterval(fetchLiveFeed, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveFeed]);

  const activeCount = visitors.filter((v) => v.isLive).length;

  return (
    <AnalyticsCard
      title="LIVE VISITOR STREAM"
      icon={FaClock}
      subtitle="Real-time Activity (<5 mins)"
    >
      <div className={styles.liveContainer}>
        <div className={styles.liveTopBar}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <span>{activeCount} Active Now</span>
          </div>
          <button
            className={styles.refreshIconBtn}
            onClick={fetchLiveFeed}
            disabled={loading}
            title="Refresh live stream"
          >
            <FaSync size={12} className={loading ? styles.spinning : ""} />
          </button>
        </div>

        <div className={styles.visitorList}>
          {visitors.length === 0 ? (
            <div className={styles.noActive}>
              No active visitors in the last 5 minutes.
            </div>
          ) : (
            visitors.map((v) => (
              <div key={v.sessionId} className={styles.visitorItem}>
                <div className={styles.visitorItemHeader}>
                  <div className={styles.visitorStatus}>
                    <FaCircle
                      size={8}
                      className={v.isLive ? styles.activeGreen : styles.idleAmber}
                    />
                    <span className={styles.visitorId}>
                      Visitor #{v.sessionId.substring(5, 11)}
                    </span>
                  </div>
                  <span className={styles.idleTime}>{v.idleAgo}</span>
                </div>

                <div className={styles.visitorDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.currentRoute}>{v.currentPage}</span>
                    <span className={styles.deviceBadge}>
                      {v.deviceType === "mobile" ? (
                        <FaMobile size={10} />
                      ) : (
                        <FaDesktop size={10} />
                      )}{" "}
                      {v.deviceType}
                    </span>
                  </div>

                  <div className={styles.lastActionRow}>
                    <span>
                      Action:{" "}
                      <strong className={styles.actionName}>
                        {v.lastEventType}
                      </strong>
                    </span>
                    <span>
                      <FaMapMarkerAlt size={10} /> {v.country}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AnalyticsCard>
  );
}
