/**
 * AI writing assist: one request, start to finish.
 *
 *   config -> context check (no call when there is nothing to work from)
 *   -> answer cache -> daily cap -> per-minute limit -> provider -> validate
 *   -> usage log (no draft text)
 */
import connectDB from "@/lib/mongodb";
import { aiUsageModel } from "@/models/AiUsage";
import { aiConfig } from "./config.mjs";
import { buildPayload, inputLinks, inputText } from "./context.mjs";
import { FIELD_SPECS, isTarget, missingContext } from "./fields.mjs";
import { createAnswerCache, createMinuteLimiter } from "./limiter.mjs";
import { AiProviderError, complete, stream } from "./nim.mjs";
import { buildMessages } from "./prompt.mjs";
import { AiOutputError, parseAnswer } from "./validate.mjs";

export class AiError extends Error {
  constructor(message, status = 400, extra = {}) {
    super(message);
    this.status = status;
    Object.assign(this, extra);
  }
}

let limiter = null;
const cache = createAnswerCache();
const minuteLimiter = () => (limiter ||= createMinuteLimiter(aiConfig().ratePerMin));

/** Start of the current day in Dhaka (UTC+6, no DST), where the owner works. */
function dayStart(now = new Date()) {
  const offset = 6 * 3600_000;
  const local = new Date(now.getTime() + offset);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - offset);
}

async function usedToday() {
  if (!(await connectDB())) return 0;
  return aiUsageModel().countDocuments({ createdAt: { $gte: dayStart() } });
}

async function record(entry) {
  try {
    if (await connectDB()) await aiUsageModel().create(entry);
  } catch (error) {
    console.warn("[ai] usage not recorded:", error.message);
  }
}

export async function aiStatus() {
  const config = aiConfig();
  const used = config.enabled ? await usedToday() : 0;
  return {
    enabled: config.enabled,
    model: config.enabled ? config.model : null,
    remaining: {
      minute: config.enabled ? minuteLimiter().remaining() : 0,
      day: config.dailyLimit ? Math.max(0, config.dailyLimit - used) : null,
    },
  };
}

/**
 * Checks shared by short and streamed requests. Resolves to either an early
 * result (no provider call) or what the caller needs to call the provider.
 */
async function prepare(input) {
  const config = aiConfig();
  if (!config.enabled) throw new AiError("AI suggestions are not configured.", 503, { code: "not_configured" });
  if (!isTarget(input.target)) throw new AiError("Unknown field.", 422);

  const payload = buildPayload(input);
  const reason = missingContext(input.target, payload);
  if (reason) return { early: { status: "insufficient_context", reason, warnings: [] } };

  const cacheKey = cache.key(input.target, payload, config.model);
  const cached = cache.get(cacheKey);
  if (cached) return { early: { ...cached, cached: true } };

  if (config.dailyLimit) {
    const used = await usedToday();
    if (used >= config.dailyLimit) {
      const retryAfter = Math.ceil((dayStart().getTime() + 86_400_000 - Date.now()) / 1000);
      throw new AiError(`Today's AI limit (${config.dailyLimit}) is used up.`, 429, { retryAfter, code: "daily_limit" });
    }
  }
  const slot = minuteLimiter().take();
  if (!slot.ok) {
    throw new AiError("Too many AI requests this minute.", 429, { retryAfter: slot.retryAfter, code: "minute_limit" });
  }

  return {
    config,
    payload,
    cacheKey,
    messages: buildMessages({ target: input.target, payload, rules: config.rules }),
    guards: { inputText: inputText(payload), inputLinks: inputLinks(input.fields?.contentJson) },
  };
}

function providerError(error) {
  if (error instanceof AiProviderError) {
    return new AiError(error.message, error.status === 429 ? 429 : 502, { retryAfter: error.retryAfter, code: "provider" });
  }
  return error;
}

/** Short fields (title, excerpt, meta, slug, tags, alt text). */
export async function generateField(input) {
  if (FIELD_SPECS[input.target]?.kind === "markdown") throw new AiError("Use the streaming endpoint for body actions.", 422);
  const prep = await prepare(input);
  if (prep.early) return prep.early;

  const started = Date.now();
  const base = { target: input.target, model: prep.config.model };
  let answer;
  try {
    answer = await complete(prep.config, prep.messages);
  } catch (error) {
    await record({ ...base, status: "provider_error", ms: Date.now() - started });
    throw providerError(error);
  }
  const usage = { promptTokens: answer.usage?.prompt_tokens, completionTokens: answer.usage?.completion_tokens, ms: Date.now() - started };
  try {
    const result = parseAnswer(input.target, answer.text, prep.guards);
    await record({ ...base, ...usage, status: result.status });
    if (result.status === "ok") cache.set(prep.cacheKey, result);
    return result;
  } catch (error) {
    await record({ ...base, ...usage, status: "invalid_output" });
    if (error instanceof AiOutputError) throw new AiError(error.message, 502, { code: "invalid_output" });
    throw error;
  }
}

/**
 * Body actions. Resolves to { early } or { chunks, finish }: iterate chunks
 * to stream Markdown, then await finish(fullText) for the validated result.
 */
export async function startBodyStream(input) {
  if (FIELD_SPECS[input.target]?.kind !== "markdown") throw new AiError("Not a body action.", 422);
  const prep = await prepare(input);
  if (prep.early) return { early: prep.early };

  const started = Date.now();
  const base = { target: input.target, model: prep.config.model };
  const iterator = stream(prep.config, prep.messages);

  async function* chunks() {
    try {
      for (;;) {
        const { value, done } = await iterator.next();
        if (done) {
          chunks.usage = value?.usage || null;
          return;
        }
        yield value;
      }
    } catch (error) {
      await record({ ...base, status: "provider_error", ms: Date.now() - started });
      throw providerError(error);
    }
  }

  async function finish(fullText) {
    const usage = { promptTokens: chunks.usage?.prompt_tokens, completionTokens: chunks.usage?.completion_tokens, ms: Date.now() - started };
    try {
      const result = parseAnswer(input.target, fullText, prep.guards);
      await record({ ...base, ...usage, status: result.status });
      if (result.status === "ok") cache.set(prep.cacheKey, result);
      return result;
    } catch (error) {
      await record({ ...base, ...usage, status: "invalid_output" });
      if (error instanceof AiOutputError) throw new AiError(error.message, 502, { code: "invalid_output" });
      throw error;
    }
  }

  return { chunks: chunks(), finish };
}

/** Tests only. */
export function resetAiState() {
  limiter = null;
  cache.clear();
}
