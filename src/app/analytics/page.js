"use client";
import React from "react";
import { FaChartBar, FaSync, FaGlobeAmericas } from "react-icons/fa";
import styles from "./analytics.module.css";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useWorldMap } from "@/hooks/useWorldMap";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import CountrySessionsCard from "@/components/analytics/CountrySessionsCard";
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
  const { loaded: worldMapLoaded } = useWorldMap();

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

      {/* 📊 2. High-Impact Dashboard Grid */}
      <div className={styles.dashboardGrid}>
        {/* ⚡ Behavioral Command Center Overview */}
        <InteractionMetrics
          mouseEvents={stats.mouseEvents}
          keyboardEvents={stats.keyboardEvents}
          formEngagement={stats.formEngagement}
          totalSessions={totalSessions}
        />

        {/* 🟢 Real-Time Live Activity Feed */}
        <LiveActivityFeed />

        {/* 🎬 Interactive Session Replay Player Engine (0.5x - 128x) */}
        <SessionReplayPlayer sessionReplays={stats.sessionReplays} />

        {/* 🗺️ Visitor Journey Pipeline */}
        <UserJourneyFlow />

        {/* 🔥 Multi-Mode Heatmap Engine (Clicks / Hovers / Movements / Scroll) */}
        <MultiModeHeatmap initialPoints={stats.heatmapPoints} />

        {/* 🎯 Behavioral Funnel & Scroll Depth Distribution */}
        <BehaviorMetricsSection
          scrollMilestones={stats.scrollMilestones}
          formEngagement={stats.formEngagement}
          popularElements={stats.popularElements}
        />

        {/* 📈 Unified Traffic Performance Hub (Replaces 3 redundant charts) */}
        <TrafficTrendsHub
          dailyData={dailyData}
          dailyTrends={stats.dailyTrends}
          totalSessions={totalSessions}
          totalUsers={totalUsers}
          totalPageviews={totalPageviews}
        />

        {/* 🌍 Geographic Reach: 3D Map / Globe Visualization */}
        <CountrySessionsCard
          countriesData={countriesData}
          worldMapLoaded={worldMapLoaded}
        />

        {/* 🌏 Geographic Reach: Modern Leaderboard */}
        <AnalyticsCard
          title="GEOGRAPHIC REACH"
          icon={FaGlobeAmericas}
          subtitle="Top Active Visitor Nations"
        >
          <CountriesTable countriesData={countriesData} />
        </AnalyticsCard>

        {/* 💻 Audience & Technology Matrix (Devices, Acquisition Channels & Interactive Targets) */}
        <AudienceTechMatrix
          devicesData={devicesData}
          mediumsData={mediumsData}
          componentsData={componentsData}
        />
      </div>

      {/* ⚓ 3. Portfolio Footer Integration */}
      <Footer />
    </div>
  );
};

export default AnalyticsPage;
