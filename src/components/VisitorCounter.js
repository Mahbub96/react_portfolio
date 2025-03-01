import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../DB/DB_init";
import { FaEye, FaUserClock } from "react-icons/fa";
import styles from "./visitorCounter.module.css";
import { useDataContex } from "../contexts/useAllContext";

const VisitorCounter = () => {
  const { auth } = useDataContex();
  const [visitorStats, setVisitorStats] = useState({
    total: 0,
    today: 0,
  });

  useEffect(() => {
    const fetchVisitorStats = async () => {
      try {
        // Get total visitors
        const visitorRef = doc(db, "analytics", "visitors");
        const visitorDoc = await getDoc(visitorRef);
        const total = visitorDoc.data()?.count || 0;

        // Get today's unique visitors
        const today = new Date().toISOString().split("T")[0];
        const uniqueVisitorRef = doc(
          db,
          "analytics",
          "unique_visitors",
          "daily",
          today
        );
        const uniqueVisitorDoc = await getDoc(uniqueVisitorRef);
        const todayUnique = uniqueVisitorDoc.data()?.count || 0;

        setVisitorStats({
          total,
          today: todayUnique,
        });
      } catch (error) {
        console.error("Error fetching visitor count:", error);
      }
    };

    if (auth) {
      fetchVisitorStats();
      const interval = setInterval(fetchVisitorStats, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [auth]);

  if (!auth) return null;

  return (
    <div className={styles.visitorCounterFloat}>
      <div className={styles.visitorStat}>
        <div className={styles.statIcon}>
          <FaEye />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statLabel}>Total Views</span>
          <span className={styles.statValue}>{visitorStats.total}</span>
        </div>
      </div>
      <div className={styles.divider} />
      <div className={styles.visitorStat}>
        <div className={styles.statIcon}>
          <FaUserClock />
        </div>
        <div className={styles.statContent}>
          <span className={styles.statLabel}>Today</span>
          <span className={styles.statValue}>{visitorStats.today}</span>
        </div>
      </div>
    </div>
  );
};

export default VisitorCounter;
