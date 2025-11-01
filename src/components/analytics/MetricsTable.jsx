"use client";
import {
  formatNumber,
  formatPercent,
  getTrendIcon,
  getTrendClass,
} from "@/utils/analytics/formatters";
import styles from "../../app/analytics/analytics.module.css";

/**
 * Reusable Metrics Table Component
 */
export default function MetricsTable({
  columns = [],
  data = [],
  renderCell,
  className = "",
}) {
  if (!data || data.length === 0) {
    return (
      <div className={`${styles.tableContainer} ${className}`}>
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          No data available
        </div>
      </div>
    );
  }

  if (!columns || columns.length === 0) {
    return null;
  }

  return (
    <div
      className={`${styles.tableContainer} ${className}`}
      style={{ overflowY: "visible" }}
    >
      <table className={styles.metricsTable}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  style={{ overflow: "visible", position: "relative" }}
                >
                  {renderCell ? (
                    renderCell(col, row, rowIdx)
                  ) : (
                    <span>{row[col.key] || "-"}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Trend Cell Component
 */
export function TrendCell({ value, trend, formatter = formatNumber }) {
  if (trend === undefined || trend === null) {
    return <span>{formatter(value)}</span>;
  }

  return (
    <>
      {formatter(value)}
      <span className={styles[getTrendClass(trend)]}>
        {" "}
        <span className={styles[getTrendClass(trend)]}>
          {getTrendIcon(trend)}
        </span>
        {formatPercent(trend)}
      </span>
    </>
  );
}
