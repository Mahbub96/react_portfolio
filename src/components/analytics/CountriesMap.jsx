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

        if (registeredMap) {
          setMapReady(true);
          setLoadingState("loaded");
          return true;
        }
      } catch (e) {
        // Map not registered yet
      }
      return false;
    };

    // Always check initially
    if (checkMap()) {
      return;
    }

    // Set initial loading state
    if (worldMapLoaded) {
      setLoadingState("loading");
    } else {
      setLoadingState("waiting");
    }

    // Poll for map availability - check continuously even if worldMapLoaded is false initially
    intervalId = setInterval(() => {
      checkCount++;
      if (checkMap()) {
        clearInterval(intervalId);
      } else if (checkCount >= maxChecks * 2) {
        // Double the checks (20 seconds total)
        clearInterval(intervalId);
        setLoadingState("timeout");
      }
    }, 500);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [worldMapLoaded]); // Re-check when worldMapLoaded changes from false to true

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

  // On timeout, render bar chart instead of error message
  // mapReady is already set to false in useEffect, so chart will render bar chart

  return (
    <div className={styles.countriesMapContainer}>
      <ReactECharts
        option={mapOption}
        className={styles.mapContainer} // ← use CSS module
        opts={{ renderer: "canvas" }}
        notMerge={true}
        lazyUpdate={false}
      />
    </div>
  );
}
