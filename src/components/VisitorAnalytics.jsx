import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../DB/DB_init";
import { FaChartBar } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import styles from "./visitorAnalytics.module.css";
import { useDataContex } from "../contexts/useAllContext";
import { v4 as uuidv4 } from "uuid";
const VisitorAnalytics = () => {
  const { auth } = useDataContex(); // Get auth status
  const [isOpen, setIsOpen] = useState(false);
  const [visitorStats, setVisitorStats] = useState({
    totalCount: 0,
    browserStats: {},
    deviceStats: {},
    languageStats: {},
    timeStats: {
      hourly: {},
      daily: {},
      monthly: {},
    },
    screenSizes: {},
    pathStats: {},
    referrerStats: {},
    ipStats: {},
    recentVisits: [],
  });
  const [visitsToShow, setVisitsToShow] = useState(3);

  useEffect(() => {
    if (isOpen) {
      fetchVisitorStats();
    }
  }, [isOpen]);

  const fetchVisitorStats = async () => {
    try {
      const visitorCountDoc = await getDoc(doc(db, "analytics", "visitors"));
      const totalCount = visitorCountDoc.data()?.count || 0;

      const visitsCollection = collection(
        db,
        "analytics",
        "visitors",
        "details"
      );
      const visitsSnapshot = await getDocs(visitsCollection);

      const stats = {
        browserStats: {},
        deviceStats: {},
        languageStats: {},
        timeStats: {
          hourly: {},
          daily: {},
          monthly: {},
        },
        screenSizes: {},
        pathStats: {},
        referrerStats: {},
        ipStats: {},
        recentVisits: [],
      };

      visitsSnapshot.forEach((doc) => {
        const visit = doc.data();
        const visitDate = new Date(visit.timestamp);

        // Browser stats
        const browser =
          visit.userAgent.match(/(chrome|safari|firefox|edge|opera)/i)?.[0] ||
          "other";
        stats.browserStats[browser.toLowerCase()] =
          (stats.browserStats[browser.toLowerCase()] || 0) + 1;

        // Device stats
        stats.deviceStats[visit.platform] =
          (stats.deviceStats[visit.platform] || 0) + 1;

        // Language stats
        stats.languageStats[visit.language] =
          (stats.languageStats[visit.language] || 0) + 1;

        // Screen size stats
        stats.screenSizes[visit.screenResolution] =
          (stats.screenSizes[visit.screenResolution] || 0) + 1;

        // Path stats
        stats.pathStats[visit.pathname] =
          (stats.pathStats[visit.pathname] || 0) + 1;

        // Referrer stats
        stats.referrerStats[visit.referrer] =
          (stats.referrerStats[visit.referrer] || 0) + 1;

        // IP stats
        if (visit.ip) {
          stats.ipStats[visit.ip] = (stats.ipStats[visit.ip] || 0) + 1;
        }

        // Time stats
        const hour = visitDate.getHours();
        const day = visitDate.toLocaleDateString("en-US", { weekday: "long" });
        const month = visitDate.toLocaleDateString("en-US", { month: "long" });

        stats.timeStats.hourly[hour] = (stats.timeStats.hourly[hour] || 0) + 1;
        stats.timeStats.daily[day] = (stats.timeStats.daily[day] || 0) + 1;
        stats.timeStats.monthly[month] =
          (stats.timeStats.monthly[month] || 0) + 1;

        // Recent visits
        stats.recentVisits.push({
          timestamp: visit.timestamp,
          path: visit.pathname,
          referrer: visit.referrer,
          browser: browser.toLowerCase(),
          platform: visit.platform,
          language: visit.language,
          screenSize: visit.screenResolution,
          ip: visit.ip,
        });
      });

      setVisitorStats({
        totalCount,
        ...stats,
        recentVisits: stats.recentVisits
          .toSorted((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10),
      });
    } catch (error) {
      console.error("Error fetching visitor stats:", error);
    }
  };

  const renderStatSection = (
    title,
    data,
    formatter = (key, value) => `${key}: ${value}`
  ) => (
    <div className={styles.statsSection}>
      <h3>{title}</h3>
      <ul>
        {Object.entries(data)
          .sort(([, a], [, b]) => b - a)
          .map(([key, value]) => (
            <li key={key}>{formatter(key, value)}</li>
          ))}
      </ul>
    </div>
  );

  // If not authenticated, don't render anything
  if (!auth) return null;

  return (
    <>
      <button
        className={styles.analyticsFloatBtn}
        onClick={() => setIsOpen(true)}
        title="View Analytics"
      >
        <FaChartBar size={24} />
      </button>

      {isOpen && (
        <div className={styles.analyticsModalOverlay}>
          <div className={styles.analyticsModal}>
            <div className={styles.analyticsModalHeader}>
              <h2>
                <span className={styles.sectionNumber}>07.</span> Visitor
                Analytics
              </h2>
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
              >
                <IoMdClose size={24} />
              </button>
            </div>

            <div className={styles.analyticsModalContent}>
              <div className={`${styles.statsSection} ${styles.totalVisitors}`}>
                <h3>Total Visitors: {visitorStats.totalCount}</h3>
              </div>

              <div className={`${styles.statsSection} ${styles.ipStats}`}>
                <h3>IP Distribution</h3>
                <ul>
                  {Object.entries(visitorStats.ipStats || {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([ip, count]) => (
                      <li key={ip} className={styles.ipStatItem}>
                        <div className={styles.ipInfo}>
                          <span className={styles.ip}>{ip}</span>
                          <span className={styles.visitCount}>
                            {count} visits
                          </span>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>

              {renderStatSection("Most Visited Pages", visitorStats.pathStats)}

              {renderStatSection(
                "Browser Distribution",
                visitorStats.browserStats,
                (browser, count) =>
                  `${
                    browser.charAt(0).toUpperCase() + browser.slice(1)
                  }: ${count}`
              )}

              {renderStatSection("Device Types", visitorStats.deviceStats)}

              {renderStatSection("Languages", visitorStats.languageStats)}

              {renderStatSection(
                "Screen Resolutions",
                visitorStats.screenSizes
              )}

              {renderStatSection("Traffic Sources", visitorStats.referrerStats)}

              {renderStatSection(
                "Visits by Hour",
                visitorStats.timeStats.hourly,
                (hour, count) => `${hour}:00 - ${hour}:59: ${count} visits`
              )}

              {renderStatSection("Visits by Day", visitorStats.timeStats.daily)}

              {renderStatSection(
                "Visits by Month",
                visitorStats.timeStats.monthly
              )}

              <div className={styles.statsSection}>
                <h3>Recent Visits</h3>
                <div className={styles.recentVisitsContainer}>
                  <ul>
                    {visitorStats.recentVisits
                      .slice(0, visitsToShow)
                      .map((visit, index) => (
                        <li key={uuidv4()} className={styles.recentVisitItem}>
                          <div className={styles.visitTimestamp}>
                            {new Date(visit.timestamp).toLocaleString()}
                          </div>
                          <div className={styles.visitDetails}>
                            <span>IP: {visit.ip}</span>
                            <span>Page: {visit.path}</span>
                            <span>From: {visit.referrer || "Direct"}</span>
                            <span>Browser: {visit.browser}</span>
                            <span>Device: {visit.platform}</span>
                            <span>Screen: {visit.screenSize}</span>
                          </div>
                        </li>
                      ))}
                  </ul>
                  {visitorStats.recentVisits.length > visitsToShow && (
                    <button
                      className={styles.seeMoreButton}
                      onClick={() => setVisitsToShow((prev) => prev + 3)}
                    >
                      Load More <i className="fa fa-angle-down"></i>
                    </button>
                  )}
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
