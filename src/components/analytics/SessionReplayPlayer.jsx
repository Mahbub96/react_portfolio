"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  FaPlay,
  FaPause,
  FaRedo,
  FaStepForward,
  FaStepBackward,
  FaMousePointer,
  FaDesktop,
  FaMobile,
  FaExclamationTriangle,
  FaBolt,
  FaCheckCircle,
  FaKeyboard,
  FaArrowDown,
  FaEye,
  FaClock,
} from "react-icons/fa";
import AnalyticsCard from "./AnalyticsCard";
import styles from "./sessionReplayPlayer.module.css";

const SPEEDS = [0.25, 0.5, 1, 2, 4, 8];

export default function SessionReplayPlayer({ sessionReplays = [], initialSessionId = null }) {
  // Session selection
  const [selectedId, setSelectedId] = useState(
    initialSessionId || sessionReplays[0]?.sessionId || null
  );

  useEffect(() => {
    if (!selectedId && sessionReplays.length > 0) {
      setSelectedId(sessionReplays[0].sessionId);
    }
  }, [sessionReplays, selectedId]);

  const activeSession = useMemo(() => {
    return sessionReplays.find((s) => s.sessionId === selectedId) || sessionReplays[0] || null;
  }, [sessionReplays, selectedId]);

  // Flatten & sort events for the active session
  const sortedEvents = useMemo(() => {
    if (!activeSession?.timeline) return [];
    return [...activeSession.timeline].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [activeSession]);

  const sessionStart = useMemo(() => {
    if (sortedEvents.length === 0) return 0;
    return new Date(sortedEvents[0].timestamp).getTime();
  }, [sortedEvents]);

  const sessionDuration = useMemo(() => {
    if (sortedEvents.length < 2) return 1000;
    const end = new Date(sortedEvents[sortedEvents.length - 1].timestamp).getTime();
    return Math.max(end - sessionStart, 1000);
  }, [sortedEvents, sessionStart]);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentCursor, setCurrentCursor] = useState({ x: 50, y: 50, visible: true });
  const [clickRipple, setClickRipple] = useState(null);
  const [simulatedScrollY, setSimulatedScrollY] = useState(0);
  const [intelligentAlert, setIntelligentAlert] = useState(null);

  const requestRef = useRef(null);
  const lastTickRef = useRef(null);

  // Restart replay when session changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTimeMs(0);
    setClickRipple(null);
    setIntelligentAlert(null);
    setSimulatedScrollY(0);
    if (sortedEvents.length > 0) {
      const first = sortedEvents[0];
      if (first.metadata?.x != null) {
        setCurrentCursor({
          x: Math.max(5, Math.min(95, (first.metadata.x / 1366) * 100)),
          y: Math.max(5, Math.min(95, (first.metadata.y / 768) * 100)),
          visible: true,
        });
      }
    }
  }, [selectedId, sortedEvents]);

  // Compute cursor position and state at currentTimeMs
  const updatePlaybackState = useCallback(
    (timeMs) => {
      const targetAbsTime = sessionStart + timeMs;

      // Find the most recent event up to targetAbsTime
      let currentEvent = null;
      let lastPosEvent = null;
      let nextPosEvent = null;

      for (let i = 0; i < sortedEvents.length; i++) {
        const ev = sortedEvents[i];
        const evTime = new Date(ev.timestamp).getTime();

        if (evTime <= targetAbsTime) {
          currentEvent = ev;
          if (ev.metadata?.x != null && ev.metadata?.y != null) {
            lastPosEvent = ev;
          }
        } else {
          if (!nextPosEvent && ev.metadata?.x != null && ev.metadata?.y != null) {
            nextPosEvent = ev;
          }
        }
      }

      // Smooth cursor interpolation
      if (lastPosEvent) {
        const lastX = (lastPosEvent.metadata.x / 1366) * 100;
        const lastY = (lastPosEvent.metadata.y / 768) * 100;

        if (nextPosEvent) {
          const t0 = new Date(lastPosEvent.timestamp).getTime();
          const t1 = new Date(nextPosEvent.timestamp).getTime();
          const ratio = t1 > t0 ? Math.min(1, Math.max(0, (targetAbsTime - t0) / (t1 - t0))) : 0;

          const nextX = (nextPosEvent.metadata.x / 1366) * 100;
          const nextY = (nextPosEvent.metadata.y / 768) * 100;

          const interpX = lastX + (nextX - lastX) * ratio;
          const interpY = lastY + (nextY - lastY) * ratio;

          setCurrentCursor({
            x: Math.max(2, Math.min(98, interpX)),
            y: Math.max(2, Math.min(98, interpY)),
            visible: true,
          });
        } else {
          setCurrentCursor({
            x: Math.max(2, Math.min(98, lastX)),
            y: Math.max(2, Math.min(98, lastY)),
            visible: true,
          });
        }
      }

      // Check current action highlights
      if (currentEvent) {
        const evDelta = targetAbsTime - new Date(currentEvent.timestamp).getTime();

        // Trigger ripple if click happened within 400ms
        if ((currentEvent.eventType === "click" || currentEvent.eventType === "rage_click") && evDelta < 400) {
          setClickRipple({
            x: (currentEvent.metadata?.x / 1366) * 100,
            y: (currentEvent.metadata?.y / 768) * 100,
            isRage: currentEvent.eventType === "rage_click",
          });
        } else {
          setClickRipple(null);
        }

        // Scroll sync
        if (currentEvent.metadata?.scrollY != null) {
          setSimulatedScrollY(Math.min(300, Math.round(currentEvent.metadata.scrollY * 0.15)));
        } else if (currentEvent.metadata?.scrollDepth != null) {
          setSimulatedScrollY(Math.round((currentEvent.metadata.scrollDepth / 100) * 200));
        }

        // Intelligent alerts
        if (evDelta < 1500) {
          if (currentEvent.eventType === "rage_click") {
            setIntelligentAlert({ type: "rage", text: `⚡ Rage Click Detected on ${currentEvent.elementId || "UI element"}` });
          } else if (currentEvent.eventType === "form_error") {
            setIntelligentAlert({ type: "error", text: `⚠ Validation Error on ${currentEvent.elementId || "input field"}` });
          } else if (currentEvent.eventType === "long_hover") {
            setIntelligentAlert({ type: "warning", text: `⏳ Hesitation: Long Hover on ${currentEvent.elementId || "element"}` });
          } else if (currentEvent.eventType === "form_submit") {
            setIntelligentAlert({ type: "success", text: `✓ Conversion: Form Successfully Submitted!` });
          } else if (currentEvent.eventType === "rapid_scroll") {
            setIntelligentAlert({ type: "info", text: `⏩ Fast Skim: Rapid Scroll Detected` });
          } else {
            setIntelligentAlert(null);
          }
        } else {
          setIntelligentAlert(null);
        }
      }
    },
    [sessionStart, sortedEvents]
  );

  // Animation Frame Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      lastTickRef.current = null;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const loop = (timestamp) => {
      if (lastTickRef.current != null) {
        const deltaReal = timestamp - lastTickRef.current;
        const deltaSession = deltaReal * playbackSpeed;

        setCurrentTimeMs((prev) => {
          const next = prev + deltaSession;
          if (next >= sessionDuration) {
            setIsPlaying(false);
            updatePlaybackState(sessionDuration);
            return sessionDuration;
          }
          updatePlaybackState(next);
          return next;
        });
      }
      lastTickRef.current = timestamp;
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, playbackSpeed, sessionDuration, updatePlaybackState]);

  // Scrub timeline
  const handleScrub = (e) => {
    const val = Number(e.target.value);
    setCurrentTimeMs(val);
    updatePlaybackState(val);
  };

  // Jump to specific event
  const jumpToEvent = (ev) => {
    const evTime = new Date(ev.timestamp).getTime();
    const targetMs = Math.max(0, evTime - sessionStart);
    setCurrentTimeMs(targetMs);
    updatePlaybackState(targetMs);
  };

  // Jump relative event
  const jumpStep = (direction) => {
    const currentAbs = sessionStart + currentTimeMs;
    if (direction === "next") {
      const nextEv = sortedEvents.find((e) => new Date(e.timestamp).getTime() > currentAbs + 100);
      if (nextEv) jumpToEvent(nextEv);
    } else {
      const prevEvents = sortedEvents.filter((e) => new Date(e.timestamp).getTime() < currentAbs - 100);
      if (prevEvents.length > 0) {
        jumpToEvent(prevEvents[prevEvents.length - 1]);
      }
    }
  };

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AnalyticsCard
      title="INTERACTIVE SESSION REPLAY"
      icon={FaPlay}
      subtitle="Visual User Simulation & Replay Engine"
      className={styles.fullSpanCard}
    >
      <div className={styles.replayLayout}>
        {/* Left: Session Selector & Details */}
        <div className={styles.sessionSidebar}>
          <div className={styles.sidebarTitle}>Available Sessions</div>
          <div className={styles.sessionListScroll}>
            {sessionReplays.map((sess) => {
              const isSelected = sess.sessionId === selectedId;
              return (
                <div
                  key={sess.sessionId}
                  className={`${styles.sessionSelectCard} ${isSelected ? styles.selectedCard : ""}`}
                  onClick={() => setSelectedId(sess.sessionId)}
                >
                  <div className={styles.sessionCardTop}>
                    <span className={styles.cardId}>{sess.sessionId.substring(0, 14)}...</span>
                    <span className={styles.cardBadge}>{sess.country}</span>
                  </div>
                  <div className={styles.sessionCardBottom}>
                    <span>
                      {sess.deviceType === "mobile" ? <FaMobile size={11} /> : <FaDesktop size={11} />} {sess.deviceType}
                    </span>
                    <span>{Math.round((sess.durationMs || 0) / 1000)}s</span>
                    <span>{sess.eventCount} events</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Replay Preview & Video Controls */}
        <div className={styles.playerContainer}>
          {/* Simulated Website Viewport */}
          <div className={styles.screenPreviewWrapper}>
            <div className={styles.browserHeader}>
              <div className={styles.trafficLights}>
                <span className={styles.dotRed} />
                <span className={styles.dotYellow} />
                <span className={styles.dotGreen} />
              </div>
              <div className={styles.urlBar}>
                https://mahbub.dev{activeSession?.page || "/"}
              </div>
              <div className={styles.viewportDimensions}>1366 × 768</div>
            </div>

            <div
              className={styles.simulatedPage}
              style={{ transform: `translateY(-${simulatedScrollY}px)` }}
            >
              {/* Intelligent Alert Banner */}
              {intelligentAlert && (
                <div className={`${styles.alertBanner} ${styles[intelligentAlert.type]}`}>
                  {intelligentAlert.text}
                </div>
              )}

              {/* Page Wireframe Content */}
              <div className={styles.wireframeHeroSection}>
                <div className={styles.heroTextPlaceholder}>
                  <div className={styles.heroBadge} />
                  <div className={styles.heroHeading} />
                  <div className={styles.heroSubtitle} />
                  <div className={styles.heroCta} id="cta-button" />
                </div>
                <div className={styles.heroAvatarPlaceholder} />
              </div>

              <div className={styles.wireframeGridSection}>
                <div className={styles.wireframeProjectCard} id="project-card-1" />
                <div className={styles.wireframeProjectCard} id="project-card-2" />
                <div className={styles.wireframeProjectCard} id="project-card-3" />
              </div>

              <div className={styles.wireframeContactSection}>
                <div className={styles.wireframeInput} id="contact-name" />
                <div className={styles.wireframeInput} id="contact-email" />
                <div className={styles.wireframeButton} id="contact-submit" />
              </div>

              {/* Animated Click Ripple */}
              {clickRipple && (
                <div
                  className={`${styles.clickRippleEffect} ${clickRipple.isRage ? styles.rageRipple : ""}`}
                  style={{ left: `${clickRipple.x}%`, top: `${clickRipple.y}%` }}
                />
              )}

              {/* Animated Replay Mouse Cursor */}
              {currentCursor.visible && (
                <div
                  className={styles.simulatedCursor}
                  style={{
                    left: `${currentCursor.x}%`,
                    top: `${currentCursor.y}%`,
                  }}
                >
                  <FaMousePointer className={styles.cursorIcon} />
                  <div className={styles.cursorBeacon} />
                </div>
              )}
            </div>
          </div>

          {/* Video Control Bar */}
          <div className={styles.controlBar}>
            {/* Scrubber with Event Markers */}
            <div className={styles.scrubberWrapper}>
              <div className={styles.scrubberMarkers}>
                {sortedEvents.map((ev, idx) => {
                  const evTime = new Date(ev.timestamp).getTime();
                  const posPercent = ((evTime - sessionStart) / sessionDuration) * 100;
                  let color = "#60a5fa";
                  if (ev.eventType === "click") color = "#38bdf8";
                  if (ev.eventType === "rage_click" || ev.eventType === "form_error") color = "#ef4444";
                  if (ev.eventType === "long_hover") color = "#f59e0b";
                  if (ev.eventType === "form_submit") color = "#10b981";

                  return (
                    <div
                      key={idx}
                      className={styles.scrubberDot}
                      style={{ left: `${posPercent}%`, backgroundColor: color }}
                      title={`${ev.eventType} at ${formatTime(evTime - sessionStart)}`}
                      onClick={() => jumpToEvent(ev)}
                    />
                  );
                })}
              </div>
              <input
                type="range"
                min="0"
                max={sessionDuration}
                value={currentTimeMs}
                onChange={handleScrub}
                className={styles.timelineScrubber}
              />
            </div>

            {/* Buttons row */}
            <div className={styles.controlRow}>
              <div className={styles.mainControls}>
                <button
                  className={styles.ctrlBtn}
                  onClick={() => setIsPlaying(!isPlaying)}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
                </button>
                <button
                  className={styles.ctrlBtn}
                  onClick={() => {
                    setCurrentTimeMs(0);
                    updatePlaybackState(0);
                  }}
                  title="Restart"
                >
                  <FaRedo size={12} />
                </button>
                <button
                  className={styles.ctrlBtn}
                  onClick={() => jumpStep("prev")}
                  title="Previous Event"
                >
                  <FaStepBackward size={12} />
                </button>
                <button
                  className={styles.ctrlBtn}
                  onClick={() => jumpStep("next")}
                  title="Next Event"
                >
                  <FaStepForward size={12} />
                </button>
                <div className={styles.timeCounter}>
                  <span>{formatTime(currentTimeMs)}</span>
                  <span className={styles.timeSlash}>/</span>
                  <span>{formatTime(sessionDuration)}</span>
                </div>
              </div>

              {/* Speed Buttons */}
              <div className={styles.speedSelector}>
                {SPEEDS.map((spd) => (
                  <button
                    key={spd}
                    className={`${styles.speedBtn} ${playbackSpeed === spd ? styles.activeSpeed : ""}`}
                    onClick={() => setPlaybackSpeed(spd)}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Synchronized Event Jump Log */}
        <div className={styles.eventLogSidebar}>
          <div className={styles.sidebarTitle}>Interaction Stream</div>
          <div className={styles.eventListScroll}>
            {sortedEvents.map((ev, idx) => {
              const evTime = new Date(ev.timestamp).getTime();
              const offsetMs = Math.max(0, evTime - sessionStart);
              const isPast = currentTimeMs >= offsetMs;

              return (
                <div
                  key={idx}
                  className={`${styles.logItem} ${isPast ? styles.logItemActive : ""}`}
                  onClick={() => jumpToEvent(ev)}
                >
                  <div className={styles.logTime}>{formatTime(offsetMs)}</div>
                  <div className={styles.logBody}>
                    <div className={styles.logHeader}>
                      <span className={`${styles.logTypeBadge} ${styles[ev.eventType]}`}>
                        {ev.eventType}
                      </span>
                    </div>
                    {ev.elementId && <div className={styles.logElement}>{ev.elementId}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AnalyticsCard>
  );
}
