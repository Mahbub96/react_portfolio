"use client";
import React, { useState } from "react";
import {
  FaHistory,
  FaPlayCircle,
  FaDesktop,
  FaMobile,
  FaMapMarkerAlt,
  FaClock,
  FaMousePointer,
  FaArrowDown,
  FaEye,
  FaKeyboard,
  FaCheckCircle,
} from "react-icons/fa";
import AnalyticsCard from "./AnalyticsCard";
import styles from "./sessionReplay.module.css";

export default function SessionReplayTimeline({ sessionReplays = [] }) {
  const [selectedSessionId, setSelectedSessionId] = useState(
    sessionReplays[0]?.sessionId || null
  );

  const selectedSession =
    sessionReplays.find((s) => s.sessionId === selectedSessionId) ||
    sessionReplays[0];

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case "page_view":
        return <FaEye className={styles.eventIconBlue} />;
      case "click":
        return <FaMousePointer className={styles.eventIconCyan} />;
      case "hover":
        return <FaClock className={styles.eventIconAmber} />;
      case "scroll_milestone":
      case "scroll":
        return <FaArrowDown className={styles.eventIconGreen} />;
      case "form_focus":
      case "input_interaction":
      case "form_blur":
        return <FaKeyboard className={styles.eventIconPurple} />;
      case "form_submit":
        return <FaCheckCircle className={styles.eventIconGreen} />;
      default:
        return <FaPlayCircle className={styles.eventIconDefault} />;
    }
  };

  return (
    <AnalyticsCard
      title="SESSION TIMELINE & REPLAY STREAM"
      icon={FaHistory}
      subtitle="Visitor Activity Progression"
      className={styles.sessionCardSpan}
    >
      <div className={styles.sessionReplayContainer}>
        {/* Left column: Session List */}
        <div className={styles.sessionList}>
          <div className={styles.sessionListHeader}>Recent Sessions</div>
          {sessionReplays.length === 0 ? (
            <div className={styles.emptySessions}>No session replays found</div>
          ) : (
            sessionReplays.map((sess) => {
              const isSelected = sess.sessionId === selectedSession?.sessionId;
              const durationSec = Math.round((sess.durationMs || 0) / 1000);

              return (
                <div
                  key={sess.sessionId}
                  className={`${styles.sessionItem} ${
                    isSelected ? styles.sessionItemSelected : ""
                  }`}
                  onClick={() => setSelectedSessionId(sess.sessionId)}
                >
                  <div className={styles.sessionItemTop}>
                    <span className={styles.sessionIdText}>
                      {sess.sessionId.substring(0, 16)}...
                    </span>
                    <span className={styles.sessionTime}>
                      {new Date(sess.latestTimestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className={styles.sessionItemBottom}>
                    <span>
                      {sess.deviceType === "mobile" ? (
                        <FaMobile size={11} />
                      ) : (
                        <FaDesktop size={11} />
                      )}{" "}
                      {sess.deviceType}
                    </span>
                    <span>
                      <FaMapMarkerAlt size={10} /> {sess.country}
                    </span>
                    <span>{durationSec}s</span>
                    <span>{sess.eventCount} evs</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right column: Selected Session Event Timeline */}
        <div className={styles.timelineView}>
          {selectedSession ? (
            <>
              <div className={styles.timelineHeader}>
                <div className={styles.timelineTitle}>
                  Session Timeline:{" "}
                  <span className={styles.sessionIdHighlight}>
                    {selectedSession.sessionId}
                  </span>
                </div>
                <div className={styles.timelineMeta}>
                  <span>Entry: {selectedSession.page}</span>
                  <span>•</span>
                  <span>{selectedSession.eventCount} recorded events</span>
                  <span>•</span>
                  <span>
                    Duration:{" "}
                    {Math.round((selectedSession.durationMs || 0) / 1000)}s
                  </span>
                </div>
              </div>

              <div className={styles.timelineStream}>
                {selectedSession.timeline &&
                selectedSession.timeline.length > 0 ? (
                  selectedSession.timeline.map((ev, idx) => {
                    const timeStr = new Date(ev.timestamp).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }
                    );

                    return (
                      <div key={idx} className={styles.streamItem}>
                        <div className={styles.streamTime}>{timeStr}</div>
                        <div className={styles.streamIconWrapper}>
                          {getEventIcon(ev.eventType)}
                        </div>
                        <div className={styles.streamContent}>
                          <div className={styles.streamEventName}>
                            <span className={styles.eventTypeTag}>
                              {ev.eventType}
                            </span>
                            {ev.elementId && (
                              <span className={styles.elementTag}>
                                {ev.elementId}
                              </span>
                            )}
                          </div>
                          {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                            <div className={styles.streamMetadata}>
                              {ev.eventType === "scroll_milestone" && (
                                <span>
                                  Reached {ev.metadata.milestone}% depth
                                </span>
                              )}
                              {ev.eventType === "hover" && (
                                <span>
                                  Hovered for {ev.metadata.durationMs}ms
                                </span>
                              )}
                              {ev.eventType === "input_interaction" && (
                                <span>
                                  Typed {ev.metadata.charsTyped || 0} chars (
                                  {ev.metadata.backspaces || 0} corrections)
                                </span>
                              )}
                              {ev.eventType === "click" && (
                                <span>
                                  Click at ({ev.metadata.x}, {ev.metadata.y})
                                </span>
                              )}
                              {ev.eventType === "page_view" && (
                                <span>Page: {ev.page}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.emptyStream}>
                    No timeline events available for this session.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.emptyStream}>
              Select a session to view its activity stream.
            </div>
          )}
        </div>
      </div>
    </AnalyticsCard>
  );
}
