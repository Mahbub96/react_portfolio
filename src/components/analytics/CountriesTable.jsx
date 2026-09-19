"use client";
import React, { useState, useMemo } from "react";
import { FaArrowLeft, FaArrowRight, FaGlobeAmericas } from "react-icons/fa";
import CountryTooltip from "./CountryTooltip";
import { formatNumber } from "@/utils/analytics/formatters";
import { formatCountryName } from "@/utils/analytics/dataFormatters";
import styles from "./countriesTable.module.css";

/**
 * Modern Countries Leaderboard Component
 * Clean, visual, informative country distribution with progress bars
 */
export default function CountriesTable({
  countriesData = [],
  itemsPerPage = 5,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const maxSessions = useMemo(() => {
    if (!countriesData || countriesData.length === 0) return 1;
    return Math.max(...countriesData.map((c) => c.sessions || 1));
  }, [countriesData]);

  if (!countriesData || countriesData.length === 0) {
    return (
      <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "#64748b" }}>
        <FaGlobeAmericas size={32} style={{ marginBottom: "0.5rem", opacity: 0.5 }} />
        <p style={{ margin: 0, fontSize: "0.88rem" }}>No country traffic recorded yet</p>
      </div>
    );
  }

  const totalPages = Math.ceil(countriesData.length / itemsPerPage);
  const paginatedCountries = countriesData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.container}>
      {paginatedCountries.map((row, idx) => {
        const rank = (currentPage - 1) * itemsPerPage + idx + 1;
        const sessionCount = row.sessions || 0;
        const pageViews = row.pageViews || 0;
        const users = row.users || 0;
        const pct = Math.min(100, Math.max(8, Math.round((sessionCount / maxSessions) * 100)));

        return (
          <div key={row.country || idx} className={styles.countryRow}>
            {/* Left: Rank & Country Name with Tooltip */}
            <div className={styles.leftInfo}>
              <span className={`${styles.rankBadge} ${rank <= 3 ? styles.rankTop : ""}`}>
                {rank}
              </span>
              <CountryTooltip
                country={formatCountryName(row.country)}
                cities={row.cities || []}
              >
                <span className={styles.countryName}>
                  {formatCountryName(row.country)}
                </span>
              </CountryTooltip>
            </div>

            {/* Middle: Relative Volume Progress Bar */}
            <div className={styles.barWrapper}>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Right: Key Metric Numbers */}
            <div className={styles.rightMetrics}>
              <div className={styles.metricBlock}>
                <span className={styles.metricValue}>{formatNumber(sessionCount)}</span>
                <span className={styles.metricLabel}>Sessions</span>
              </div>

              <div className={styles.metricBlock}>
                <span className={styles.metricValue} style={{ color: "#38bdf8" }}>
                  {formatNumber(users)}
                </span>
                <span className={styles.metricLabel}>Users</span>
              </div>

              <div className={styles.metricBlock}>
                <span className={styles.metricValue} style={{ color: "#f59e0b" }}>
                  {formatNumber(pageViews)}
                </span>
                <span className={styles.metricLabel}>Views</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Modern Pagination Bar */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={styles.paginationBtn}
          >
            <FaArrowLeft size={11} />
            <span>Prev</span>
          </button>

          <span className={styles.paginationInfo}>
            Page {currentPage} of {totalPages} ({countriesData.length} countries)
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={styles.paginationBtn}
          >
            <span>Next</span>
            <FaArrowRight size={11} />
          </button>
        </div>
      )}
    </div>
  );
}
