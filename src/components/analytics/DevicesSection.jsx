"use client";
import { FaChartBar, FaCalendarAlt } from "react-icons/fa";
import DonutChart from "./DonutChart";
import { formatNumber } from "@/utils/analytics/formatters";
import { formatDeviceName } from "@/utils/analytics/dataFormatters";
import styles from "../../app/analytics/analytics.module.css";

/**
 * Devices Section Component (Donut Chart)
 */
export default function DevicesSection({ devicesData = [] }) {
  if (!devicesData || devicesData.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FaChartBar size={16} />
            <span>BY DEVICES</span>
          </div>
          <div className={styles.cardSubtitle}>
            <FaCalendarAlt size={14} />
            <span>Last 14 days</span>
          </div>
        </div>
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          No device data available
        </div>
      </div>
    );
  }

  const totalDevices = devicesData.reduce(
    (sum, d) => sum + (d.pageViews || d.count || 0),
    0
  );

  const donutColors = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6"];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <FaChartBar size={16} />
          <span>BY DEVICES</span>
        </div>
        <div className={styles.cardSubtitle}>
          <FaCalendarAlt size={14} />
          <span>Last 14 days</span>
        </div>
      </div>
      <div className={styles.donutContainer}>
        <DonutChart
          data={devicesData}
          total={totalDevices}
          colors={donutColors}
          style={{ height: "250px", width: "100%" }}
        />
        <div className={styles.donutLegend}>
          {devicesData.map((device, idx) => {
            const percentage =
              totalDevices > 0
                ? (
                    ((device.pageViews || device.count || 0) / totalDevices) *
                    100
                  ).toFixed(0)
                : 0;
            return (
              <div key={idx} className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{
                    backgroundColor: donutColors[idx % donutColors.length],
                  }}
                />
                <span className={styles.legendLabel}>
                  {formatDeviceName(device.device)}:{" "}
                  {formatNumber(device.pageViews || device.count || 0)} (
                  {percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
