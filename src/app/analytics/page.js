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
  FaNetworkWired,
  FaLanguage,
  FaDesktopAlt,
  FaExternalLinkAlt,
  FaCalendar,
  FaChartLine,
  FaLock,
} from "react-icons/fa";
import styles from "./analytics.module.css";

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check authentication status
    if (typeof window !== "undefined") {
      const savedAuth = localStorage.getItem("isAuthenticated");
      setIsAuthenticated(savedAuth === "true");
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      fetchStats();
    }
  }, [authChecked, isAuthenticated]);

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

  // Check if authentication has been checked and user is not authenticated
  if (authChecked && !isAuthenticated) {
    return (
      <div className={styles.analyticsPage}>
        <div className={styles.header}>
          <h1>
            <FaLock />
            Access Denied
          </h1>
          <p>You need to be logged in to view analytics</p>
        </div>
        <div className={styles.errorContainer}>
          <h2>Authentication Required</h2>
          <p>
            This page is only accessible to authenticated users. Please log in
            to view analytics data.
          </p>
          <button
            onClick={() => window.history.back()}
            className={styles.backButton}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <FaChartBar className={styles.spinnerIcon} />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.errorContainer}>
        <h2>No Analytics Data Available</h2>
        <p>
          Analytics data will appear here as visitors interact with your
          portfolio.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: FaChartBar },
    { id: "visitors", label: "Visitors", icon: FaUsers },
    { id: "pages", label: "Pages", icon: FaGlobe },
    { id: "devices", label: "Devices", icon: FaDesktop },
    { id: "geography", label: "Geography", icon: FaMapMarkerAlt },
    { id: "traffic", label: "Traffic Sources", icon: FaGlobe },
    { id: "time", label: "Time Analysis", icon: FaClock },
    { id: "technical", label: "Technical", icon: FaDesktop },
  ];

  return (
    <div className={styles.analyticsPage}>
      <div className={styles.header}>
        <h1>
          <FaChartBar />
          Visitor Analytics
        </h1>
        <p>Comprehensive analytics for your portfolio</p>
      </div>

      {/* Overview Cards */}
      <div className={styles.overviewCards}>
        <div className={styles.overviewCard}>
          <FaEye />
          <h3>{stats.totalVisitors?.toLocaleString() || 0}</h3>
          <p>Total Visitors</p>
        </div>
        <div className={styles.overviewCard}>
          <FaClock />
          <h3>{stats.todayVisitors || 0}</h3>
          <p>Today</p>
        </div>
        <div className={styles.overviewCard}>
          <FaCalendarAlt />
          <h3>{stats.thisWeekVisitors || 0}</h3>
          <p>This Week</p>
        </div>
        <div className={styles.overviewCard}>
          <FaUsers />
          <h3>{stats.thisMonthVisitors || 0}</h3>
          <p>This Month</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabNavigation}>
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          if (!IconComponent) {
            console.warn(`Icon component not found for tab: ${tab.id}`);
            return null;
          }
          return (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${
                activeTab === tab.id ? styles.active : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "overview" && (
          <div className={styles.overviewContent}>
            <div className={styles.overviewGrid}>
              <div className={styles.overviewSection}>
                <h3>Most Visited Pages</h3>
                <div className={styles.statsList}>
                  {stats.pageStats?.slice(0, 5).map((page, index) => (
                    <div key={page._id} className={styles.statItem}>
                      <span className={styles.statRank}>#{index + 1}</span>
                      <span className={styles.statName}>{page._id}</span>
                      <span className={styles.statCount}>{page.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.overviewSection}>
                <h3>Browser Distribution</h3>
                <div className={styles.statsList}>
                  {stats.browserStats?.map((browser) => (
                    <div key={browser.browser} className={styles.statItem}>
                      <span className={styles.statName}>{browser.browser}</span>
                      <span className={styles.statCount}>{browser.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.overviewSection}>
                <h3>Device Types</h3>
                <div className={styles.statsList}>
                  {stats.deviceStats?.map((device) => (
                    <div key={device.device} className={styles.statItem}>
                      <span className={styles.statName}>{device.device}</span>
                      <span className={styles.statCount}>{device.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.overviewSection}>
                <h3>Top Countries</h3>
                <div className={styles.statsList}>
                  {stats.countryStats?.slice(0, 5).map((country) => (
                    <div key={country.country} className={styles.statItem}>
                      <span className={styles.statName}>{country.country}</span>
                      <span className={styles.statCount}>{country.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "visitors" && (
          <div className={styles.visitorsContent}>
            <div className={styles.section}>
              <h3>IP Distribution</h3>
              <div className={styles.statsList}>
                {stats.ipStats?.slice(0, 20).map((ip) => (
                  <div key={ip.ip} className={styles.statItem}>
                    <span className={styles.statName}>{ip.ip}</span>
                    <span className={styles.statCount}>{ip.count} visits</span>
                  </div>
                ))}
              </div>
            </div>

            {stats.recentVisits && (
              <div className={styles.section}>
                <h3>Recent Visits</h3>
                <div className={styles.recentVisitsList}>
                  {stats.recentVisits.slice(0, 10).map((visit, index) => (
                    <div key={index} className={styles.recentVisitItem}>
                      <div className={styles.visitTime}>
                        {new Date(visit.timestamp).toLocaleString()}
                      </div>
                      <div className={styles.visitDetails}>
                        <span>IP: {visit.ip}</span>
                        <span>Page: {visit.page}</span>
                        <span>From: {visit.referrer || "direct"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "pages" && (
          <div className={styles.pagesContent}>
            <div className={styles.section}>
              <h3>Most Visited Pages</h3>
              <div className={styles.statsList}>
                {stats.pageStats?.map((page, index) => (
                  <div key={page._id} className={styles.statItem}>
                    <span className={styles.statRank}>#{index + 1}</span>
                    <span className={styles.statName}>{page._id}</span>
                    <span className={styles.statCount}>{page.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "devices" && (
          <div className={styles.devicesContent}>
            <div className={styles.section}>
              <h3>Device Types</h3>
              <div className={styles.statsList}>
                {stats.deviceStats?.map((device) => (
                  <div key={device.device} className={styles.statItem}>
                    <span className={styles.statName}>{device.device}</span>
                    <span className={styles.statCount}>{device.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h3>Screen Resolutions</h3>
              <div className={styles.statsList}>
                {stats.screenStats?.slice(0, 15).map((screen) => (
                  <div key={screen.resolution} className={styles.statItem}>
                    <span className={styles.statName}>{screen.resolution}</span>
                    <span className={styles.statCount}>{screen.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "geography" && (
          <div className={styles.geographyContent}>
            <div className={styles.section}>
              <h3>Top Countries</h3>
              <div className={styles.statsList}>
                {stats.countryStats?.map((country) => (
                  <div key={country.country} className={styles.statItem}>
                    <span className={styles.statName}>{country.country}</span>
                    <span className={styles.statCount}>{country.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h3>Languages</h3>
              <div className={styles.statsList}>
                {stats.languageStats?.map((lang) => (
                  <div key={lang.language} className={styles.statItem}>
                    <span className={styles.statName}>{lang.language}</span>
                    <span className={styles.statCount}>{lang.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "traffic" && (
          <div className={styles.trafficContent}>
            <div className={styles.section}>
              <h3>Traffic Sources</h3>
              <div className={styles.statsList}>
                {stats.trafficStats?.map((source) => (
                  <div key={source.source} className={styles.statItem}>
                    <span className={styles.statName}>{source.source}</span>
                    <span className={styles.statCount}>{source.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "time" && (
          <div className={styles.timeContent}>
            <div className={styles.section}>
              <h3>Visits by Hour (Today)</h3>
              <div className={styles.statsList}>
                {stats.hourlyStats?.map((hour) => (
                  <div key={hour.hour} className={styles.statItem}>
                    <span className={styles.statName}>{hour.hour}</span>
                    <span className={styles.statCount}>
                      {hour.count} visits
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h3>Visits by Day</h3>
              <div className={styles.statsList}>
                {stats.dailyStats?.map((day) => (
                  <div key={day.day} className={styles.statItem}>
                    <span className={styles.statName}>{day.day}</span>
                    <span className={styles.statCount}>{day.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h3>Visits by Month</h3>
              <div className={styles.statsList}>
                {stats.monthlyStats?.map((month) => (
                  <div key={month.month} className={styles.statItem}>
                    <span className={styles.statName}>{month.month}</span>
                    <span className={styles.statCount}>{month.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "technical" && (
          <div className={styles.technicalContent}>
            <div className={styles.section}>
              <h3>Browser Distribution</h3>
              <div className={styles.statsList}>
                {stats.browserStats?.map((browser) => (
                  <div key={browser.browser} className={styles.statItem}>
                    <span className={styles.statName}>{browser.browser}</span>
                    <span className={styles.statCount}>{browser.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h3>Languages</h3>
              <div className={styles.statsList}>
                {stats.languageStats?.map((lang) => (
                  <div key={lang.language} className={styles.statItem}>
                    <span className={styles.statName}>{lang.language}</span>
                    <span className={styles.statCount}>{lang.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h3>Screen Resolutions</h3>
              <div className={styles.statsList}>
                {stats.screenStats?.map((screen) => (
                  <div key={screen.resolution} className={styles.statItem}>
                    <span className={styles.statName}>{screen.resolution}</span>
                    <span className={styles.statCount}>{screen.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
