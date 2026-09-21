"use client";

import styles from "./resume.module.css";

/**
 * The only client-side JS on the resume page: a button that hands the
 * rendered CV to the browser's native print engine. "Save as PDF" is a
 * built-in destination in every modern browser, so no PDF library ships
 * to the client and no PDF is ever rendered on the server.
 */
export default function PrintButton() {
  return (
    <button
      type="button"
      className={styles.printButton}
      onClick={() => window.print()}
      aria-label="Download CV as PDF"
    >
      <span aria-hidden="true">⤓</span> Download PDF
    </button>
  );
}
