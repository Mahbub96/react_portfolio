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
  FaTrendingUp,
  FaTrendingDown,
  FaChartLine,
  FaUserSecret,
  FaStar,
  FaTrophy,
} from "react-icons/fa";
import styles from "./visitorAnalytics.module.css";
import { useDataContext } from "../contexts/useAllContext";

const VisitorAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loginHistory, setLoginHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { auth, isLoaded, makeAuthenticatedRequest } = useDataContext();

  useEffect(() => {
    setIsMounted(true);
    fetchStats();
    if (auth) {
      fetchLoginHistory();
    }
  }, [auth, isLoaded]);

  const fetchStats = async () => {
    try {
      const response = await makeAuthenticatedRequest("/api/visitors");
      if (response.error) {
        if (response.status === 401) {
          const refreshed = refreshAuth();
          if (refreshed) {
            setTimeout(() => fetchStats(), 100);
            return;
          }
          setError("Authentication failed. Please try logging in again.");
        } else {
          setError(response.error || "An unexpected error occurred.");
        }
        return;
      }

      const data = await response.response.json();
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
                  <p>Real-time visitor insights and performance metrics</p>
                </div>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.analyticsModalContent}>
              <div className={styles.heroStats}>
                <div className={styles.heroMain}>
                  <div className={styles.heroNumber}>
                    <FaEye size={32} />
                    <span className={styles.heroValue}>
                      {stats?.totalVisitors?.toLocaleString() || 0}
                    </span>
                    <span className={styles.heroLabel}>Total Visitors</span>
                  </div>
                </div>
                <div className={styles.heroSub}>
                  <div className={styles.heroSubItem}>
                    <FaClock size={16} />
                    <span>Today: {stats?.todayVisitors || 0}</span>
                  </div>
                  <div className={styles.heroSubItem}>
                    <FaCalendarAlt size={16} />
                    <span>This Week: {stats?.thisWeekVisitors || 0}</span>
                  </div>
                  <div className={styles.heroSubItem}>
                    <FaUsers size={16} />
                    <span>This Month: {stats?.thisMonthVisitors || 0}</span>
                  </div>
                </div>
              </div>

              {/* Overview Cards Grid */}
              <div className={styles.overviewGrid}>
                <div className={`${styles.statsCard} ${styles.totalVisitors}`}>
                  <div className={styles.cardHeader}>
                    <FaEye size={20} />
                    <span className={styles.cardTitle}>Total Visitors</span>
                  </div>
                  <div className={styles.cardValue}>
                    {stats?.totalVisitors?.toLocaleString() || 0}
                  </div>
                </div>

                <div className={`${styles.statsCard} ${styles.todayVisitors}`}>
                  <div className={styles.cardHeader}>
                    <FaClock size={20} />
                    <span className={styles.cardTitle}>Today</span>
                  </div>
                  <div className={styles.cardValue}>
                    {stats?.todayVisitors || 0}
                  </div>
                </div>

                <div className={`${styles.statsCard} ${styles.weekVisitors}`}>
                  <div className={styles.cardHeader}>
                    <FaCalendarAlt size={20} />
                    <span className={styles.cardTitle}>This Week</span>
                  </div>
                  <div className={styles.cardValue}>
                    {stats?.thisWeekVisitors || 0}
                  </div>
                </div>

                <div className={`${styles.statsCard} ${styles.monthVisitors}`}>
                  <div className={styles.cardHeader}>
                    <FaUsers size={20} />
                    <span className={styles.cardTitle}>This Month</span>
                  </div>
                  <div className={styles.cardValue}>
                    {stats?.thisMonthVisitors || 0}
                  </div>
                </div>
              </div>

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
                        <FaChartBar size={16} />
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
