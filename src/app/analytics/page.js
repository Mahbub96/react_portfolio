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

const AnalyticsPage = () => {
  const { stats, loading, error, fetchStats } = useAnalyticsData(14);
  const worldMapLoaded = useWorldMap();

  // Don't render until data is loaded
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

  // Prepare data for components
  const countriesData = stats.countries || [];
  const dailyData = stats.daily || [];
  const mediumsData = stats.mediums || [];
  const devicesData = stats.devices || [];
  const componentsData = stats.components || [];

  // Format daily data for line charts
  const sessionsData = dailyData.map((d) => [d.date, d.sessions || 0]);
  const usersData = dailyData.map((d) => [d.date, d.users || 0]);
  const pageviewsData = dailyData.map((d) => [d.date, d.pageViews || 0]);

  // Calculate totals
  const totalSessions = stats.dailyTrends?.sessions?.current || 0;
  const totalUsers = stats.dailyTrends?.users?.current || 0;
  const totalPageviews = stats.dailyTrends?.pageViews?.current || 0;

  return (
    <div className={styles.analyticsPage}>
      <AnalyticsHeader onRefresh={fetchStats} />

      <div className={styles.dashboardGrid}>
        {/* Countries by Sessions Card with Map */}
        <CountrySessionsCard
          countriesData={countriesData}
          worldMapLoaded={worldMapLoaded}
        />

        {/* Countries Table Card */}
        <AnalyticsCard
          title="BY COUNTRIES"
          icon={FaChartBar}
          subtitle="Last 14 days"
        >
          <CountriesTable countriesData={countriesData} />
        </AnalyticsCard>

        {/* Sessions Chart */}
        <TimeSeriesChart
          title="SESSIONS"
          data={sessionsData}
          color="#3b82f6"
          total={totalSessions}
          trend={stats.dailyTrends?.sessions?.trend || 0}
        />

        {/* Users Chart */}
        <TimeSeriesChart
          title="USERS"
          data={usersData}
          color="#10b981"
          total={totalUsers}
          trend={stats.dailyTrends?.users?.trend || 0}
        />

        {/* Pageviews Chart */}
        <TimeSeriesChart
          title="PAGEVIEWS"
          data={pageviewsData}
          color="#f59e0b"
          total={totalPageviews}
          trend={stats.dailyTrends?.pageViews?.trend || 0}
        />

        {/* Mediums Section (Donut + Table) */}
        <MediumsSection mediumsData={mediumsData} />

        {/* Components Section */}
        <ComponentsSection componentsData={componentsData} />

        {/* Interaction Metrics */}
        <InteractionMetrics
          mouseEvents={stats.mouseEvents}
          keyboardEvents={stats.keyboardEvents}
        />

        {/* Devices Section */}
        <DevicesSection devicesData={devicesData} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
