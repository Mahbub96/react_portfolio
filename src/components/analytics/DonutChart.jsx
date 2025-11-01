"use client";
import ReactECharts from "echarts-for-react";
import { getDonutChartOption } from "@/utils/analytics/chartOptions";

/**
 * Donut Chart Component
 */
export default function DonutChart({ data, total, colors, style = {} }) {
  return (
    <ReactECharts
      option={getDonutChartOption(data, total, colors)}
      style={{ height: "100%", width: "100%", ...style }}
      opts={{ renderer: "svg" }}
    />
  );
}
