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
} from "react-icons/fa";
import styles from "./visitorAnalytics.module.css";

const VisitorAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

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

  // Sample data for demonstration (remove this in production)
  const sampleStats = {
    totalVisitors: 1247,
    todayVisitors: 23,
    thisWeekVisitors: 156,
    thisMonthVisitors: 892,
    pageStats: [
      { _id: "/", count: 456 },
      { _id: "/projects", count: 234 },
      { _id: "/skills", count: 189 },
      { _id: "/contact", count: 123 },
      { _id: "/about", count: 98 },
    ],
    deviceStats: [
      { device: "Desktop", count: 789 },
      { device: "Mobile", count: 345 },
      { device: "Tablet", count: 113 },
    ],
    countryStats: [
      { country: "United States", count: 234 },
      { country: "Bangladesh", count: 189 },
      { country: "United Kingdom", count: 156 },
      { country: "Canada", count: 98 },
      { country: "Germany", count: 67 },
    ],
    hourlyStats: [
      { hour: "00:00", count: 12 },
      { hour: "06:00", count: 8 },
      { hour: "12:00", count: 45 },
      { hour: "18:00", count: 67 },
      { hour: "23:00", count: 23 },
    ],
  };

  const displayStats = stats || sampleStats;

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

  return (
    <>
      {/* Floating Analytics Button */}
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
                Visitor Analytics
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
                  <h3>{displayStats.totalVisitors?.toLocaleString()}</h3>
                  <p>Total Visitors</p>
                </div>

                <div className={`${styles.statsCard} ${styles.todayVisitors}`}>
                  <FaClock size={24} />
                  <h3>{displayStats.todayVisitors}</h3>
                  <p>Today</p>
                </div>

                <div className={`${styles.statsCard} ${styles.weekVisitors}`}>
                  <FaCalendarAlt size={24} />
                  <h3>{displayStats.thisWeekVisitors}</h3>
                  <p>This Week</p>
                </div>

                <div className={`${styles.statsCard} ${styles.monthVisitors}`}>
                  <FaUsers size={24} />
                  <h3>{displayStats.thisMonthVisitors}</h3>
                  <p>This Month</p>
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className={styles.analyticsGrid}>
                {/* Top Pages */}
                <div className={styles.analyticsSection}>
                  <h3>
                    <FaGlobe size={16} />
                    Top Pages
                  </h3>
                  <div className={styles.pageStatsList}>
                    {displayStats.pageStats?.slice(0, 5).map((page, index) => (
                      <div key={page._id} className={styles.pageStatItem}>
                        <span className={styles.pageRank}>#{index + 1}</span>
                        <span className={styles.pageName}>{page._id}</span>
                        <span className={styles.pageCount}>{page.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Types */}
                <div className={styles.analyticsSection}>
                  <h3>
                    <FaDesktop size={16} />
                    Device Types
                  </h3>
                  <div className={styles.deviceStatsList}>
                    {displayStats.deviceStats?.map((device) => (
                      <div
                        key={device.device}
                        className={styles.deviceStatItem}
                      >
                        <span className={styles.deviceIcon}>
                          {device.device === "Desktop" && (
                            <FaDesktop size={14} />
                          )}
                          {device.device === "Mobile" && <FaMobile size={14} />}
                          {device.device === "Tablet" && <FaTablet size={14} />}
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

                {/* Top Countries */}
                <div className={styles.analyticsSection}>
                  <h3>
                    <FaMapMarkerAlt size={16} />
                    Top Countries
                  </h3>
                  <div className={styles.countryStatsList}>
                    {displayStats.countryStats?.slice(0, 5).map((country) => (
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

                {/* Hourly Activity */}
                <div className={styles.analyticsSection}>
                  <h3>
                    <FaClock size={16} />
                    Hourly Activity
                  </h3>
                  <div className={styles.hourlyStatsList}>
                    {displayStats.hourlyStats?.map((hour) => (
                      <div key={hour.hour} className={styles.hourlyStatItem}>
                        <span className={styles.hourTime}>{hour.hour}</span>
                        <div className={styles.hourlyBar}>
                          <div
                            className={styles.hourlyBarFill}
                            style={{ width: `${(hour.count / 67) * 100}%` }}
                          ></div>
                        </div>
                        <span className={styles.hourlyCount}>{hour.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisitorAnalytics;
