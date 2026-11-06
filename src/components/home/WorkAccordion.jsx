"use client";

import React, { useState } from "react";
import styles from "./home.module.css";

/**
 * FAQ-style list for "Selected work": one project open at a time, click a row
 * to open it (the previous one closes), click the open row to close it.
 * Panels stay in the HTML (search engines and no-JS readers still get the
 * full text); closed panels are `inert` so keyboard focus skips them.
 */
export default function WorkAccordion({ items, defaultOpen = 0 }) {
  const [open, setOpen] = useState(items[defaultOpen]?.key ?? null);

  return (
    <ol className={styles.acc}>
      {items.map((item, index) => {
        const isOpen = open === item.key;
        const triggerId = `work-${item.key}-trigger`;
        const panelId = `work-${item.key}-panel`;
        return (
          <li key={item.key} className={`${styles.accItem} ${isOpen ? styles.accOpen : ""}`}>
            {item.admin}
            <h3 className={styles.accHead}>
              <button
                type="button"
                id={triggerId}
                className={styles.accTrigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen((current) => (current === item.key ? null : item.key))}
              >
                <span className={styles.accNum}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.accTitle}>
                  <span className={styles.accName}>{item.name}</span>
                  <span className={styles.accSummary}>{item.summary}</span>
                </span>
                {item.meta && <span className={styles.accMeta}>{item.meta}</span>}
                <span className={styles.accEnd}>
                  {item.thumb && (
                    <span className={styles.accThumb} aria-hidden="true">
                      {/* Decorative: the project name is already the button label. */}
                      <img src={item.thumb} alt="" width={320} height={180} loading="lazy" decoding="async" />
                    </span>
                  )}
                  <span className={styles.accIcon} aria-hidden="true" />
                </span>
              </button>
            </h3>
            {/* React 18 has no `inert` prop; a string attribute passes through. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={styles.accPanel}
              {...(isOpen ? {} : { inert: "" })}
            >
              <div className={styles.accInner}>{item.panel}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
