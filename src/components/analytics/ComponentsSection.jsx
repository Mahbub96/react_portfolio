"use client";
import { FaChartBar } from "react-icons/fa";
import AnalyticsCard from "./AnalyticsCard";
import ComponentsTable from "./ComponentsTable";

/**
 * Components Interaction Section Component
 */
export default function ComponentsSection({ componentsData = [] }) {
  if (!componentsData || componentsData.length === 0) {
    return (
      <AnalyticsCard
        title="TOP INTERACTIVE COMPONENTS"
        icon={FaChartBar}
        subtitle="Last 14 days"
      >
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          No component interactions recorded yet.
        </div>
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard
      title="TOP INTERACTIVE COMPONENTS"
      icon={FaChartBar}
      subtitle="Last 14 days"
    >
      <ComponentsTable componentsData={componentsData} />
    </AnalyticsCard>
  );
}
