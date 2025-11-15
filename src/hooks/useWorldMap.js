"use client";
import { useState, useEffect } from "react";
import * as echarts from "echarts";
import * as topojson from "topojson-client";

/**
 * Hook: useWorldMap
 * Loads world map data from local public/maps folder or remote source.
 *
 * @param {string[]} sources - array of URLs or relative paths to GeoJSON/TopoJSON files
 * @returns {{ loaded: boolean, error: string | null }}
 */
export function useWorldMap(sources = ["/maps/world.geojson"]) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadMap = async () => {
      try {
        // Already registered?
        const existingMap = echarts.getMap("world");

        console.log("Existing map check:", existingMap);
        if (existingMap?.features?.length) {
          if (isMounted) setLoaded(true);
          return;
        }

        let lastError = null;

        for (const source of sources) {
          try {
            console.log("Fetching map from:", source);
            const response = await fetch(source, {
              headers: { Accept: "application/json" },
            });

            if (!response.ok) {
              lastError = `Failed to fetch ${source}: ${response.status}`;
              console.warn(lastError);
              continue;
            }

            const mapJson = await response.json();
            let mapData;

            if (mapJson.type === "Topology" && mapJson.objects) {
              const key = Object.keys(mapJson.objects)[0];
              mapData = topojson.feature(mapJson, mapJson.objects[key]);
            } else if (mapJson.type === "FeatureCollection") {
              mapData = mapJson;
            } else {
              lastError = `Unsupported map format from ${source}: ${mapJson.type}`;
              console.warn(lastError);
              continue;
            }

            if (!Array.isArray(mapData.features) || !mapData.features.length) {
              lastError = `No features found in map from ${source}`;
              console.warn(lastError);
              continue;
            }

            echarts.registerMap("world", mapData);

            if (isMounted) {
              console.log("World map loaded successfully!");
              setLoaded(true);
              return;
            }
          } catch (err) {
            lastError = `Error loading map from ${source}: ${err.message}`;
            console.warn(lastError);
          }
        }

        if (isMounted)
          setError(lastError || "Failed to load world map from all sources");
      } catch (err) {
        if (isMounted) setError(err.message);
        console.error("Unexpected error loading world map:", err);
      }
    };

    loadMap();

    return () => {
      isMounted = false;
    };
  }, [sources]);

  return { loaded, error };
}
