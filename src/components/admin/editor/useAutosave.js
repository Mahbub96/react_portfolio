"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch } from "../adminApi";

const DELAY = 1500;
const backupKey = (id) => `blog-editor:${id}`;

export function readBackup(id) {
  try {
    return JSON.parse(localStorage.getItem(backupKey(id)) || "null");
  } catch {
    return null;
  }
}

export function clearBackup(id) {
  try {
    localStorage.removeItem(backupKey(id));
  } catch {
    // storage unavailable
  }
}

/**
 * Debounced, version-checked autosave of the changed fields only.
 *
 * - Saves 1.5 s after the last change; one request in flight at a time.
 * - Every change is mirrored to localStorage until the server confirms it,
 *   so a crash, closed tab or lost connection never loses work.
 * - A stale version (another tab saved) puts the editor in "conflict" and
 *   stops saving rather than overwriting the newer copy.
 *
 * status: "saved" | "dirty" | "saving" | "offline" | "error" | "conflict"
 */
export function useAutosave({ id, version, onSaved, onError, extraBody }) {
  const [status, setStatusState] = useState("saved");
  const [savedAt, setSavedAt] = useState(null);
  const fields = useRef({});
  const dirty = useRef(new Set());
  const versionRef = useRef(version);
  const inFlight = useRef(null);
  const timer = useRef(null);
  const statusRef = useRef(status);
  // Keep the ref in step immediately: the save loop reads it right after a
  // failed request, before React re-renders.
  const setStatus = useCallback((value) => {
    statusRef.current = typeof value === "function" ? value(statusRef.current) : value;
    setStatusState(statusRef.current);
  }, []);
  const extraRef = useRef(extraBody);
  extraRef.current = extraBody;

  useEffect(() => {
    versionRef.current = version;
  }, [version]);

  const save = useCallback(async () => {
    clearTimeout(timer.current);
    if (inFlight.current) return inFlight.current;
    if (!dirty.current.size || statusRef.current === "conflict") return null;

    const keys = [...dirty.current];
    dirty.current.clear();
    const body = { version: versionRef.current, ...(extraRef.current?.(keys) || {}) };
    for (const key of keys) body[key] = fields.current[key];
    setStatus("saving");

    inFlight.current = (async () => {
      try {
        const result = await adminFetch(`/posts/${id}/`, { method: "PATCH", body });
        versionRef.current = result.version;
        setSavedAt(new Date());
        onSaved?.(result, keys);
        if (dirty.current.size) {
          setStatus("dirty");
        } else {
          setStatus("saved");
          clearBackup(id);
        }
        return result;
      } catch (error) {
        const slugRejected = error.body?.details?.field === "slug" || (error.status === 422 && keys.includes("slug") && /slug/i.test(error.message));
        // A rejected URL must not block the other fields: retry them without it.
        keys.filter((key) => !(slugRejected && key === "slug")).forEach((key) => dirty.current.add(key));
        if (error.status === 409 && error.body?.details?.version !== undefined) {
          setStatus("conflict");
        } else if (error.status === 401) {
          setStatus("error");
        } else if (!error.status || error.status >= 500) {
          setStatus("offline");
          timer.current = setTimeout(save, 5000);
        } else {
          onError?.(error, keys);
          // Only the slug was wrong: save the rest now. Otherwise wait for the
          // next edit instead of retrying the same failing request.
          setStatus(slugRejected && dirty.current.size ? "dirty" : "error");
        }
        return null;
      } finally {
        inFlight.current = null;
      }
    })();
    const result = await inFlight.current;
    if (dirty.current.size && statusRef.current === "dirty") {
      timer.current = setTimeout(save, DELAY);
    }
    return result;
  }, [id, onSaved, onError]);

  /** Record changed fields and schedule a save. */
  const change = useCallback(
    (patch, current) => {
      fields.current = current;
      Object.keys(patch).forEach((key) => dirty.current.add(key));
      try {
        localStorage.setItem(backupKey(id), JSON.stringify({ at: Date.now(), fields: current }));
      } catch {
        // storage full or unavailable
      }
      if (statusRef.current !== "conflict") {
        if (statusRef.current !== "saving") setStatus("dirty");
        clearTimeout(timer.current);
        timer.current = setTimeout(save, DELAY);
      }
    },
    [id, save, setStatus]
  );

  /** Save now and wait until nothing is pending (before publish/preview). */
  const flush = useCallback(async () => {
    for (let i = 0; i < 5 && (dirty.current.size || inFlight.current); i += 1) {
      if (inFlight.current) await inFlight.current;
      else await save();
      if (["conflict", "error", "offline"].includes(statusRef.current)) return false;
    }
    return !dirty.current.size;
  }, [save]);

  // Warn before leaving with unsaved work.
  useEffect(() => {
    const onBeforeUnload = (event) => {
      if (dirty.current.size || inFlight.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      clearTimeout(timer.current);
    };
  }, []);

  return { status, savedAt, change, save, flush, setStatus };
}
