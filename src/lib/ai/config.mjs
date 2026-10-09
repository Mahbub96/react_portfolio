/**
 * AI writing-assist settings, read from the environment once per process.
 *
 * Everything here is server-only: the API key never reaches the browser.
 * Changing the model (or provider) is an env edit plus a restart:
 *   NIM_MODEL, NVIDIA_API_KEY, NIM_BASE_URL (any OpenAI-compatible API).
 *
 * The shared prompt rules come from a plain text file (AI_RULES_FILE), not
 * an env value: .env.runtime is sourced by bash on the server, where
 * backticks or $(…) inside a value would execute and "$" gets mangled.
 */
import { readFileSync } from "node:fs";

export const DEFAULT_MODEL = "nvidia/nemotron-3.5-lightning-30b-a3b";
export const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";
const MAX_RULES_BYTES = 4096;

/** Used when AI_RULES_FILE is not set or cannot be read. */
export const DEFAULT_RULES = [
  "Use only facts present in the provided fields. Do not guess.",
  "Never invent numbers, dates, results, names, quotes or sources.",
  "Only cite links that appear in the provided content.",
  "Report insufficient_context only when the fields name no subject at all; a title is enough for short fields such as tags, excerpt and meta description.",
  "Neutral, professional tone. Write in English unless the content is in Bangla.",
].join("\n");

function intSetting(env, name, fallback, min, max, warn) {
  const raw = env[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < min || value > max || String(value) !== String(raw).trim()) {
    warn(`${name}="${raw}" is invalid (expected ${min}-${max}); using ${fallback}`);
    return fallback;
  }
  return value;
}

function baseUrlSetting(env, warn) {
  const raw = (env.NIM_BASE_URL || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
  try {
    const url = new URL(raw);
    const local = ["localhost", "127.0.0.1"].includes(url.hostname);
    if (url.protocol === "https:" || (local && url.protocol === "http:")) return raw;
  } catch {
    // fall through
  }
  warn(`NIM_BASE_URL="${raw}" must be an https URL; using ${DEFAULT_BASE_URL}`);
  return DEFAULT_BASE_URL;
}

function rulesSetting(env, warn, readFile) {
  const path = (env.AI_RULES_FILE || "").trim();
  if (!path) return { rules: DEFAULT_RULES, rulesSource: "default" };
  try {
    let text = readFile(path, "utf8").replace(/\r\n/g, "\n").trim();
    if (Buffer.byteLength(text) > MAX_RULES_BYTES) {
      warn(`AI_RULES_FILE is larger than ${MAX_RULES_BYTES} bytes; extra text is ignored`);
      text = Buffer.from(text).subarray(0, MAX_RULES_BYTES).toString("utf8").replace(/�+$/, "");
    }
    if (!text) throw new Error("file is empty");
    return { rules: text, rulesSource: path };
  } catch (error) {
    warn(`AI_RULES_FILE "${path}" could not be read (${error.message}); using the built-in rules`);
    return { rules: DEFAULT_RULES, rulesSource: "default" };
  }
}

/**
 * @param {object} env process.env (injectable for tests)
 * @param {{ warn?: Function, readFile?: Function }} io
 */
export function loadAiConfig(env = process.env, { warn = (m) => console.warn(`[ai] ${m}`), readFile = readFileSync } = {}) {
  const apiKey = (env.NVIDIA_API_KEY || "").trim();
  const { rules, rulesSource } = rulesSetting(env, warn, readFile);
  return {
    enabled: Boolean(apiKey),
    apiKey,
    model: (env.NIM_MODEL || "").trim() || DEFAULT_MODEL,
    baseUrl: baseUrlSetting(env, warn),
    ratePerMin: intSetting(env, "AI_RATE_PER_MIN", 30, 1, 1000, warn),
    dailyLimit: intSetting(env, "AI_DAILY_LIMIT", 300, 0, 1_000_000, warn),
    maxTokens: intSetting(env, "AI_MAX_TOKENS", 600, 50, 8000, warn),
    timeoutMs: intSetting(env, "AI_TIMEOUT_MS", 25000, 2000, 120000, warn),
    // Reasoning models (e.g. Nemotron) answer faster and cleaner with
    // thinking off; set AI_DISABLE_THINKING=0 for models that reject the flag.
    disableThinking: (env.AI_DISABLE_THINKING ?? "1").trim() !== "0",
    rules,
    rulesSource,
  };
}

let cached = null;

/** Process-wide settings (read once; restart to apply env changes). */
export function aiConfig() {
  if (!cached) cached = loadAiConfig();
  return cached;
}

/** Tests only. */
export function resetAiConfig() {
  cached = null;
}
