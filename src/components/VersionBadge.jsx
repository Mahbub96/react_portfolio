"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./versionBadge.module.css";

/** Render `code` and **bold** spans from changelog text; everything else is plain text. */
function InlineText({ text = "" }) {
  return String(text)
    .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index}>{part.slice(1, -1)}</code>;
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
}

/**
 * Footer version badge. Clicking it opens the release notes for the running
 * build and every earlier version (parsed from CHANGELOG.md at build time),
 * newest first in a scrollable list.
 *
 * The notes are fetched from /release-notes.json only when the dialog opens:
 * rendering them into the footer would repeat changelog text on every page's
 * indexed HTML. The native <dialog> element provides focus handling,
 * Escape-to-close and the backdrop.
 */
export default function VersionBadge({ version, buildNumber, hasReleaseNotes }) {
  const dialogRef = useRef(null);
  const [state, setState] = useState({ status: "idle", data: null });

  const load = useCallback(async () => {
    if (state.status === "loaded" || state.status === "loading") return;
    setState({ status: "loading", data: null });
    try {
      const response = await fetch("/release-notes.json", { cache: "no-cache" });
      if (!response.ok) throw new Error(String(response.status));
      setState({ status: "loaded", data: await response.json() });
    } catch {
      setState({ status: "error", data: null });
    }
  }, [state.status]);

  const open = useCallback(() => {
    dialogRef.current?.showModal();
    load();
  }, [load]);

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Close when the backdrop (the dialog element itself) is clicked.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const onClick = (event) => {
      if (event.target === dialog) dialog.close();
    };
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, []);

  const badge = (
    <>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.version}>v{version}</span>
      <span className={styles.separator} aria-hidden="true">
        •
      </span>
      <span className={styles.build}>Build {buildNumber}</span>
    </>
  );

  if (!hasReleaseNotes) {
    return <span className={styles.badge}>{badge}</span>;
  }

  const data = state.data;
  const releases = data?.releases ?? [];
  const builtOn = data?.buildDate ? data.buildDate.slice(0, 10) : null;

  return (
    <>
      <button
        type="button"
        className={`${styles.badge} ${styles.clickable}`}
        onClick={open}
        aria-haspopup="dialog"
        title="What's new in this version"
      >
        {badge}
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="release-notes-title"
      >
        <div className={styles.panel}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Release notes</p>
              <h2 id="release-notes-title" className={styles.title}>
                Version {version}
              </h2>
              <p className={styles.meta}>
                Build {buildNumber}
                {data?.commitHash ? ` · ${data.commitHash}` : ""}
                {builtOn ? ` · ${builtOn}` : ""}
              </p>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={close}
              aria-label="Close release notes"
            >
              ×
            </button>
          </header>

          <div className={styles.body} aria-live="polite">
            {state.status === "loading" ? (
              <p className={styles.intro}>Loading…</p>
            ) : null}

            {state.status === "error" ? (
              <p className={styles.intro}>
                Release notes could not be loaded. Please try again.
              </p>
            ) : null}

            {releases.map((release) => (
              <article
                key={release.version}
                className={styles.release}
                aria-labelledby={`release-${release.version}`}
              >
                <h3 id={`release-${release.version}`} className={styles.releaseTitle}>
                  v{release.version}
                  {release.version === version ? (
                    <span className={styles.current}>Current</span>
                  ) : null}
                </h3>

                {release.intro ? (
                  <p className={styles.intro}>
                    <InlineText text={release.intro} />
                  </p>
                ) : null}

                {release.sections.map((section) => (
                  <section key={section.title} className={styles.section}>
                    <h4 className={styles.sectionTitle}>{section.title}</h4>
                    <ul className={styles.list}>
                      {section.items.map((item) => (
                        <li key={item.slice(0, 60)}>
                          <InlineText text={item} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </article>
            ))}
          </div>
        </div>
      </dialog>
    </>
  );
}
