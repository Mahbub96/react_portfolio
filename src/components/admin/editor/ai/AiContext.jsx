"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { adminFetch, ApiError } from "../../adminApi";

/**
 * AI writing assist for the editor. Calls happen only when the owner clicks
 * a Generate button; every request carries all of the post's fields (from
 * getContext) so the model knows what it is filling and from what.
 */
const AiContext = createContext(null);
export const useAi = () => useContext(AiContext);

export function AiProvider({ getContext, children }) {
  const [status, setStatus] = useState(null); // { enabled, model, remaining }
  const [blockedUntil, setBlockedUntil] = useState(0);
  const [, tick] = useState(0);
  const contextRef = useRef(getContext);
  contextRef.current = getContext;

  useEffect(() => {
    adminFetch("/ai/status/")
      .then(setStatus)
      .catch(() => setStatus({ enabled: false }));
  }, []);

  // Re-render once a second while rate-limited, for the countdown.
  useEffect(() => {
    if (blockedUntil <= Date.now()) return undefined;
    const timer = setInterval(() => (Date.now() >= blockedUntil ? (setBlockedUntil(0), clearInterval(timer)) : tick((n) => n + 1)), 1000);
    return () => clearInterval(timer);
  }, [blockedUntil]);

  const noteResult = useCallback((data) => {
    if (data?.remaining) setStatus((s) => (s ? { ...s, remaining: data.remaining } : s));
  }, []);

  const noteError = useCallback((error) => {
    const retryAfter = Number(error?.body?.retryAfter || error?.retryAfter || 0);
    if (error?.status === 429 && retryAfter) setBlockedUntil(Date.now() + retryAfter * 1000);
  }, []);

  /** Short field: resolves to { status, value, warnings } or throws ApiError. */
  const suggest = useCallback(
    async (target, extra = {}, { fresh = false } = {}) => {
      try {
        const data = await adminFetch("/ai/generate/", { method: "POST", body: { target, ...contextRef.current(), ...extra, fresh } });
        noteResult(data);
        return data;
      } catch (error) {
        noteError(error);
        throw error;
      }
    },
    [noteResult, noteError]
  );

  /**
   * Body action: streams Markdown through onChunk(textSoFar), resolves to
   * the final validated { status, value, warnings } (or throws ApiError).
   */
  const streamBody = useCallback(
    async (target, extra, onChunk) => {
      const response = await fetch("/api/admin/blog/ai/generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, ...contextRef.current(), ...extra }),
      });
      const type = response.headers.get("content-type") || "";
      if (!type.includes("ndjson")) {
        const body = await response.json().catch(() => ({}));
        const error = new ApiError(body.error || `Request failed (${response.status})`, response.status, body);
        noteError(error);
        if (response.status === 401) window.location.assign(`/admin/login/?next=${encodeURIComponent(window.location.pathname)}`);
        throw error;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";
      let final = null;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines.filter(Boolean)) {
          const event = JSON.parse(line);
          if (event.type === "chunk") {
            text += event.text;
            onChunk?.(text);
          } else if (event.type === "done") {
            final = event;
          } else if (event.type === "error") {
            const error = new ApiError(event.error, event.code === "provider" ? 502 : 500, event);
            noteError(error);
            throw error;
          }
        }
      }
      if (!final) throw new ApiError("The AI answer was cut off. Try again.", 502, {});
      noteResult(final);
      return final;
    },
    [noteResult, noteError]
  );

  const value = {
    enabled: Boolean(status?.enabled),
    remaining: status?.remaining || null,
    blockedFor: Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000)),
    suggest,
    streamBody,
  };
  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}
