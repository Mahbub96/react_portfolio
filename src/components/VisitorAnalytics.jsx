import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../DB/DB_init";
import { FaChartBar } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const VisitorAnalytics = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [visitorStats, setVisitorStats] = useState({
    totalCount: 0,
    browserStats: {},
    deviceStats: {},
    recentVisits: [],
  });

  useEffect(() => {
    if (isOpen) {
      fetchVisitorStats();
    }
  }, [isOpen]);

  const fetchVisitorStats = async () => {
    try {
      // Get total visitor count
      const visitorCountDoc = await getDoc(doc(db, "analytics", "visitors"));
      const totalCount = visitorCountDoc.data()?.count || 0;

      // Get detailed visit information
      const visitsCollection = collection(
        db,
        "analytics",
        "visitors",
        "details"
      );
      const visitsSnapshot = await getDocs(visitsCollection);

      const browserStats = {};
      const deviceStats = {};
      const recentVisits = [];

      visitsSnapshot.forEach((doc) => {
        const visit = doc.data();

        // Parse user agent for browser stats
        const browser =
          visit.userAgent.match(/(chrome|safari|firefox|edge|opera)/i)?.[0] ||
          "other";
        browserStats[browser.toLowerCase()] =
          (browserStats[browser.toLowerCase()] || 0) + 1;

        // Parse platform for device stats
        deviceStats[visit.platform] = (deviceStats[visit.platform] || 0) + 1;

        // Add to recent visits
        recentVisits.push({
          timestamp: visit.timestamp,
          path: visit.pathname,
          referrer: visit.referrer,
        });
      });

      setVisitorStats({
        totalCount,
        browserStats,
        deviceStats,
        recentVisits: recentVisits
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10), // Keep only 10 most recent
      });
    } catch (error) {
      console.error("Error fetching visitor stats:", error);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="analytics-float-btn"
        onClick={() => setIsOpen(true)}
        title="View Analytics"
      >
        <FaChartBar size={24} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="analytics-modal-overlay">
          <div className="analytics-modal">
            <div className="analytics-modal-header">
              <h2>Visitor Analytics</h2>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <IoMdClose size={24} />
              </button>
            </div>

            <div className="analytics-modal-content">
              <div className="stats-section">
                <h3>Total Visitors: {visitorStats.totalCount}</h3>
              </div>

              <div className="stats-section">
                <h3>Browser Distribution</h3>
                <ul>
                  {Object.entries(visitorStats.browserStats).map(
                    ([browser, count]) => (
                      <li key={browser}>
                        {browser.charAt(0).toUpperCase() + browser.slice(1)}:{" "}
                        {count}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="stats-section">
                <h3>Device Distribution</h3>
                <ul>
                  {Object.entries(visitorStats.deviceStats).map(
                    ([device, count]) => (
                      <li key={device}>
                        {device}: {count}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="stats-section">
                <h3>Recent Visits</h3>
                <ul>
                  {visitorStats.recentVisits.map((visit, index) => (
                    <li key={index}>
                      {new Date(visit.timestamp).toLocaleString()} - Page:{" "}
                      {visit.path} - From: {visit.referrer}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisitorAnalytics;
