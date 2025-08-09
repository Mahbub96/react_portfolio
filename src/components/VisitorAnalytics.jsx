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
  FaSignInAlt,
  FaShieldAlt,
} from "react-icons/fa";
import styles from "./visitorAnalytics.module.css";
import { useDataContex } from "../contexts/useAllContext";

const VisitorAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loginHistory, setLoginHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { auth, isLoaded } = useDataContex();

  useEffect(() => {
    setIsMounted(true);
    fetchStats();
    if (auth) {
      fetchLoginHistory();
    }
  }, [auth, isLoaded]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/visitors");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
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
      console.error("Error fetching login history:", error);
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
        onClick={() => setShowModal(true)}
        title="View Analytics"
      >
        <FaChartBar size={20} />
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
              <h2>
                <span className={styles.sectionNumber}>📊</span>
                {auth ? "Admin Dashboard" : "Visitor Analytics"}
              </h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.analyticsModalContent}>
              {/* Overview Cards */}
              <div className={styles.overviewGrid}>
                <div className={`${styles.statsCard} ${styles.totalVisitors}`}>
                  <FaEye size={24} />
                  <h3>{stats?.totalVisitors?.toLocaleString() || 0}</h3>
                  <p>Total Visitors</p>
                </div>

                <div className={`${styles.statsCard} ${styles.todayVisitors}`}>
                  <FaClock size={24} />
                  <h3>{stats?.todayVisitors || 0}</h3>
                  <p>Today</p>
                </div>

                <div className={`${styles.statsCard} ${styles.weekVisitors}`}>
                  <FaCalendarAlt size={24} />
                  <h3>{stats?.thisWeekVisitors || 0}</h3>
                  <p>This Week</p>
                </div>

                <div className={`${styles.statsCard} ${styles.monthVisitors}`}>
                  <FaUsers size={24} />
                  <h3>{stats?.thisMonthVisitors || 0}</h3>
                  <p>This Month</p>
                </div>

                {/* Admin-specific cards */}
                {auth && loginHistory && (
                  <>
                    <div className={`${styles.statsCard} ${styles.loginStats}`}>
                      <FaSignInAlt size={24} />
                      <h3>{loginHistory.statistics?.successfulLogins || 0}</h3>
                      <p>Successful Logins</p>
                    </div>

                    <div
                      className={`${styles.statsCard} ${styles.securityStats}`}
                    >
                      <FaShieldAlt size={24} />
                      <h3>{loginHistory.statistics?.successRate || 0}%</h3>
                      <p>Success Rate</p>
                    </div>
                  </>
                )}
              </div>

              {/* Detailed Analytics */}
              <div className={styles.analyticsGrid}>
                {/* Top Pages */}
                {stats?.pageStats && stats.pageStats.length > 0 && (
                  <div className={styles.analyticsSection}>
                    <h3>
                      <FaGlobe size={16} />
                      Top Pages
                    </h3>
                    <div className={styles.pageStatsList}>
                      {stats.pageStats.slice(0, 5).map((page, index) => (
                        <div key={page._id} className={styles.pageStatItem}>
                          <span className={styles.pageRank}>#{index + 1}</span>
                          <span className={styles.pageName}>{page._id}</span>
                          <span className={styles.pageCount}>{page.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Device Types */}
                {stats?.deviceStats && stats.deviceStats.length > 0 && (
                  <div className={styles.analyticsSection}>
                    <h3>
                      <FaDesktop size={16} />
                      Device Types
                    </h3>
                    <div className={styles.deviceStatsList}>
                      {stats.deviceStats.map((device) => (
                        <div
                          key={device.device}
                          className={styles.deviceStatItem}
                        >
                          <span className={styles.deviceIcon}>
                            {device.device === "Desktop" && (
                              <FaDesktop size={14} />
                            )}
                            {device.device === "Mobile" && (
                              <FaMobile size={14} />
                            )}
                            {device.device === "Tablet" && (
                              <FaTablet size={14} />
                            )}
                          </span>
                          <span className={styles.deviceName}>
                            {device.device}
                          </span>
                          <span className={styles.deviceCount}>
                            {device.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Countries */}
                {stats?.countryStats && stats.countryStats.length > 0 && (
                  <div className={styles.analyticsSection}>
                    <h3>
                      <FaMapMarkerAlt size={16} />
                      Top Countries
                    </h3>
                    <div className={styles.countryStatsList}>
                      {stats.countryStats.slice(0, 5).map((country) => (
                        <div
                          key={country.country}
                          className={styles.countryStatItem}
                        >
                          <span className={styles.countryName}>
                            {country.country}
                          </span>
                          <span className={styles.countryCount}>
                            {country.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Login History (Admin Only) */}
                {auth &&
                  loginHistory &&
                  loginHistory.recentSuccessfulLogins &&
                  loginHistory.recentSuccessfulLogins.length > 0 && (
                    <div className={styles.analyticsSection}>
                      <h3>
                        <FaSignInAlt size={16} />
                        Recent Login Activity
                      </h3>
                      <div className={styles.loginHistoryList}>
                        {loginHistory.recentSuccessfulLogins
                          .slice(0, 5)
                          .map((login, index) => (
                            <div
                              key={index}
                              className={styles.loginHistoryItem}
                            >
                              <span className={styles.loginTime}>
                                {new Date(login.createdAt).toLocaleString()}
                              </span>
                              <span className={styles.loginUser}>
                                {login.username}
                              </span>
                              <span className={styles.loginStatus}>
                                {login.success ? "✅" : "❌"}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Hourly Activity */}
                {stats?.hourlyStats && stats.hourlyStats.length > 0 && (
                  <div className={styles.analyticsSection}>
                    <h3>
                      <FaClock size={16} />
                      Hourly Activity
                    </h3>
                    <div className={styles.hourlyStatsList}>
                      {stats.hourlyStats.map((hour) => (
                        <div key={hour.hour} className={styles.hourlyStatItem}>
                          <span className={styles.hourTime}>{hour.hour}</span>
                          <div className={styles.hourlyBar}>
                            <div
                              className={styles.hourlyBarFill}
                              style={{
                                width: `${
                                  (hour.count /
                                    Math.max(
                                      ...stats.hourlyStats.map((h) => h.count)
                                    )) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className={styles.hourlyCount}>
                            {hour.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Data Message */}
                {(!stats || Object.keys(stats).length === 0) && (
                  <div className={styles.analyticsSection}>
                    <h3>
                      <FaChartBar size={16} />
                      No Data Available
                    </h3>
                    <p
                      style={{
                        textAlign: "center",
                        color: "var(--text-secondary)",
                        padding: "20px",
                      }}
                    >
                      No analytics data has been collected yet. Data will appear
                      here as visitors interact with your portfolio.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisitorAnalytics;
