"use client";
import ReactECharts from "echarts-for-react";
import { getLineChartOption } from "@/utils/analytics/chartOptions";

/**
 * Line Chart Component
 */
export default function LineChart({
  title,
  data,
  color,
  total,
  trend,
  style = {},
}) {
  return (
    <ReactECharts
      option={getLineChartOption(title, data, color, total, trend)}
      style={{ height: "100%", width: "100%", ...style }}
      opts={{ renderer: "svg" }}
    />
  );
}
