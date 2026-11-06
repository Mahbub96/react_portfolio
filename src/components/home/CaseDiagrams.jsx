import React from "react";
import styles from "./home.module.css";

/**
 * Architecture diagrams for projects with a written case study. Shared by the
 * homepage case cards and the /projects/<slug>/ pages; every node restates a
 * fact from caseStudies.mjs.
 */

function Flow({ nodes }) {
  return (
    <div className={styles.flowRow}>
      {nodes.map(([title, sub], index) => (
        <React.Fragment key={title}>
          {index > 0 && <span className={styles.flowArrow} aria-hidden="true" />}
          <div className={styles.flowNode}>
            <b>{title}</b>
            <span>{sub}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/** LinkLens: the redirect never waits on analytics (from the case study). */
function RequestPathDiagram() {
  return (
    <div className={styles.lanes}>
      <div className={`${styles.lane} ${styles.laneHot}`}>
        <span className={styles.laneLabel}>HOT PATH · USER WAITS</span>
        <Flow
          nodes={[
            ["Click", "/:slug"],
            ["NestJS", "redirect engine"],
            ["Redis", "link rules"],
            ["Redirect", "to target"],
          ]}
        />
      </div>
      <p className={styles.laneSplit}>
        <i />
        publish event · non-blocking
        <i />
      </p>
      <div className={`${styles.lane} ${styles.laneCold}`}>
        <span className={styles.laneLabel}>COLD PATH · ASYNC</span>
        <Flow
          nodes={[
            ["BullMQ", "queue"],
            ["Workers", "geo · device"],
            ["ClickHouse", "analytics"],
            ["Dashboards", "live feed"],
          ]}
        />
      </div>
    </div>
  );
}

/** ASR Studio: the guarded fine-tuning workflow (from the case study). */
function TrainingWorkflowDiagram() {
  const steps = [
    "Back up model",
    "Baseline WER/CER",
    "LoRA fine-tune",
    "Re-evaluate",
    "Side-by-side diff",
    "Confusion analysis",
  ];
  return (
    <div>
      <ol className={styles.pipe}>
        {steps.map((step, index) => (
          <li key={step} className={index === 2 ? styles.pipeKey : undefined}>
            <span>STEP {index + 1}</span>
            <b>{step}</b>
          </li>
        ))}
      </ol>
      <div className={styles.verdict}>
        <span className={styles.verdictGood}>New better</span>
        <span>Mixed</span>
        <span className={styles.verdictWarn}>Old better</span>
      </div>
      <p className={styles.gate}>
        <span>GATE</span>A person decides before any model is replaced.
      </p>
    </div>
  );
}

export const CASE_DIAGRAMS = {
  linklens: { label: "REQUEST PATH", note: "read ≠ write", Component: RequestPathDiagram },
  "bangla-and-english-asr-studio": {
    label: "GUARDED TRAINING WORKFLOW",
    note: "fixed test split",
    Component: TrainingWorkflowDiagram,
  },
};
