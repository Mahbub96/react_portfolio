"use client";
import { FaChartBar, FaCalendarAlt } from "react-icons/fa";
import CountriesMap from "./CountriesMap";
import { formatNumber } from "@/utils/analytics/formatters";
import { formatCountryName } from "@/utils/analytics/dataFormatters";
import styles from "../../app/analytics/analytics.module.css";

/**
 * Country Sessions Card Component (Map + Summary List)
 */
export default function CountrySessionsCard({
  countriesData = [],
  worldMapLoaded = false,
}) {
  const totalCountriesSessions = (countriesData || []).reduce(
    (sum, c) => sum + (c.sessions || 0),
    0
  );

  const topCountries = (countriesData || [])
    .sort((a, b) => (b.sessions || 0) - (a.sessions || 0))
    .slice(0, 4);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <FaChartBar size={16} />
          <span>COUNTRY BY SESSIONS</span>
        </div>
        <div className={styles.cardSubtitle}>
          <FaCalendarAlt size={14} />
          <span>Last 14 days</span>
        </div>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.countriesLayout}>
          <div className={styles.countriesLeft}>
            <div className={styles.countriesSummary}>
              <span className={styles.summaryValue}>
                {formatNumber(totalCountriesSessions)}
              </span>
              <span className={styles.summaryLabel}>- World</span>
            </div>
            <div className={styles.countriesList}>
              {topCountries.map((country, idx) => (
                <div key={idx} className={styles.countryListItem}>
                  <span className={styles.countryName}>
                    {formatCountryName(country.country)}
                  </span>
                  <span className={styles.countryValue}>
                    {formatNumber(country.sessions)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.countriesRight}>
            <CountriesMap
              countriesData={countriesData}
              worldMapLoaded={worldMapLoaded}
              totalSessions={totalCountriesSessions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
