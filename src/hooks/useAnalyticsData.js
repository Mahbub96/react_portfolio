"use client";
import { useState, useEffect, useCallback } from "react";
import { useDataContext } from "@/contexts/useAllContext";
import { useRouter } from "next/navigation";

/**
 * Hook to fetch and manage analytics data
 * @param {number} days - Number of days to fetch data for
 * @returns {object} - { stats, loading, error, fetchStats }
 */
export function useAnalyticsData(days = 14) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth, isLoaded, makeAuthenticatedRequest, refreshAuth } =
    useDataContext();
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    if (!auth || !isLoaded) return;

    try {
      setLoading(true);
      setError(null);
      const response = await makeAuthenticatedRequest(
        `/api/analytics?days=${days}`
      );

      if (response.error) {
        if (response.status === 401) {
          const refreshed = refreshAuth();
          if (refreshed) {
            setTimeout(() => fetchStats(), 100);
            return;
          }
          setError("Authentication failed. Please login again.");
          router.push("/");
          return;
        }
        setError(response.error || "An unexpected error occurred.");
        return;
      }

      const data = await response.response.json();
      setStats(data);
    } catch (err) {
      // Silent fail in production - user sees error message
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [auth, isLoaded, makeAuthenticatedRequest, refreshAuth, router, days]);

  useEffect(() => {
    if (isLoaded && !auth) {
      router.push("/");
      return;
    }
    if (auth && isLoaded) {
      fetchStats();
    }
  }, [auth, isLoaded, router, fetchStats]);

  return { stats, loading, error, fetchStats };
}
