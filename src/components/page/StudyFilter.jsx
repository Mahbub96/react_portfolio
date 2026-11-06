"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

/**
 * Category filter for the case-study list. The cards themselves are rendered
 * on the server and passed in as nodes; this only toggles which are shown.
 * Filters are derived from the categories present, so an empty filter is
 * never offered.
 */
export default function StudyFilter({ head, filters = [], items = [] }) {
  const [active, setActive] = useState("all");
  const visible = items.filter((item) => active === "all" || item.cats.includes(active));

  return (
    <>
      <div className={styles.sh}>
        {head}
        {filters.length > 1 && (
          <div className={styles.filters} role="group" aria-label="Filter case studies">
            {[{ key: "all", label: "All" }, ...filters].map((filter) => (
              <button
                key={filter.key}
                type="button"
                aria-pressed={active === filter.key}
                onClick={() => setActive(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {visible.map((item) => (
        <React.Fragment key={item.key}>{item.node}</React.Fragment>
      ))}
    </>
  );
}
