/**
 * Minimal client for NVIDIA NIM (or any OpenAI-compatible) chat completions.
 *
 * - No automatic retries: every request counts against the provider's
 *   per-minute limit, so a 429 is reported (with retry-after) instead.
 * - Reasoning models may emit <think>…</think> text; it is stripped.
 */

export class AiProviderError extends Error {
  constructor(message, { status = 502, retryAfter = null, code = null } = {}) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
    this.code = code;
  }
}

/** Remove reasoning text some models put before the answer. */
export function stripThinking(text) {
  let out = String(text || "").replace(/<think>[\s\S]*?<\/think>/gi, "");
  const close = out.toLowerCase().lastIndexOf("</think>");
  if (close !== -1) out = out.slice(close + "</think>".length); // opening tag was cut off
  return out.replace(/^\s*<think>[\s\S]*$/i, "").trim();
}

function requestBody(config, messages, { maxTokens, stream }) {
  return {
    model: config.model,
    messages,
    max_tokens: maxTokens,
    temperature: 0.3,
    top_p: 0.9,
    stream,
    ...(stream ? { stream_options: { include_usage: true } } : {}),
    ...(config.disableThinking ? { chat_template_kwargs: { enable_thinking: false } } : {}),
  };
}

async function post(config, body, fetchImpl, signal) {
  const controller = new AbortController();
  let timer = null;
  if (!signal) {
    timer = setTimeout(() => controller.abort(), config.timeoutMs);
  }
  const combinedSignal = signal
    ? AbortSignal.any([controller.signal, signal])
    : controller.signal;

  let response;
  try {
    response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        Accept: body.stream ? "text/event-stream" : "application/json",
      },
      body: JSON.stringify(body),
      signal: combinedSignal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error.name === "TimeoutError" || error.name === "AbortError" || controller.signal.aborted) {
      throw new AiProviderError("The AI service took too long to answer. Try again.", { status: 504 });
    }
    throw new AiProviderError("The AI service could not be reached.", { status: 502 });
  } finally {
    if (timer) clearTimeout(timer);
  }
  if (response.status === 429) {
    const retryAfter = Number.parseInt(response.headers.get("retry-after") || "", 10);
    throw new AiProviderError("The AI service's rate limit was reached. Try again shortly.", {
      status: 429,
      retryAfter: Number.isFinite(retryAfter) ? retryAfter : 20,
    });
  }
  if (response.status === 401 || response.status === 403) {
    throw new AiProviderError("The AI service rejected the API key (check NVIDIA_API_KEY).", { status: 502 });
  }
  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 200);
    throw new AiProviderError(`The AI service returned an error (${response.status}).${detail ? ` ${detail}` : ""}`, { status: 502 });
  }
  return response;
}

/** One-shot completion. Resolves to { text, usage }. */
export async function complete(config, messages, { maxTokens = config.maxTokens, fetchImpl = fetch } = {}) {
  const response = await post(config, requestBody(config, messages, { maxTokens, stream: false }), fetchImpl);
  const data = await response.json().catch(() => null);
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string") throw new AiProviderError("The AI service returned an empty answer.");
  return { text: stripThinking(text), usage: data.usage || null };
}

/**
 * Streaming completion: yields text chunks as they arrive (thinking text
 * removed), then returns { usage }.
 *
 * Uses an idle timeout (config.timeoutMs) rather than total timeout, and
 * aborts if caller signal aborts or hard limit (120s) expires.
 */
export async function* stream(config, messages, { maxTokens = config.maxTokens * 2, fetchImpl = fetch, signal } = {}) {
  const streamController = new AbortController();
  const combinedSignal = signal
    ? AbortSignal.any([signal, streamController.signal])
    : streamController.signal;

  let idleTimer = null;
  let hardTimer = null;
  let idleTimedOut = false;
  let receivedFirstByte = false;

  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      idleTimedOut = true;
      streamController.abort(new Error("idle_timeout"));
    }, config.timeoutMs);
  };

  const stopTimers = () => {
    if (idleTimer) clearTimeout(idleTimer);
    if (hardTimer) clearTimeout(hardTimer);
    idleTimer = null;
    hardTimer = null;
  };

  hardTimer = setTimeout(() => {
    idleTimedOut = true;
    streamController.abort(new Error("hard_timeout"));
  }, 120_000);

  const handleAbortOrError = (error) => {
    if (signal?.aborted) {
      throw new AiProviderError("The request was cancelled.", { status: 499, code: "cancelled" });
    }
    if (idleTimedOut || error?.name === "AbortError" || error?.name === "TimeoutError") {
      if (!receivedFirstByte) {
        throw new AiProviderError("The AI service is busy and didn't start answering. Try again.", { status: 504 });
      }
      throw new AiProviderError("The AI service stopped mid-answer.", { status: 504 });
    }
    if (error instanceof AiProviderError) {
      throw error;
    }
    throw new AiProviderError("The AI service could not be reached.", { status: 502 });
  };

  let response;
  try {
    resetIdleTimer();
    response = await post(
      config,
      requestBody(config, messages, { maxTokens, stream: true }),
      fetchImpl,
      combinedSignal
    );
  } catch (error) {
    stopTimers();
    handleAbortOrError(error);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let usage = null;
  let thinking = false;
  let pending = "";

  const emit = (chunk) => {
    // Hide <think>…</think> spans that arrive across chunk boundaries.
    pending += chunk;
    let out = "";
    for (;;) {
      if (thinking) {
        const end = pending.indexOf("</think>");
        if (end === -1) return out;
        pending = pending.slice(end + 8);
        thinking = false;
      } else {
        const start = pending.indexOf("<think>");
        if (start === -1) {
          // Keep a short tail in case "<think>" is split across chunks.
          const safe = Math.max(0, pending.length - 7);
          out += pending.slice(0, safe);
          pending = pending.slice(safe);
          return out;
        }
        out += pending.slice(0, start);
        pending = pending.slice(start + 7);
        thinking = true;
      }
    }
  };

  const readNext = () => {
    if (combinedSignal.aborted) {
      return Promise.reject(combinedSignal.reason || new Error("aborted"));
    }
    return new Promise((resolve, reject) => {
      const onAbort = () => {
        try {
          reader.cancel(combinedSignal.reason).catch(() => {});
        } catch {}
        reject(combinedSignal.reason || new Error("aborted"));
      };
      combinedSignal.addEventListener("abort", onAbort, { once: true });
      reader.read().then(
        (res) => {
          combinedSignal.removeEventListener("abort", onAbort);
          resolve(res);
        },
        (err) => {
          combinedSignal.removeEventListener("abort", onAbort);
          reject(err);
        }
      );
    });
  };

  try {
    for (;;) {
      resetIdleTimer();
      const { done, value } = await readNext();
      if (done) break;
      if (value && value.length > 0) {
        receivedFirstByte = true;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        let event;
        try {
          event = JSON.parse(data);
        } catch {
          continue;
        }
        if (event.usage) usage = event.usage;
        const delta = event.choices?.[0]?.delta?.content;
        if (delta) {
          const text = emit(delta);
          if (text) yield text;
        }
      }
    }
    if (!thinking && pending) yield pending;
    return { usage };
  } catch (error) {
    handleAbortOrError(error);
  } finally {
    stopTimers();
    try {
      reader.releaseLock?.();
    } catch {}
  }
}
