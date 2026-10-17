"use client";

import { useEffect, useRef, useState } from "react";
import { LuCheck, LuInfo, LuLoaderCircle, LuRefreshCw, LuSparkles, LuSquare, LuTriangleAlert, LuX } from "react-icons/lu";
import { useAi } from "./AiContext";
import { FIELD_SPECS } from "@/lib/ai/fields.mjs";
import { partialValue } from "@/lib/ai/partial.mjs";
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
  const abortRef = useRef(null);
  const inFlightRef = useRef(false);

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ phase: "idle" });
  };

  // Keep the popover visible when the field sits near the bottom of a panel.
  useEffect(() => {
    if (["streaming", "result", "info", "error"].includes(state.phase)) {
      popoverRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [state.phase]);

  // Outside click and escape key handling
  useEffect(() => {
    if (state.phase === "idle") return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") stop();
    };
    const onDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) stop();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [state.phase]);

  // Abort on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  if (!ai?.enabled) return null;

  const run = async (fresh = false) => {
    if (inFlightRef.current || state.phase === "streaming" || blocked) return;
    inFlightRef.current = true;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const kind = FIELD_SPECS[target]?.kind || "text";
    setState({ phase: "streaming", raw: "", value: kind === "tags" ? [] : "" });

    try {
      const extraData = typeof extra === "function" ? extra() : extra || {};
      const result = await ai.suggest(target, { ...extraData, ...(fresh ? { fresh: true } : {}) }, {
        onChunk: (raw) => {
          const val = partialValue(raw, kind);
          setState((s) => (s.phase === "streaming" ? { ...s, raw, value: val } : s));
        },
        signal: controller.signal,
      });
      if (result.status === "ok") {
        setState({ phase: "result", ...result });
      } else {
        setState({ phase: "info", reason: result.reason });
      }
    } catch (error) {
      if (controller.signal.aborted || error.name === "AbortError" || error.code === "cancelled") {
        setState({ phase: "idle" });
        return;
      }
      if (error.status === 401) return;
      setState({ phase: "error", message: error.message });
    } finally {
      inFlightRef.current = false;
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
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
        onClick={() => (state.phase === "idle" ? run() : stop())}
        disabled={blocked}
        aria-label={tooltip}
        title={tooltip}
        aria-expanded={state.phase !== "idle"}
      >
        {state.phase === "streaming" ? <LuLoaderCircle className={styles.spin} aria-hidden="true" /> : <LuSparkles aria-hidden="true" />}
        {blocked ? <span className={styles.countdown}>{ai.blockedFor}s</span> : null}
      </button>

      {["streaming", "result", "info", "error"].includes(state.phase) ? (
        <div ref={popoverRef} className={`${styles.popover} ${align === "start" ? styles.popoverStart : ""}`} role="dialog" aria-label={`Suggested ${label}`}>
          {state.phase === "streaming" ? (
            <>
              <p className={styles.popoverTitle}>
                <LuLoaderCircle className={styles.spin} aria-hidden="true" /> Generating {label}…
              </p>
              {isList ? (
                <div className={styles.chips}>
                  {state.value?.length ? (
                    state.value.map((item) => (
                      <span key={item} className={styles.chip}>
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className={styles.meta}>Waiting for tags…</span>
                  )}
                </div>
              ) : (
                <p className={styles.value}>{state.value || "…"}</p>
              )}
              <div className={styles.actions}>
                <button type="button" onClick={stop}>
                  <LuSquare aria-hidden="true" /> Stop
                </button>
              </div>
            </>
          ) : state.phase === "result" ? (
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
                <button type="button" onClick={run} disabled={blocked}>
                  <LuRefreshCw aria-hidden="true" /> Try again
                </button>
                <button type="button" onClick={stop} aria-label="Dismiss">
                  <LuX aria-hidden="true" />
                </button>
              </div>
            </>
          ) : state.phase === "error" ? (
            <>
              <div className={`${styles.message} ${styles.messageError}`}>
                <LuTriangleAlert aria-hidden="true" />
                <span>{state.message}</span>
                <button type="button" onClick={stop} aria-label="Close">
                  <LuX aria-hidden="true" />
                </button>
              </div>
              <div className={styles.actions}>
                <button type="button" onClick={run} disabled={blocked}>
                  <LuRefreshCw aria-hidden="true" /> Try again
                </button>
              </div>
            </>
          ) : (
            <div className={styles.message}>
              <LuInfo aria-hidden="true" />
              <span>{state.reason}</span>
              <button type="button" onClick={stop} aria-label="Close">
                <LuX aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </span>
  );
}
