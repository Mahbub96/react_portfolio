import React from "react";
import styles from "./skills.module.css";

export default function TechnologyChip({ name, icon: Icon, color }) {
  return (
    <div
      className={styles.techChip}
      role="listitem"
      tabIndex={0}
      aria-label={`${name} skill`}
    >
      {Icon && (
        <span
          className={styles.chipIconWrapper}
          style={{ "--brand-color": color || "currentColor" }}
          aria-hidden="true"
        >
          <Icon className={styles.chipIcon} />
        </span>
      )}
      <span className={styles.chipName}>{name}</span>
    </div>
  );
}
