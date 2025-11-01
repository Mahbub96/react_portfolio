"use client";
import { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import MetricsTable, { TrendCell } from "./MetricsTable";
import CountryTooltip from "./CountryTooltip";
import { formatNumber } from "@/utils/analytics/formatters";
import { formatCountryName } from "@/utils/analytics/dataFormatters";
import styles from "../../app/analytics/analytics.module.css";

/**
 * Countries Table Component with Pagination
 */
export default function CountriesTable({
  countriesData = [],
  itemsPerPage = 6,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!countriesData || countriesData.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        No country data available
      </div>
    );
  }

  const totalPages = Math.ceil(countriesData.length / itemsPerPage);
  const paginatedCountries = countriesData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    { key: "country", label: "Country" },
    { key: "pageViews", label: "Page views" },
    { key: "users", label: "Users" },
    { key: "sessions", label: "Sessions" },
    { key: "clicks", label: "Clicks" },
  ];

  const renderCell = (col, row) => {
    if (col.key === "country") {
      return (
        <CountryTooltip
          country={formatCountryName(row.country)}
          cities={row.cities || []}
        >
          <span className={styles.countryCell}>
            {formatCountryName(row.country)}
          </span>
        </CountryTooltip>
      );
    }
    if (col.key === "pageViews") {
      return <TrendCell value={row.pageViews} trend={row.trendPageViews} />;
    }
    if (col.key === "users") {
      return <TrendCell value={row.users} trend={row.trendUsers} />;
    }
    if (col.key === "sessions") {
      return <TrendCell value={row.sessions} trend={row.trendSessions} />;
    }
    if (col.key === "clicks") {
      return <TrendCell value={row.clicks} trend={row.trendClicks} />;
    }
    return <span>{formatNumber(row[col.key] || 0)}</span>;
  };

  return (
    <>
      <MetricsTable
        columns={columns}
        data={paginatedCountries}
        renderCell={renderCell}
      />
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationControls}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={styles.paginationBtn}
            >
              <FaArrowLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={styles.paginationBtn}
            >
              <FaArrowRight size={14} />
            </button>
          </div>
          <span className={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </>
  );
}
