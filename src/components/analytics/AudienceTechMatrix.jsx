"use client";
import React, { useState, useMemo } from "react";
import {
  FaLaptop,
  FaMobileAlt,
  FaTabletAlt,
  FaCompass,
  FaMousePointer,
  FaShareAlt,
  FaDesktop,
  FaLink,
} from "react-icons/fa";
import AnalyticsCard from "./AnalyticsCard";
import styles from "./audienceTechMatrix.module.css";
import { formatNumber } from "@/utils/analytics/formatters";

function formatElementName(raw) {
  if (!raw) return "UI Element";
  const s = String(raw).trim();
  if (s === "a[href=/]" || s === "a[href='/']") return "Home Link (/)";
  if (s.includes("projects > header") || s.includes("projects")) return "Projects Header";
  if (s.includes("Admin Login") || s.includes("admin")) return "Admin Access";
  if (s.includes("loginModal") || s.includes("loginForm")) return "Admin Login Form";
  if (s === "username") return "Username Field";
  if (s === "password") return "Password Field";
  if (s.includes("contactForm") || s.includes("submit")) return "Contact Submit";
  if (s.includes("themeToggle")) return "Theme Switcher";
  const cleaned = s.replace(/__[a-zA-Z0-9_-]{4,10}/g, "").replace(/^[a-z]+[\.#]/i, "");
  return cleaned.length > 24 ? cleaned.substring(0, 22) + "..." : cleaned;
}

/**
 * AudienceTechMatrix Component
 * Modern consolidated module for Device Breakdown, Acquisition Channels, and Interaction Targets
 */
export default function AudienceTechMatrix({
  devicesData = [],
  mediumsData = [],
  componentsData = [],
}) {
  const [activeTab, setActiveTab] = useState("devices"); // 'devices' | 'channels' | 'targets'

  // --- 1. Compute Device Breakdown ---
  const totalDeviceViews = useMemo(() => {
    return devicesData.reduce((sum, d) => sum + (d.pageViews || d.count || 0), 0);
  }, [devicesData]);

  const deviceStats = useMemo(() => {
    const map = { desktop: 0, mobile: 0, tablet: 0 };
    devicesData.forEach((d) => {
      const dev = (d.device || d.deviceType || "").toLowerCase();
      const val = d.pageViews || d.count || 0;
      if (dev.includes("mobile") || dev.includes("phone")) map.mobile += val;
      else if (dev.includes("tablet") || dev.includes("ipad")) map.tablet += val;
      else map.desktop += val;
    });

    const tot = Math.max(1, map.desktop + map.mobile + map.tablet);
    return [
      {
        name: "Desktop & PC",
        icon: FaLaptop,
        count: map.desktop,
        pct: Math.round((map.desktop / tot) * 100),
      },
      {
        name: "Mobile Phones",
        icon: FaMobileAlt,
        count: map.mobile,
        pct: Math.round((map.mobile / tot) * 100),
      },
      {
        name: "Tablets",
        icon: FaTabletAlt,
        count: map.tablet,
        pct: Math.round((map.tablet / tot) * 100),
      },
    ];
  }, [devicesData]);

  // --- 2. Compute Traffic Acquisition Channels ---
  const totalMediumViews = useMemo(() => {
    return mediumsData.reduce((sum, m) => sum + (m.pageViews || 0), 0);
  }, [mediumsData]);

  const sortedMediums = useMemo(() => {
    const tot = Math.max(1, totalMediumViews);
    return [...mediumsData]
      .sort((a, b) => (b.pageViews || 0) - (a.pageViews || 0))
      .slice(0, 6)
      .map((m) => ({
        name: m.medium || "Direct / Unknown",
        count: m.pageViews || 0,
        pct: Math.round(((m.pageViews || 0) / tot) * 100),
      }));
  }, [mediumsData, totalMediumViews]);

  // --- 3. Compute Top Interactive Components ---
  const sortedComponents = useMemo(() => {
    const tot = componentsData.reduce((sum, c) => sum + (c.clicks || c.count || 0), 0) || 1;
    return [...componentsData]
      .sort((a, b) => (b.clicks || b.count || 0) - (a.clicks || a.count || 0))
      .slice(0, 6)
      .map((c) => ({
        name: formatElementName(c.component || c.elementId || "UI Action"),
        count: c.clicks || c.count || 0,
        pct: Math.round(((c.clicks || c.count || 0) / tot) * 100),
      }));
  }, [componentsData]);

  return (
    <AnalyticsCard
      title="AUDIENCE & TECHNOLOGY MATRIX"
      icon={FaCompass}
      subtitle="Ecosystem, Acquisition Channels & Interactive Targets"
    >
      <div className={styles.matrixContainer}>
        {/* Navigation Tabs */}
        <div className={styles.tabBar}>
          <button
            className={`${styles.tabBtn} ${activeTab === "devices" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("devices")}
          >
            <FaDesktop size={12} />
            <span>Device Ecosystem</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === "channels" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("channels")}
          >
            <FaShareAlt size={12} />
            <span>Acquisition Channels</span>
          </button>

          <button
            className={`${styles.tabBtn} ${activeTab === "targets" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("targets")}
          >
            <FaMousePointer size={12} />
            <span>Top Interactive Elements</span>
          </button>
        </div>

        {/* Tab 1: Devices Grid */}
        {activeTab === "devices" && (
          <div className={styles.deviceGrid}>
            {deviceStats.map((d, idx) => {
              const Icon = d.icon;
              return (
                <div key={idx} className={styles.deviceCard}>
                  <div className={styles.deviceIconWrapper}>
                    <Icon />
                  </div>
                  <span className={styles.deviceName}>{d.name}</span>
                  <span className={styles.devicePct}>{d.pct}%</span>
                  <span className={styles.deviceCount}>{formatNumber(d.count)} views</span>
                  <div className={styles.deviceBarBg}>
                    <div className={styles.deviceBarFill} style={{ width: `${Math.max(6, d.pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Acquisition Channels List */}
        {activeTab === "channels" && (
          <div className={styles.listContainer}>
            {sortedMediums.length === 0 ? (
              <div className={styles.emptyState}>No acquisition channels recorded yet</div>
            ) : (
              sortedMediums.map((m, idx) => (
                <div key={idx} className={styles.listItem}>
                  <div className={styles.itemLabel}>
                    <FaLink size={11} color="#20c997" />
                    <span>{m.name}</span>
                  </div>
                  <div className={styles.itemBarWrapper}>
                    <div className={styles.itemBarBg}>
                      <div className={styles.itemBarFill} style={{ width: `${Math.max(6, m.pct)}%` }} />
                    </div>
                  </div>
                  <div className={styles.itemMetrics}>
                    <span className={styles.itemValue}>{formatNumber(m.count)}</span>
                    <span className={styles.itemPct}>{m.pct}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Interactive Targets */}
        {activeTab === "targets" && (
          <div className={styles.listContainer}>
            {sortedComponents.length === 0 ? (
              <div className={styles.emptyState}>No interactive elements logged yet</div>
            ) : (
              sortedComponents.map((c, idx) => (
                <div key={idx} className={styles.listItem}>
                  <div className={styles.itemLabel}>
                    <FaMousePointer size={11} color="#38bdf8" />
                    <span>{c.name}</span>
                  </div>
                  <div className={styles.itemBarWrapper}>
                    <div className={styles.itemBarBg}>
                      <div
                        className={styles.itemBarFill}
                        style={{
                          width: `${Math.max(6, c.pct)}%`,
                          background: "linear-gradient(90deg, #10b981 0%, #20c997 100%)",
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.itemMetrics}>
                    <span className={styles.itemValue}>{formatNumber(c.count)}</span>
                    <span className={styles.itemPct}>{c.pct}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AnalyticsCard>
  );
}
