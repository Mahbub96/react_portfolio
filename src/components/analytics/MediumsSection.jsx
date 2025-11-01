"use client";
import { FaChartBar, FaCalendarAlt } from "react-icons/fa";
import DonutChart from "./DonutChart";
import MediumsTable from "./MediumsTable";
import { formatNumber } from "@/utils/analytics/formatters";
import { formatMediumName } from "@/utils/analytics/dataFormatters";
import styles from "../../app/analytics/analytics.module.css";

/**
 * Mediums Section Component (Donut Chart + Table)
 */
export default function MediumsSection({ mediumsData = [], itemsPerPage = 6 }) {
  const totalMediums = mediumsData.reduce(
    (sum, m) => sum + (m.pageViews || 0),
    0
  );

  const hasData = mediumsData && mediumsData.length > 0;

  const donutColors = ["#1565c0", "#f59e0b", "#fbbf24", "#60a5fa"];

  if (!hasData) {
    return (
      <>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FaChartBar size={16} />
              <span>BY MEDIUMS</span>
            </div>
            <div className={styles.cardSubtitle}>
              <FaCalendarAlt size={14} />
              <span>Last 14 days</span>
            </div>
          </div>
          <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
            No medium data available
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FaChartBar size={16} />
              <span>BY MEDIUMS</span>
            </div>
            <div className={styles.cardSubtitle}>
              <FaCalendarAlt size={14} />
              <span>Last 14 days</span>
            </div>
          </div>
          <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
            No medium data available
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mediums Donut Chart */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FaChartBar size={16} />
            <span>BY MEDIUMS</span>
          </div>
          <div className={styles.cardSubtitle}>
            <FaCalendarAlt size={14} />
            <span>Last 14 days</span>
          </div>
        </div>
        <div className={styles.donutContainer}>
          <DonutChart
            data={mediumsData}
            total={totalMediums}
            colors={donutColors}
            style={{ height: "250px", width: "100%" }}
          />
          <div className={styles.donutLegend}>
            {mediumsData.map((medium, idx) => {
              const percentage =
                totalMediums > 0
                  ? ((medium.pageViews / totalMediums) * 100).toFixed(0)
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
                    {formatMediumName(medium.medium || "-")}:{" "}
                    {formatNumber(medium.pageViews)} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mediums Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FaChartBar size={16} />
            <span>BY MEDIUMS</span>
          </div>
          <div className={styles.cardSubtitle}>
            <FaCalendarAlt size={14} />
            <span>Last 14 days</span>
          </div>
        </div>
        <MediumsTable mediumsData={mediumsData} itemsPerPage={itemsPerPage} />
      </div>
    </>
  );
}
