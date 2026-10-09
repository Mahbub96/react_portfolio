/**
 * Turns a raw model answer into a value that is safe to suggest.
 *
 * - Tolerant parsing: the JSON object is extracted even if the model wraps
 *   it in prose or a code fence.
 * - Form: lengths, slug rules and tag limits from FIELD_SPECS are enforced.
 * - Truth guards: links that are not in the owner's input are removed, and
 *   numbers that are not in the input are reported for checking. The model
 *   cannot verify facts; these make invented ones visible.
 * Answers that cannot be repaired are rejected, never inserted.
 */
import { FIELD_SPECS } from "./fields.mjs";
import { INSUFFICIENT_MARKER } from "./prompt.mjs";
import { slugify } from "../seo/slug.mjs";

export class AiOutputError extends Error {}

const URL_RE = /\bhttps?:\/\/[^\s<>()"'\]]+/gi;
// Numbers worth checking: anything with 2+ digits, a decimal, or a percent.
const NUMBER_RE = /(?<![\w.])\d+(?:[.,]\d+)*\s?%?|\b\d\b(?=\s?%)/g;

function extractJson(text) {
  const trimmed = String(text).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        // fall through
      }
    }
  }
  return null;
}

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.-]+$/, "")}…`;
}

const normalizeUrl = (url) => url.replace(/[.,;:!?]+$/, "").replace(/\/+$/, "").toLowerCase();

/** Remove links that the owner did not supply. */
export function guardUrls(text, allowedText, allowedLinks = []) {
  const allowed = new Set([...(allowedText.match(URL_RE) || []), ...allowedLinks].map(normalizeUrl));
  const removed = [];
  const out = text.replace(URL_RE, (url) => {
    if (allowed.has(normalizeUrl(url))) return url;
    removed.push(url.replace(/[.,;:!?]+$/, ""));
    return "";
  });
  return {
    text: out.replace(/\[([^\]]*)\]\(\s*\)/g, "$1").replace(/\(\s*\)/g, "").replace(/[ \t]{2,}/g, " ").trim(),
    removed,
  };
}

/** Numbers in the answer that do not appear in the owner's input. */
export function unverifiedNumbers(text, inputText) {
  const known = new Set((inputText.match(NUMBER_RE) || []).map((n) => n.replace(/\s/g, "")));
  const found = new Set();
  for (const raw of text.match(NUMBER_RE) || []) {
    const n = raw.replace(/\s/g, "");
    if (!known.has(n) && (n.length >= 2 || n.endsWith("%"))) found.add(n);
  }
  return [...found];
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .trim();
}

/**
 * @returns {{ status: "ok", value: any, warnings: string[] } | { status: "insufficient_context", reason: string }}
 */
export function parseAnswer(target, rawText, { inputText = "", inputLinks = [] } = {}) {
  const spec = FIELD_SPECS[target];
  const warnings = [];

  if (spec.kind === "markdown") {
    const text = String(rawText || "").trim().replace(/^```(?:markdown|md)?\s*\n/i, "").replace(/\n```\s*$/, "").trim();
    if (text.startsWith(INSUFFICIENT_MARKER)) {
      return { status: "insufficient_context", reason: text.slice(INSUFFICIENT_MARKER.length).trim() || "Not enough to work from." };
    }
    if (!text) throw new AiOutputError("The AI returned an empty answer.");
    const guarded = guardUrls(text.replace(/!\[[^\]]*\]\([^)]*\)/g, ""), inputText, inputLinks);
    if (guarded.removed.length) warnings.push(`Removed links that were not in your post: ${guarded.removed.join(", ")}`);
    const numbers = unverifiedNumbers(guarded.text, inputText);
    if (numbers.length) warnings.push(`Check these numbers; they are not in your notes: ${numbers.join(", ")}`);
    return { status: "ok", value: guarded.text.slice(0, 20000), warnings };
  }

  const data = extractJson(rawText);
  if (!data || typeof data !== "object") throw new AiOutputError("The AI answer was not in the expected format. Try again.");
  if (data.status === "insufficient_context") {
    return { status: "insufficient_context", reason: cleanText(data.reason).slice(0, 200) || "Not enough to work from." };
  }
  if (data.value === undefined || data.value === null) throw new AiOutputError("The AI answer was empty. Try again.");

  let value;
  if (spec.kind === "tags") {
    const list = Array.isArray(data.value) ? data.value : String(data.value).split(",");
    const seen = new Set();
    value = list
      .map((tag) => cleanText(tag).replace(/^#/, "").slice(0, spec.maxItem))
      .filter((tag) => tag && !seen.has(tag.toLowerCase()) && seen.add(tag.toLowerCase()))
      .slice(0, spec.maxItems);
    if (!value.length) throw new AiOutputError("The AI returned no usable tags. Try again.");
  } else if (spec.kind === "slug") {
    value = slugify(cleanText(data.value));
    if (value.length > spec.max) value = value.slice(0, spec.max).replace(/-[^-]*$/, "");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new AiOutputError("The AI returned an unusable URL slug. Try again.");
  } else {
    const guarded = guardUrls(cleanText(data.value), inputText, inputLinks);
    if (guarded.removed.length) warnings.push(`Removed links that were not in your post: ${guarded.removed.join(", ")}`);
    value = truncate(guarded.text, spec.max);
    if (!value) throw new AiOutputError("The AI answer was empty. Try again.");
    if (spec.min && value.length < spec.min) warnings.push(`Only ${value.length} characters; ${spec.min}+ works better here.`);
  }

  const numbers = unverifiedNumbers(Array.isArray(value) ? value.join(" ") : value, inputText);
  if (numbers.length) warnings.push(`Check these numbers; they are not in your post: ${numbers.join(", ")}`);
  return { status: "ok", value, warnings };
}
