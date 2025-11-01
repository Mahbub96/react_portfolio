"use client";
import { useEffect, useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { getCountriesMapOption } from "@/utils/analytics/chartOptions";
import styles from "../../app/analytics/analytics.module.css";

/**
 * Countries Map Visualization Component
 * Production-ready version
 */
export default function CountriesMap({
  countriesData = [],
  worldMapLoaded = false,
  totalSessions = 0,
}) {
  const [mapReady, setMapReady] = useState(false);
  const [loadingState, setLoadingState] = useState("checking");

  // Check if map is actually registered
  useEffect(() => {
    let intervalId = null;
    let checkCount = 0;
    const maxChecks = 20;

    const checkMap = () => {
      try {
        const registeredMap = echarts.getMap("world");
        if (
          registeredMap &&
          registeredMap.features &&
          registeredMap.features.length > 0
        ) {
          setMapReady(true);
          setLoadingState("loaded");
          return true;
        }
      } catch (e) {
        // Map not registered yet
      }
      return false;
    };

    // Initial check
    if (worldMapLoaded) {
      if (checkMap()) {
        return;
      }
      setLoadingState("loading");
    } else {
      setLoadingState("waiting");
    }

    // Poll for map availability
    intervalId = setInterval(() => {
      checkCount++;
      if (checkMap()) {
        clearInterval(intervalId);
      } else if (checkCount >= maxChecks) {
        clearInterval(intervalId);
        setLoadingState("timeout");
      }
    }, 500);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [worldMapLoaded]);

  // Check when countriesData changes
  useEffect(() => {
    if (countriesData.length > 0 && !mapReady) {
      const checkMap = () => {
        try {
          const registeredMap = echarts.getMap("world");
          if (
            registeredMap &&
            registeredMap.features &&
            registeredMap.features.length > 0
          ) {
            setMapReady(true);
            setLoadingState("loaded");
            return true;
          }
        } catch (e) {
          // Map not registered yet
        }
        return false;
      };
      checkMap();
    }
  }, [countriesData, mapReady]);

  // Handle timeout state - use useEffect to set mapReady
  // MUST be called before any early returns (Rules of Hooks)
  useEffect(() => {
    if (loadingState === "timeout") {
      setMapReady(false); // Force bar chart
    }
  }, [loadingState]);

  // Memoize the option to prevent unnecessary re-renders
  const mapOption = useMemo(() => {
    return getCountriesMapOption(countriesData, mapReady);
  }, [countriesData, mapReady]);

  // Show loading state if map is not ready
  if (loadingState === "loading" || loadingState === "waiting") {
    return (
      <div className={styles.countriesMapContainer}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#666",
            fontSize: "0.9rem",
            gap: "0.5rem",
          }}
        >
          <div>Loading world map...</div>
          <div style={{ fontSize: "0.75rem", color: "#999" }}>
            {loadingState === "waiting"
              ? "Waiting for map data..."
              : "Fetching map data..."}
          </div>
        </div>
      </div>
    );
  }

  // Show timeout message
  if (loadingState === "timeout") {
    return (
      <div className={styles.countriesMapContainer}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#999",
            fontSize: "0.85rem",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          <div>⚠️ Map data unavailable</div>
          <div style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
            Using bar chart instead
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.countriesMapContainer}>
      <ReactECharts
        option={mapOption}
        style={{ height: "100%", width: "100%", maxWidth: "100%" }}
        opts={{ renderer: "canvas", locale: "en" }}
        notMerge={true}
        lazyUpdate={false}
      />
    </div>
  );
}
