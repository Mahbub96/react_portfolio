/**
 * Analytics Formatting Utilities
 * Reusable formatting functions for analytics data
 */

export const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString();
};

export const formatPercent = (num) => {
  if (!num && num !== 0) return "0%";
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
};

export const formatDuration = (milliseconds) => {
  if (!milliseconds) return "0s";
  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export const getTrendIcon = (trend) => {
  if (trend > 0) return "▲";
  if (trend < 0) return "▼";
  return "→";
};

export const getTrendClass = (trend) => {
  if (trend > 0) return "trendUp";
  if (trend < 0) return "trendDown";
  return "trendNeutral";
};
