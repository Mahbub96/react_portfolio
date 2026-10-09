"use client";

import { LuCheck, LuInfo, LuLoaderCircle, LuSparkles, LuTriangleAlert, LuX } from "react-icons/lu";
import styles from "./ai.module.css";

const TITLES = {
  "body.outline": "Outline from your notes",
  "body.expand": "Expanded text",
  "body.improve": "Improved wording",
};

/**
 * Floating review panel for body suggestions: the Markdown streams in, then
 * the owner inserts it (converted to editor blocks) or discards it. Nothing
 * touches the post until Accept.
 */
export default function BodyDraft({ draft, onAccept, onDiscard }) {
  if (!draft) return null;
  const { target, phase, text, warnings, reason, error } = draft;
  return (
    <div className={styles.bodyPanel} role="dialog" aria-label={TITLES[target]}>
      <div className={styles.bodyHead}>
        <p className={styles.popoverTitle}>
          {phase === "streaming" ? <LuLoaderCircle className={styles.spin} aria-hidden="true" /> : <LuSparkles aria-hidden="true" />}
          {TITLES[target]}
        </p>
        <button type="button" className={styles.close} onClick={onDiscard} aria-label="Discard">
          <LuX />
        </button>
      </div>

      {phase === "info" || phase === "error" ? (
        <div className={`${styles.message} ${phase === "error" ? styles.messageError : ""}`}>
          {phase === "error" ? <LuTriangleAlert aria-hidden="true" /> : <LuInfo aria-hidden="true" />}
          <span>{phase === "error" ? error : reason}</span>
        </div>
      ) : (
        <pre className={styles.bodyText}>{text || "…"}</pre>
      )}

      {warnings?.length ? (
        <ul className={styles.warnings}>
          {warnings.map((warning) => (
            <li key={warning}>
              <LuTriangleAlert aria-hidden="true" /> {warning}
            </li>
          ))}
        </ul>
      ) : null}

      {phase === "ready" ? (
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onAccept}>
            <LuCheck aria-hidden="true" /> {target === "body.outline" ? "Insert" : "Replace selection"}
          </button>
          <button type="button" onClick={onDiscard}>
            Discard
          </button>
        </div>
      ) : null}
    </div>
  );
}
