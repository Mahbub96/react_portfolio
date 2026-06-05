"use client";
import React, { useState, useEffect } from "react";
import {
  FaChartBar,
  FaEye,
  FaGlobe,
  FaClock,
  FaDesktop,
  FaMobile,
  FaTablet,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaTrendingUp,
  FaTrendingDown,
  FaChartLine,
  FaKeyboard,
  FaMouse,
  FaScroll,
  FaLaptopCode,
  FaLanguage,
  FaMousePointer,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaFire,
  FaWindowRestore,
  FaSync,
} from "react-icons/fa";
import styles from "./visitorAnalytics.module.css";
import { useDataContext } from "../contexts/useAllContext";

const VisitorAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loginHistory, setLoginHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { auth, isLoaded, makeAuthenticatedRequest, refreshAuth } =
    useDataContext();

  useEffect(() => {
    setIsMounted(true);
    fetchStats();
    if (auth) {
      fetchLoginHistory();
    }
  }, [auth, isLoaded]);

  const fetchStats = async () => {
    try {
      const response = await makeAuthenticatedRequest("/api/analytics");
      if (response.error) {
        if (response.status === 401) {
          const refreshed = refreshAuth();
          if (refreshed) {
            setTimeout(() => fetchStats(), 100);
            return;
          }
          console.log("Authentication failed. Please try logging in again.");
        } else {
          console.log(response.error || "An unexpected error occurred.");
        }
        return;
      }

      const data = await response.response.json();
      setStats(data);
    } catch (error) {
      console.log("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const response = await fetch("/api/auth/login-history");
      const data = await response.json();
      if (data.success) {
        setLoginHistory(data.data);
      }
    } catch (error) {
      console.log("Error fetching login history:", error);
    }
  };

  // Don't render anything until component is mounted on client
  if (!isMounted) {
    return null;
  }

  // Don't render anything if not authenticated or not loaded
  if (!auth || !isLoaded) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.analyticsContainer}>
        <div className={styles.loadingSpinner}>
          <FaChartBar className={styles.spinnerIcon} />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  // Only render if authenticated and loaded
  if (!auth || !isLoaded) {
    return null;
  }

  return (
    <>
      {/* Floating Analytics Button - Only show if authenticated */}
      <button
        className={styles.analyticsFloatBtn}
        onClick={() => {
          // Option to open full page or modal
          if (window.innerWidth > 768) {
            window.location.href = "/analytics";
          } else {
            setShowModal(true);
          }
        }}
        title="View Analytics"
      >
        <FaChartBar size={20} />
        <span className={styles.floatBtnLabel}>Analytics</span>
      </button>

      {/* Analytics Modal */}
      {showModal && (
        <div
          className={styles.analyticsModalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.analyticsModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.analyticsModalHeader}>
              <div className={styles.headerContent}>
                <div className={styles.headerIcon}>
                  <FaChartBar size={24} />
                </div>
                <div className={styles.headerText}>
                  <h2>Analytics Dashboard</h2>
                  <p>Real-time visitor insights and performance metrics.</p>
                </div>
              </div>
              <div className={styles.headerActions}>
                <a
                  href="/analytics"
                  className={styles.refreshBtn}
                  title="View Full Dashboard"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <FaGlobe size={16} />
                </a>
                <button
                  className={styles.refreshBtn}
                  onClick={fetchStats}
                  title="Refresh analytics"
                >
                  <FaSync size={16} />
                </button>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
            </div>

            <div className={styles.analyticsModalContent}>
              <div className={styles.heroStats}>
                <div className={styles.heroMain}>
                  <div className={styles.heroNumber}>
                    <FaEye size={32} />
                    <span className={styles.heroValue}>
                      {stats?.summary?.totalRecords?.toLocaleString() || 0}
                    </span>
                    <span className={styles.heroLabel}>Total Visits</span>
                  </div>
                </div>
                <div className={styles.heroSub}>
                  <div className={styles.heroSubItem}>
                    <FaClock size={16} />
                    <span>Today: {stats?.summary?.todayRecords || 0}</span>
                  </div>
                  <div className={styles.heroSubItem}>
                    <FaCalendarAlt size={16} />
                    <span>
                      This Week: {stats?.summary?.thisWeekRecords || 0}
                    </span>
                  </div>
                  <div className={styles.heroSubItem}>
                    <FaUsers size={16} />
                    <span>
                      This Month: {stats?.summary?.thisMonthRecords || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Overview Cards Grid */}
              <div className={styles.overviewGrid}>
                <div className={`${styles.statsCard} ${styles.totalVisitors}`}>
                  <div className={styles.cardHeader}>
                    <FaEye size={20} />
                    <span className={styles.cardTitle}>Total Records</span>
                  </div>
                  <div className={styles.cardValue}>
                    {stats?.summary?.totalRecords?.toLocaleString() || 0}
                  </div>
                </div>

                <div className={`${styles.statsCard} ${styles.todayVisitors}`}>
                  <div className={styles.cardHeader}>
                    <FaClock size={20} />
                    <span className={styles.cardTitle}>Today</span>
                  </div>
                  <div className={styles.cardValue}>
                    {stats?.summary?.todayRecords || 0}
                  </div>
                </div>

                <div className={`${styles.statsCard} ${styles.weekVisitors}`}>
                  <div className={styles.cardHeader}>
                    <FaCalendarAlt size={20} />
                    <span className={styles.cardTitle}>This Week</span>
                  </div>
                  <div className={styles.cardValue}>
                    {stats?.summary?.thisWeekRecords || 0}
                  </div>
                </div>

                <div className={`${styles.statsCard} ${styles.monthVisitors}`}>
                  <div className={styles.cardHeader}>
                    <FaUsers size={20} />
                    <span className={styles.cardTitle}>This Month</span>
                  </div>
                  <div className={styles.cardValue}>
                    {stats?.summary?.thisMonthRecords || 0}
                  </div>
                </div>
              </div>

              {/* Mouse & Keyboard Tracking */}
              {stats?.mouseEvents && (
                <div className={styles.overviewGrid}>
                  <div className={styles.statsCard}>
                    <div className={styles.cardHeader}>
                      <FaChartLine size={20} />
                      <span className={styles.cardTitle}>Mouse Clicks</span>
                    </div>
                    <div className={styles.cardValue}>
                      {stats.mouseEvents.totalClicks?.toLocaleString() || 0}
                    </div>
                  </div>

                  <div className={styles.statsCard}>
                    <div className={styles.cardHeader}>
                      <FaChartBar size={20} />
                      <span className={styles.cardTitle}>Mouse Moves</span>
                    </div>
                    <div className={styles.cardValue}>
                      {stats.mouseEvents.totalMoves?.toLocaleString() || 0}
                    </div>
                  </div>

                  <div className={styles.statsCard}>
                    <div className={styles.cardHeader}>
                      <FaArrowUp size={20} />
                      <span className={styles.cardTitle}>Avg Scroll %</span>
                    </div>
                    <div className={styles.cardValue}>
                      {Math.round(stats.mouseEvents.avgScrollDepth || 0)}%
                    </div>
                  </div>

                  <div className={styles.statsCard}>
                    <div className={styles.cardHeader}>
                      <FaClock size={20} />
                      <span className={styles.cardTitle}>Avg Time (s)</span>
                    </div>
                    <div className={styles.cardValue}>
                      {Math.round(
                        (stats.mouseEvents.avgTimeOnPage || 0) / 1000
                      )}
                      s
                    </div>
                  </div>
                </div>
              )}

              {stats?.keyboardEvents && (
                <div className={styles.overviewGrid}>
                  <div className={styles.statsCard}>
                    <div className={styles.cardHeader}>
                      <FaKeyboard size={20} />
                      <span className={styles.cardTitle}>Key Presses</span>
                    </div>
                    <div className={styles.cardValue}>
                      {stats.keyboardEvents.totalKeyPresses?.toLocaleString() ||
                        0}
                    </div>
                  </div>
                  {stats.keyboardEvents.totalKeyDowns > 0 && (
                    <div className={styles.statsCard}>
                      <div className={styles.cardHeader}>
                        <FaKeyboard size={20} />
                        <span className={styles.cardTitle}>Key Downs</span>
                      </div>
                      <div className={styles.cardValue}>
                        {stats.keyboardEvents.totalKeyDowns?.toLocaleString() ||
                          0}
                      </div>
                    </div>
                  )}
                  {stats.keyboardEvents.totalKeyUps > 0 && (
                    <div className={styles.statsCard}>
                      <div className={styles.cardHeader}>
                        <FaKeyboard size={20} />
                        <span className={styles.cardTitle}>Key Ups</span>
                      </div>
                      <div className={styles.cardValue}>
                        {stats.keyboardEvents.totalKeyUps?.toLocaleString() ||
                          0}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Page Statistics */}
              {stats?.pages?.length > 0 && (
                <div className={styles.analyticsSection}>
                  <div className={styles.sectionHeader}>
                    <FaGlobe size={20} />
                    <h3>Top Pages</h3>
                  </div>
                  <div className={styles.pageStatsList}>
                    {stats.pages.slice(0, 5).map((page, idx) => (
                      <div key={idx} className={styles.pageStatItem}>
                        <div className={styles.pageRank}>{idx + 1}</div>
                        <div className={styles.pageInfo}>
                          <div className={styles.pageName}>{page.page}</div>
                          <div className={styles.pagePath}>
                            Visits: {page.visits}
                          </div>
                        </div>
                        <div className={styles.pageMetrics}>
                          <div className={styles.pageCount}>
                            {Math.round((page.avgTimeOnPage || 0) / 1000)}s
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Device Statistics */}
              {stats?.devices?.length > 0 && (
                <div className={styles.analyticsSection}>
                  <div className={styles.sectionHeader}>
                    <FaDesktop size={20} />
                    <h3>Devices</h3>
                  </div>
                  <div className={styles.deviceStatsList}>
                    {stats.devices.map((device, idx) => (
                      <div key={idx} className={styles.deviceStatItem}>
                        <div className={styles.deviceInfo}>
                          {device.device === "desktop" ? (
                            <FaDesktop
                              size={20}
                              className={styles.deviceIcon}
                            />
                          ) : device.device === "mobile" ? (
                            <FaMobile size={20} className={styles.deviceIcon} />
                          ) : (
                            <FaTablet size={20} className={styles.deviceIcon} />
                          )}
                          <div className={styles.deviceName}>
                            {device.device}
                          </div>
                        </div>
                        <div className={styles.deviceMetrics}>
                          <div className={styles.deviceCount}>
                            {device.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {stats?.recent?.length > 0 && (
                <div className={styles.analyticsSection}>
                  <div className={styles.sectionHeader}>
                    <FaFire size={20} />
                    <h3>Recent Activity</h3>
                  </div>
                  <div className={styles.loginHistoryList}>
                    {stats.recent.slice(0, 10).map((record, idx) => (
                      <div key={idx} className={styles.loginHistoryItem}>
                        <div className={styles.loginTime}>
                          <FaClock size={14} />
                          <div className={styles.loginTimeDetail}>
                            {new Date(record.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className={styles.loginUser}>
                          <FaEye size={14} />
                          <span>{record.page}</span>
                        </div>
                        <div className={styles.loginStatus}>
                          <span>{record.deviceType}</span>
                          {record.country && <span>· {record.country}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Browser Statistics */}
              {stats?.browsers?.length > 0 && (
                <div className={styles.analyticsSection}>
                  <div className={styles.sectionHeader}>
                    <FaWindowRestore size={20} />
                    <h3>Browser Distribution</h3>
                  </div>
                  <div className={styles.deviceStatsList}>
                    {stats.browsers.map((browser, idx) => (
                      <div key={idx} className={styles.deviceStatItem}>
                        <div className={styles.deviceInfo}>
                          <FaWindowRestore
                            size={20}
                            className={styles.deviceIcon}
                          />
                          <div className={styles.deviceName}>
                            {browser.browser || browser._id}
                          </div>
                        </div>
                        <div className={styles.deviceMetrics}>
                          <div className={styles.deviceCount}>
                            {browser.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Country Statistics */}
              {stats?.countries?.length > 0 && (
                <div className={styles.analyticsSection}>
                  <div className={styles.sectionHeader}>
                    <FaMapMarkerAlt size={20} />
                    <h3>Top Countries</h3>
                  </div>
                  <div className={styles.deviceStatsList}>
                    {stats.countries.slice(0, 10).map((country, idx) => (
                      <div key={idx} className={styles.deviceStatItem}>
                        <div className={styles.deviceInfo}>
                          <FaMapMarkerAlt
                            size={20}
                            className={styles.deviceIcon}
                          />
                          <div className={styles.deviceName}>
                            {country.country || country._id}
                          </div>
                        </div>
                        <div className={styles.deviceMetrics}>
                          <div className={styles.deviceCount}>
                            {country.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Component Interactions */}
              {stats?.components?.length > 0 && (
                <div className={styles.analyticsSection}>
                  <div className={styles.sectionHeader}>
                    <FaMousePointer size={20} />
                    <h3>Top Interactive Components</h3>
                  </div>
                  <div className={styles.deviceStatsList}>
                    {stats.components.slice(0, 10).map((component, idx) => (
                      <div key={idx} className={styles.deviceStatItem}>
                        <div className={styles.deviceInfo}>
                          <FaMousePointer
                            size={20}
                            className={styles.deviceIcon}
                          />
                          <div className={styles.deviceName}>
                            {component.component || component._id}
                          </div>
                        </div>
                        <div className={styles.deviceMetrics}>
                          <div className={styles.deviceCount}>
                            {component.interactions}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Statistics */}
              {stats?.sessions && (
                <div className={styles.overviewGrid}>
                  <div className={styles.statsCard}>
                    <div className={styles.cardHeader}>
                      <FaUsers size={20} />
                      <span className={styles.cardTitle}>Total Sessions</span>
                    </div>
                    <div className={styles.cardValue}>
                      {stats.sessions.totalSessions?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className={styles.statsCard}>
                    <div className={styles.cardHeader}>
                      <FaGlobe size={20} />
                      <span className={styles.cardTitle}>
                        Avg Pages/Session
                      </span>
                    </div>
                    <div className={styles.cardValue}>
                      {Math.round(stats.sessions.avgPagesPerSession || 0)}
                    </div>
                  </div>
                  <div className={styles.statsCard}>
                    <div className={styles.cardHeader}>
                      <FaClock size={20} />
                      <span className={styles.cardTitle}>
                        Avg Session Duration
                      </span>
                    </div>
                    <div className={styles.cardValue}>
                      {Math.round(
                        (stats.sessions.avgSessionDuration || 0) / 1000
                      )}
                      s
                    </div>
                  </div>
                  <div className={styles.statsCard}>
                    <div className={styles.cardHeader}>
                      <FaMouse size={20} />
                      <span className={styles.cardTitle}>
                        Avg Clicks/Session
                      </span>
                    </div>
                    <div className={styles.cardValue}>
                      {Math.round(stats.sessions.avgClicksPerSession || 0)}
                    </div>
                  </div>
                </div>
              )}

              {/* Hourly Activity */}
              {stats?.hourly?.length > 0 && (
                <div className={styles.analyticsSection}>
                  <div className={styles.sectionHeader}>
                    <FaChartPie size={20} />
                    <h3>Hourly Activity (Today)</h3>
                  </div>
                  <div className={styles.hourlyChart}>
                    {stats.hourly.map((hour, idx) => {
                      const maxCount = Math.max(
                        ...stats.hourly.map((h) => h.count)
                      );
                      const height =
                        maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
                      return (
                        <div key={idx} className={styles.hourlyBar}>
                          <div
                            className={styles.barFill}
                            style={{ height: `${height}%` }}
                          >
                            {hour.count > 0 && (
                              <span className={styles.barValue}>
                                {hour.count}
                              </span>
                            )}
                          </div>
                          <div className={styles.barLabel}>{hour.hour}:00</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Data Message */}
              {(!stats || Object.keys(stats).length === 0) && (
                <div className={styles.analyticsSection}>
                  <div className={styles.noDataContent}>
                    <FaChartBar size={48} />
                    <h3>No Data Available</h3>
                    <p>
                      No analytics data has been collected yet. Data will appear
                      here as visitors interact with your portfolio.
                    </p>
                    <div className={styles.noDataActions}>
                      <button
                        className={styles.refreshBtn}
                        onClick={fetchStats}
                      >
                        <FaSync size={16} />
                        Refresh Data
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisitorAnalytics;
