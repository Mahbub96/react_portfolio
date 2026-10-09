"use client";

import { useEffect, useRef, useState } from "react";
import { LuCheck, LuInfo, LuLoaderCircle, LuRefreshCw, LuSparkles, LuTriangleAlert, LuX } from "react-icons/lu";
import { useAi } from "./AiContext";
import styles from "./ai.module.css";

function limitsLabel(remaining) {
  if (!remaining) return "";
  const parts = [`${remaining.minute} left this minute`];
  if (remaining.day !== null && remaining.day !== undefined) parts.push(`${remaining.day} today`);
  return parts.join(" · ");
}

/**
 * ✨ button for one field. Nothing is sent until it is clicked; the answer
 * is a suggestion the owner accepts, retries or dismisses — it never
 * overwrites a field on its own.
 *
 * @param target   AI target (fields.mjs)
 * @param label    e.g. "meta description" (button tooltip, popover title)
 * @param extra    function returning extra request data (selection, image…)
 * @param onAccept called with the suggested value
 */
export default function AiAssist({ target, label, extra, onAccept, align = "end" }) {
  const ai = useAi();
  const [state, setState] = useState({ phase: "idle" });
  const wrapRef = useRef(null);
  const popoverRef = useRef(null);

  // Keep the popover visible when the field sits near the bottom of a panel.
  useEffect(() => {
    if (["result", "info", "error"].includes(state.phase)) {
      popoverRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [state.phase]);

  useEffect(() => {
    if (state.phase === "idle" || state.phase === "loading") return undefined;
    const onKey = (event) => event.key === "Escape" && setState({ phase: "idle" });
    const onDown = (event) => !wrapRef.current?.contains(event.target) && setState({ phase: "idle" });
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [state.phase]);

  if (!ai?.enabled) return null;

  const run = async (fresh = false) => {
    setState({ phase: "loading" });
    try {
      const result = await ai.suggest(target, typeof extra === "function" ? extra() : extra || {}, { fresh });
      setState(result.status === "ok" ? { phase: "result", ...result } : { phase: "info", reason: result.reason });
    } catch (error) {
      if (error.status === 401) return;
      setState({ phase: "error", message: error.message });
    }
  };

  const blocked = ai.blockedFor > 0;
  const tooltip = blocked ? `AI limit reached. Try again in ${ai.blockedFor}s` : `Suggest ${label} with AI${ai.remaining ? ` (${limitsLabel(ai.remaining)})` : ""}`;
  const isList = Array.isArray(state.value);

  return (
    <span className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={`${styles.trigger} ${state.phase !== "idle" ? styles.triggerActive : ""}`}
        onClick={() => (state.phase === "idle" ? run() : setState({ phase: "idle" }))}
        disabled={state.phase === "loading" || blocked}
        aria-label={tooltip}
        title={tooltip}
        aria-expanded={state.phase !== "idle"}
      >
        {state.phase === "loading" ? <LuLoaderCircle className={styles.spin} aria-hidden="true" /> : <LuSparkles aria-hidden="true" />}
        {blocked ? <span className={styles.countdown}>{ai.blockedFor}s</span> : null}
      </button>

      {["result", "info", "error"].includes(state.phase) ? (
        <div ref={popoverRef} className={`${styles.popover} ${align === "start" ? styles.popoverStart : ""}`} role="dialog" aria-label={`Suggested ${label}`}>
          {state.phase === "result" ? (
            <>
              <p className={styles.popoverTitle}>
                <LuSparkles aria-hidden="true" /> Suggested {label}
              </p>
              {isList ? (
                <div className={styles.chips}>
                  {state.value.map((item) => (
                    <span key={item} className={styles.chip}>
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={styles.value}>{state.value}</p>
              )}
              {!isList ? <span className={styles.meta}>{String(state.value).length} characters</span> : null}
              {state.warnings?.length ? (
                <ul className={styles.warnings}>
                  {state.warnings.map((warning) => (
                    <li key={warning}>
                      <LuTriangleAlert aria-hidden="true" /> {warning}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className={styles.actions}>
                <button type="button" className={styles.primary} onClick={() => { onAccept(state.value); setState({ phase: "idle" }); }}>
                  <LuCheck aria-hidden="true" /> Use it
                </button>
                <button type="button" onClick={() => run(true)} disabled={blocked}>
                  <LuRefreshCw aria-hidden="true" /> Try again
                </button>
                <button type="button" onClick={() => setState({ phase: "idle" })} aria-label="Dismiss">
                  <LuX aria-hidden="true" />
                </button>
              </div>
            </>
          ) : (
            <div className={`${styles.message} ${state.phase === "error" ? styles.messageError : ""}`}>
              {state.phase === "error" ? <LuTriangleAlert aria-hidden="true" /> : <LuInfo aria-hidden="true" />}
              <span>{state.phase === "error" ? state.message : state.reason}</span>
              <button type="button" onClick={() => setState({ phase: "idle" })} aria-label="Close">
                <LuX aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </span>
  );
}
