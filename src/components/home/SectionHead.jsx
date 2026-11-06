import React from "react";
import styles from "./home.module.css";

/** Two-column section header: numbered kicker on the left, heading + intro. */
export default function SectionHead({ index, kicker, id, title, intro, as: Heading = "h2" }) {
  return (
    <div className={styles.head}>
      <p className={styles.kicker}>
        {index} — {kicker}
      </p>
      <div>
        <Heading id={id} className={styles.headTitle}>
          {title}
        </Heading>
        {intro && <p className={styles.headIntro}>{intro}</p>}
      </div>
    </div>
  );
}
