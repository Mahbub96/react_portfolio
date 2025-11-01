"use client";
import MetricsTable from "./MetricsTable";
import { formatNumber } from "@/utils/analytics/formatters";
import { formatComponentName } from "@/utils/analytics/dataFormatters";
import styles from "../../app/analytics/analytics.module.css";

/**
 * Components Interaction Table Component
 */
export default function ComponentsTable({ componentsData = [] }) {
  if (!componentsData || componentsData.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        No component interactions recorded yet.
      </div>
    );
  }

  // Calculate total interactions and percentages
  const totalInteractions = componentsData.reduce(
    (sum, comp) => sum + (comp.interactions || 0),
    0
  );

  const componentsWithPercentage = componentsData.map((comp) => ({
    ...comp,
    displayName: formatComponentName(comp.component),
    percentage:
      totalInteractions > 0
        ? ((comp.interactions / totalInteractions) * 100).toFixed(1)
        : "0.0",
  }));

  const columns = [
    { key: "component", label: "Component Name" },
    { key: "interactions", label: "Interactions" },
    { key: "percentage", label: "Usage %" },
  ];

  const renderCell = (col, row) => {
    if (col.key === "component") {
      return (
        <span style={{ fontWeight: 500 }}>
          {row.displayName ||
            formatComponentName(row.component) ||
            "Unknown Element"}
        </span>
      );
    }
    if (col.key === "interactions") {
      return <span>{formatNumber(row.interactions || 0)}</span>;
    }
    if (col.key === "percentage") {
      return <span>{row.percentage}%</span>;
    }
    return <span>{row[col.key] || "-"}</span>;
  };

  return (
    <MetricsTable
      columns={columns}
      data={componentsWithPercentage}
      renderCell={renderCell}
    />
  );
}
