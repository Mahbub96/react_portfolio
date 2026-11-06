import React from "react";
import styles from "./home.module.css";
import SectionHead from "./SectionHead";

const PRINCIPLES = [
  {
    title: "Root cause first",
    body: "Trace behaviour to the owning layer before changing code.",
  },
  {
    title: "Evidence over opinion",
    body: "Baselines, logs and measurements decide — not guesses.",
  },
  {
    title: "Simple, then scalable",
    body: "The smallest robust fix, with room to grow and no over-engineering.",
  },
  {
    title: "Observable systems",
    body: "Health checks, metrics and clear failure paths in production.",
  },
];

export default function HomePrinciples() {
  return (
    <section className={`${styles.section} ${styles.tint}`} aria-labelledby="principles-heading">
      <div className={styles.wrap}>
        <SectionHead
          index="01"
          kicker="How I work"
          id="principles-heading"
          title="Engineering habits behind the projects."
        />
        <ol className={styles.principles}>
          {PRINCIPLES.map((item, index) => (
            <li key={item.title}>
              <span className={styles.mono}>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
