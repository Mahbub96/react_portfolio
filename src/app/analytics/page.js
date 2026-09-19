"use client";
import React from "react";
import { FaChartBar, FaSync } from "react-icons/fa";
import styles from "./analytics.module.css";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useWorldMap } from "@/hooks/useWorldMap";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import CountrySessionsCard from "@/components/analytics/CountrySessionsCard";
import CountriesTable from "@/components/analytics/CountriesTable";
import TimeSeriesChart from "@/components/analytics/TimeSeriesChart";
import MediumsSection from "@/components/analytics/MediumsSection";
import DevicesSection from "@/components/analytics/DevicesSection";
import ComponentsSection from "@/components/analytics/ComponentsSection";
import InteractionMetrics from "@/components/analytics/InteractionMetrics";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";
import BehaviorMetricsSection from "@/components/analytics/BehaviorMetricsSection";
import SessionReplayPlayer from "@/components/analytics/SessionReplayPlayer";
import UserJourneyFlow from "@/components/analytics/UserJourneyFlow";
import MultiModeHeatmap from "@/components/analytics/MultiModeHeatmap";
import LiveActivityFeed from "@/components/analytics/LiveActivityFeed";

const AnalyticsPage = () => {
  const { stats, loading, error, fetchStats } = useAnalyticsData(14);
  const { loaded: worldMapLoaded } = useWorldMap();

  // --- Loading State ---
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

  // --- Error State ---
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <FaChartBar size={48} />
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
          <FaChartBar size={48} />
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

  // --- Format daily data for charts ---
  const sessionsData = dailyData.map((d) => [d.date, d.sessions || 0]);
  const usersData = dailyData.map((d) => [d.date, d.users || 0]);
  const pageviewsData = dailyData.map((d) => [d.date, d.pageViews || 0]);

  // --- Calculate totals ---
  const totalSessions = stats.dailyTrends?.sessions?.current || 0;
  const totalUsers = stats.dailyTrends?.users?.current || 0;
  const totalPageviews = stats.dailyTrends?.pageViews?.current || 0;

  return (
    <div className={styles.analyticsPage}>
      {/* Header */}
      <AnalyticsHeader onRefresh={fetchStats} />

      {/* Dashboard Layout */}
      <div className={styles.dashboardGrid}>
        {/* ⚡ 1. Behavioral Command Center Overview */}
        <InteractionMetrics
          mouseEvents={stats.mouseEvents}
          keyboardEvents={stats.keyboardEvents}
          formEngagement={stats.formEngagement}
          totalSessions={totalSessions}
        />

        {/* 🟢 2. Live Visitor Activity Feed */}
        <LiveActivityFeed />

        {/* 🎬 3. Interactive Session Replay Player Engine */}
        <SessionReplayPlayer sessionReplays={stats.sessionReplays} />

        {/* 🗺️ 4. Visitor Journey Pipeline */}
        <UserJourneyFlow />

        {/* 🔥 5. Multi-Mode Heatmap Engine (Clicks / Hovers / Movements / Scroll) */}
        <MultiModeHeatmap initialPoints={stats.heatmapPoints} />

        {/* 🎯 6. Behavioral Funnel & Scroll Distribution */}
        <BehaviorMetricsSection
          scrollMilestones={stats.scrollMilestones}
          formEngagement={stats.formEngagement}
          popularElements={stats.popularElements}
        />

        {/* 🌍 7. Countries by Sessions Card (Map Visualization) */}
        <CountrySessionsCard
          countriesData={countriesData}
          worldMapLoaded={worldMapLoaded}
        />

        {/* 🌏 8. Countries Table */}
        <AnalyticsCard
          title="BY COUNTRIES"
          icon={FaChartBar}
          subtitle="Last 14 days"
        >
          <CountriesTable countriesData={countriesData} />
        </AnalyticsCard>

        {/* 📈 9. Sessions Chart */}
        <TimeSeriesChart
          title="SESSIONS"
          data={sessionsData}
          color="#3b82f6"
          total={totalSessions}
          trend={stats.dailyTrends?.sessions?.trend || 0}
        />

        {/* 👥 10. Users Chart */}
        <TimeSeriesChart
          title="USERS"
          data={usersData}
          color="#10b981"
          total={totalUsers}
          trend={stats.dailyTrends?.users?.trend || 0}
        />

        {/* 👀 11. Pageviews Chart */}
        <TimeSeriesChart
          title="PAGEVIEWS"
          data={pageviewsData}
          color="#f59e0b"
          total={totalPageviews}
          trend={stats.dailyTrends?.pageViews?.trend || 0}
        />

        {/* 📊 12. Mediums Section */}
        <MediumsSection mediumsData={mediumsData} />

        {/* ⚙️ 13. Components Section */}
        <ComponentsSection componentsData={componentsData} />

        {/* 💻 14. Devices Section */}
        <DevicesSection devicesData={devicesData} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
