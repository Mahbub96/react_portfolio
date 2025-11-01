"use client";
import { FaChartBar, FaCalendarAlt } from "react-icons/fa";
import LineChart from "./LineChart";
import AnalyticsCard from "./AnalyticsCard";
import styles from "../../app/analytics/analytics.module.css";

/**
 * Time Series Line Chart Card Component
 */
export default function TimeSeriesChart({
  title,
  data,
  color,
  total,
  trend,
  subtitle = "Last 14 days, daily",
}) {
  return (
    <AnalyticsCard
      title={title.toUpperCase()}
      icon={FaChartBar}
      subtitle={subtitle}
    >
      <div className={styles.chartContainer}>
        <LineChart
          title={title}
          data={data}
          color={color}
          total={total}
          trend={trend}
          style={{ height: "250px", width: "100%" }}
        />
      </div>
    </AnalyticsCard>
  );
}
