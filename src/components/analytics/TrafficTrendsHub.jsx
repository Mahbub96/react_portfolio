"use client";
import React, { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { FaChartLine, FaArrowUp, FaArrowDown, FaUsers, FaEye, FaLayerGroup } from "react-icons/fa";
import AnalyticsCard from "./AnalyticsCard";
import styles from "./trafficTrendsHub.module.css";

/**
 * TrafficTrendsHub Component
 * Unified, professional, multi-metric performance dashboard replacing separate disjointed charts
 */
export default function TrafficTrendsHub({
  dailyData = [],
  dailyTrends = {},
  totalSessions = 0,
  totalUsers = 0,
  totalPageviews = 0,
}) {
  const [activeMetric, setActiveMetric] = useState("all"); // 'all' | 'sessions' | 'users' | 'pageviews'

  // Extract dates and metric vectors
  const dates = useMemo(() => dailyData.map((d) => d.date), [dailyData]);
  const sessionsArr = useMemo(() => dailyData.map((d) => d.sessions || 0), [dailyData]);
  const usersArr = useMemo(() => dailyData.map((d) => d.users || 0), [dailyData]);
  const pageviewsArr = useMemo(() => dailyData.map((d) => d.pageViews || 0), [dailyData]);

  // Daily averages
  const avgDailySessions = dates.length > 0 ? (totalSessions / dates.length).toFixed(1) : 0;
  const avgPagesPerSession = totalSessions > 0 ? (totalPageviews / totalSessions).toFixed(1) : 0;

  // ECharts Multi-Series Option Configuration
  const chartOption = useMemo(() => {
    const series = [];

    if (activeMetric === "all" || activeMetric === "sessions") {
      series.push({
        name: "Sessions",
        type: "line",
        smooth: true,
        showSymbol: false,
        symbolSize: 6,
        data: sessionsArr,
        itemStyle: { color: "#20c997" },
        lineStyle: { width: 3, color: "#20c997" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(32, 201, 151, 0.35)" },
              { offset: 1, color: "rgba(32, 201, 151, 0.0)" },
            ],
          },
        },
      });
    }

    if (activeMetric === "all" || activeMetric === "users") {
      series.push({
        name: "Active Users",
        type: "line",
        smooth: true,
        showSymbol: false,
        symbolSize: 6,
        data: usersArr,
        itemStyle: { color: "#38bdf8" },
        lineStyle: { width: 2.5, color: "#38bdf8" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(56, 189, 248, 0.3)" },
              { offset: 1, color: "rgba(56, 189, 248, 0.0)" },
            ],
          },
        },
      });
    }

    if (activeMetric === "all" || activeMetric === "pageviews") {
      series.push({
        name: "Page Views",
        type: "line",
        smooth: true,
        showSymbol: false,
        symbolSize: 6,
        data: pageviewsArr,
        itemStyle: { color: "#f59e0b" },
        lineStyle: { width: 2, color: "#f59e0b", type: activeMetric === "all" ? "dashed" : "solid" },
        areaStyle:
          activeMetric === "pageviews"
            ? {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(245, 158, 11, 0.25)" },
                    { offset: 1, color: "rgba(245, 158, 11, 0.0)" },
                  ],
                },
              }
            : undefined,
      });
    }

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(11, 18, 32, 0.92)",
        borderColor: "rgba(32, 201, 151, 0.3)",
        borderWidth: 1,
        textStyle: { color: "#f8fafc", fontSize: 12 },
        padding: [10, 14],
        extraCssText: "box-shadow: 0 10px 30px rgba(0,0,0,0.5); border-radius: 8px;",
      },
      grid: {
        top: 25,
        left: "3%",
        right: "3%",
        bottom: "8%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.12)" } },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
        splitLine: { lineStyle: { color: "rgba(255, 255, 255, 0.06)", type: "dashed" } },
      },
      series,
    };
  }, [dates, sessionsArr, usersArr, pageviewsArr, activeMetric]);

  const renderTrend = (trendVal) => {
    const isPos = (trendVal || 0) >= 0;
    return (
      <span className={`${styles.trendBadge} ${isPos ? styles.trendPositive : styles.trendNegative}`}>
        {isPos ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
        {Math.abs(trendVal || 0)}%
      </span>
    );
  };

  return (
    <AnalyticsCard
      title="TRAFFIC & AUDIENCE PERFORMANCE HUB"
      icon={FaChartLine}
      subtitle="Interactive 14-Day Trajectory"
    >
      <div className={styles.hubContainer}>
        {/* Top KPI Cards Grid */}
        <div className={styles.kpiGrid}>
          <div
            className={`${styles.kpiCard} ${activeMetric === "sessions" ? styles.activeKpi : ""}`}
            onClick={() => setActiveMetric("sessions")}
            title="Click to isolate Sessions"
          >
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Total Sessions</span>
              {renderTrend(dailyTrends.sessions?.trend)}
            </div>
            <div className={styles.kpiValue}>{totalSessions.toLocaleString()}</div>
            <div className={styles.kpiSubtext}>~{avgDailySessions} sessions / day</div>
          </div>

          <div
            className={`${styles.kpiCard} ${activeMetric === "users" ? styles.activeKpi : ""}`}
            onClick={() => setActiveMetric("users")}
            title="Click to isolate Active Users"
          >
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Unique Visitors</span>
              {renderTrend(dailyTrends.users?.trend)}
            </div>
            <div className={styles.kpiValue} style={{ color: "#38bdf8" }}>
              {totalUsers.toLocaleString()}
            </div>
            <div className={styles.kpiSubtext}>Audience reach</div>
          </div>

          <div
            className={`${styles.kpiCard} ${activeMetric === "pageviews" ? styles.activeKpi : ""}`}
            onClick={() => setActiveMetric("pageviews")}
            title="Click to isolate Page Views"
          >
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Total Pageviews</span>
              {renderTrend(dailyTrends.pageViews?.trend)}
            </div>
            <div className={styles.kpiValue} style={{ color: "#f59e0b" }}>
              {totalPageviews.toLocaleString()}
            </div>
            <div className={styles.kpiSubtext}>~{avgPagesPerSession} views / session</div>
          </div>

          <div
            className={`${styles.kpiCard} ${activeMetric === "all" ? styles.activeKpi : ""}`}
            onClick={() => setActiveMetric("all")}
            title="Click to view all series overlaid"
          >
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>View Mode</span>
              <span className={styles.trendBadge} style={{ background: "rgba(32,201,151,0.15)", color: "#20c997" }}>
                {activeMetric === "all" ? "Multi" : "Single"}
              </span>
            </div>
            <div className={styles.kpiValue} style={{ fontSize: "1.25rem", color: activeMetric === "all" ? "#20c997" : "#38bdf8" }}>
              {activeMetric === "all" ? "Combined" : activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}
            </div>
            <div className={styles.kpiSubtext}>
              {activeMetric === "all" ? "All series overlaid" : "Click to view all"}
            </div>
          </div>
        </div>

        {/* ECharts Visualization Canvas */}
        <div className={styles.chartWrapper}>
          <div className={styles.chartToolbar}>
            <div className={styles.viewTitle}>
              <FaLayerGroup size={13} color="#20c997" />
              <span>
                {activeMetric === "all"
                  ? "Daily Volume Trajectory (Sessions vs Visitors vs Page Views)"
                  : `${activeMetric.toUpperCase()} Daily Trend`}
              </span>
            </div>
            <div className={styles.legendPills}>
              {(activeMetric === "all" || activeMetric === "sessions") && (
                <div className={styles.legendPill}>
                  <span className={styles.legendDot} style={{ background: "#20c997" }} />
                  <span>Sessions</span>
                </div>
              )}
              {(activeMetric === "all" || activeMetric === "users") && (
                <div className={styles.legendPill}>
                  <span className={styles.legendDot} style={{ background: "#38bdf8" }} />
                  <span>Users</span>
                </div>
              )}
              {(activeMetric === "all" || activeMetric === "pageviews") && (
                <div className={styles.legendPill}>
                  <span className={styles.legendDot} style={{ background: "#f59e0b" }} />
                  <span>Pageviews</span>
                </div>
              )}
            </div>
          </div>

          <ReactECharts
            option={chartOption}
            style={{ height: "240px", width: "100%" }}
            opts={{ renderer: "svg" }}
          />
        </div>
      </div>
    </AnalyticsCard>
  );
}
