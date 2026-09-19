"use client";
import React, { useState } from "react";
import {
  FaChartBar,
  FaSync,
  FaGlobeAmericas,
  FaChartLine,
  FaUsers,
  FaVideo,
  FaLayerGroup,
} from "react-icons/fa";
import styles from "./analytics.module.css";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import CountriesTable from "@/components/analytics/CountriesTable";
import TrafficTrendsHub from "@/components/analytics/TrafficTrendsHub";
import AudienceTechMatrix from "@/components/analytics/AudienceTechMatrix";
import InteractionMetrics from "@/components/analytics/InteractionMetrics";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";
import BehaviorMetricsSection from "@/components/analytics/BehaviorMetricsSection";
import SessionReplayPlayer from "@/components/analytics/SessionReplayPlayer";
import UserJourneyFlow from "@/components/analytics/UserJourneyFlow";
import MultiModeHeatmap from "@/components/analytics/MultiModeHeatmap";
import LiveActivityFeed from "@/components/analytics/LiveActivityFeed";
import Footer from "@/components/Footer";

const AnalyticsPage = () => {
  const { stats, loading, error, fetchStats } = useAnalyticsData(14);
  const [activeView, setActiveView] = useState("all"); // 'all' | 'traffic' | 'behavior' | 'replay'

  // --- Loading State ---
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <FaChartBar className={styles.spinnerIcon} />
          <span>Loading analytics engine...</span>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <FaChartBar size={48} color="#ef4444" />
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchStats}>
            <FaSync /> Retry
          </button>
        </div>
      </div>
    );
  }

  // --- Empty Data State ---
  if (!stats) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <FaChartBar size={48} color="#20c997" />
          <h3>No Data Available</h3>
          <p>No analytics data has been collected yet.</p>
          <button className={styles.retryBtn} onClick={fetchStats}>
            <FaSync /> Refresh
          </button>
        </div>
      </div>
    );
  }

  // --- Prepare Analytics Data ---
  const countriesData = stats.countries || [];
  const dailyData = stats.daily || [];
  const mediumsData = stats.mediums || [];
  const devicesData = stats.devices || [];
  const componentsData = stats.components || [];

  // --- Calculate totals ---
  const totalSessions = stats.dailyTrends?.sessions?.current || 0;
  const totalUsers = stats.dailyTrends?.users?.current || 0;
  const totalPageviews = stats.dailyTrends?.pageViews?.current || 0;

  return (
    <div className={styles.analyticsPage}>
      {/* 🧭 1. Header with Home Link & Live Status */}
      <AnalyticsHeader onRefresh={fetchStats} />

      <main className={styles.dashboardContainer}>
        {/* 🎛️ Category Navigation Switcher */}
        <nav className={styles.viewSwitcher} aria-label="Analytics View Navigation">
          <button
            className={`${styles.viewSwitchBtn} ${activeView === "all" ? styles.viewSwitchBtnActive : ""}`}
            onClick={() => setActiveView("all")}
          >
            <FaLayerGroup size={12} />
            <span>Complete Telemetry</span>
          </button>

          <button
            className={`${styles.viewSwitchBtn} ${activeView === "traffic" ? styles.viewSwitchBtnActive : ""}`}
            onClick={() => setActiveView("traffic")}
          >
            <FaChartLine size={12} />
            <span>Traffic & Audience</span>
          </button>

          <button
            className={`${styles.viewSwitchBtn} ${activeView === "behavior" ? styles.viewSwitchBtnActive : ""}`}
            onClick={() => setActiveView("behavior")}
          >
            <FaUsers size={12} />
            <span>Behavioral Telemetry</span>
          </button>

          <button
            className={`${styles.viewSwitchBtn} ${activeView === "replay" ? styles.viewSwitchBtnActive : ""}`}
            onClick={() => setActiveView("replay")}
          >
            <FaVideo size={12} />
            <span>Session Replay & Heatmaps</span>
          </button>
        </nav>

        {/* 📈 HERO: Traffic Performance Hub (Full Width) */}
        {(activeView === "all" || activeView === "traffic") && (
          <section className={styles.fullWidthSection}>
            <TrafficTrendsHub
              dailyData={dailyData}
              dailyTrends={stats.dailyTrends}
              totalSessions={totalSessions}
              totalUsers={totalUsers}
              totalPageviews={totalPageviews}
            />
          </section>
        )}

        {/* 🌍 & 💻 Geographic Reach + Audience Matrix (Balanced 2-Column Grid) */}
        {(activeView === "all" || activeView === "traffic") && (
          <section className={styles.twoColumnGrid}>
            <AnalyticsCard
              title="GEOGRAPHIC REACH"
              icon={FaGlobeAmericas}
              subtitle="Top Active Visitor Nations"
            >
              <CountriesTable countriesData={countriesData} />
            </AnalyticsCard>

            <AudienceTechMatrix
              devicesData={devicesData}
              mediumsData={mediumsData}
              componentsData={componentsData}
            />
          </section>
        )}

        {/* ⚡ Behavioral Command Center + Real-Time Live Feed (2:1 Grid) */}
        {(activeView === "all" || activeView === "behavior") && (
          <section className={styles.commandCenterRow}>
            <InteractionMetrics
              mouseEvents={stats.mouseEvents}
              keyboardEvents={stats.keyboardEvents}
              formEngagement={stats.formEngagement}
              totalSessions={totalSessions}
            />
            <LiveActivityFeed />
          </section>
        )}

        {/* 🎯 Scroll Depth Distribution + Form Engagement Funnel (Balanced 2-Column Grid) */}
        {(activeView === "all" || activeView === "behavior") && (
          <section className={styles.fullWidthSection}>
            <BehaviorMetricsSection
              scrollMilestones={stats.scrollMilestones}
              formEngagement={stats.formEngagement}
            />
          </section>
        )}

        {/* 🗺️ Visitor Journey Pipeline (Full Width) */}
        {(activeView === "all" || activeView === "behavior") && (
          <section className={styles.fullWidthSection}>
            <UserJourneyFlow />
          </section>
        )}

        {/* 🎬 Interactive Session Replay Player Engine (Full Width) */}
        {(activeView === "all" || activeView === "replay") && (
          <section className={styles.fullWidthSection}>
            <SessionReplayPlayer sessionReplays={stats.sessionReplays} />
          </section>
        )}

        {/* 🔥 Multi-Mode Heatmap Engine (Full Width) */}
        {(activeView === "all" || activeView === "replay") && (
          <section className={styles.fullWidthSection}>
            <MultiModeHeatmap initialPoints={stats.heatmapPoints} />
          </section>
        )}
      </main>

      {/* ⚓ 3. Portfolio Footer Integration */}
      <Footer />
    </div>
  );
};

export default AnalyticsPage;
