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
  if (!text) return null;
  const str = String(text).trim();

  // 1. Direct parse
  try {
    return JSON.parse(str);
  } catch {}

  // 2. Look for json code fences anywhere in the string
  const fence = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {}
  }

  const trimmed = str.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {}

  // 3. Outermost { ... }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    const candidate = trimmed.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // 4. Try lenient fixes: trailing commas, unescaped literal newlines
      try {
        const fixed = candidate
          .replace(/,\s*([}\]])/g, "$1")
          .replace(/\n(?=(?:(?:[^"]*"){2})*[^"]*"[^"]*$)/g, "\\n");
        return JSON.parse(fixed);
      } catch {}
    }
  }

  // 5. Outermost [ ... ] for array values (e.g. tags)
  const arrStart = trimmed.indexOf("[");
  const arrEnd = trimmed.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd > arrStart) {
    try {
      const arr = JSON.parse(trimmed.slice(arrStart, arrEnd + 1));
      return { status: "ok", value: arr };
    } catch {}
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

export function removeEmDashes(text) {
  if (!text || typeof text !== "string") return text;
  return text
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s*–\s*/g, ", ")
    .replace(/\s*--\s*/g, ", ")
    .replace(/,\s*,+/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/,\s*:/g, ":")
    .replace(/,\s*;/g, ";");
}

function cleanText(value) {
  return removeEmDashes(String(value ?? ""))
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .replace(/^(?:alt text|image alt|cover alt)[:\-\s]*/i, "")
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
    let text = String(rawText || "").trim().replace(/^```(?:markdown|md)?\s*\n/i, "").replace(/\n```\s*$/, "").trim();
    if (text.startsWith(INSUFFICIENT_MARKER)) {
      return { status: "insufficient_context", reason: text.slice(INSUFFICIENT_MARKER.length).trim() || "Not enough to work from." };
    }
    if (!text) throw new AiOutputError("The AI returned an empty answer.");
    text = removeEmDashes(text);
    const guarded = guardUrls(text.replace(/!\[[^\]]*\]\([^)]*\)/g, ""), inputText, inputLinks);
    if (guarded.removed.length) warnings.push(`Removed links that were not in your post: ${guarded.removed.join(", ")}`);
    const numbers = unverifiedNumbers(guarded.text, inputText);
    if (numbers.length) warnings.push(`Check these numbers; they are not in your notes: ${numbers.join(", ")}`);
    return { status: "ok", value: guarded.text.slice(0, 20000), warnings };
  }

  const data = extractJson(rawText);
  let value;

  if (data && typeof data === "object") {
    if (data.status === "insufficient_context" || data.status === "error" || (!data.value && (data.reason || data.message || data.error))) {
      const reason = cleanText(data.reason || data.message || data.error || "").slice(0, 200);
      return { status: "insufficient_context", reason: reason || "Not enough context to generate this field." };
    }
    // Check value or alternative keys the model might have returned
    value = data.value !== undefined ? data.value : (
      data[target] !== undefined ? data[target] : (
        data.result !== undefined ? data.result : (
          data.suggestion !== undefined ? data.suggestion : (
            data.text !== undefined ? data.text : (
              data.output !== undefined ? data.output : undefined
            )
          )
        )
      )
    );
  }

  // If no JSON was extracted or value was not found in JSON, fall back to plain text
  if (value === undefined || value === null) {
    if (spec.kind === "code") {
      const fenceMatch = String(rawText || "").match(/```[a-zA-Z0-9_-]*\s*([\s\S]*?)\s*```/i);
      if (fenceMatch) {
        value = fenceMatch[1].trim();
      }
    }

    if (value === undefined || value === null) {
      const rawClean = String(rawText || "")
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/<\/?(?:fields|context|output|response|result|answer|value)>/gi, "")
        .replace(/^```(?:json|markdown|text)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      // Check if the raw text is an obvious refusal or error
      if (
        /^I (?:cannot|can't|am unable to|do not have|must decline)/i.test(rawClean) ||
        /^Sorry,?(?: I)?/i.test(rawClean)
      ) {
        throw new AiOutputError("The AI answer was not in the expected format. Try again.");
      }

      // Strip leading conversational phrases like "Here is a suggested title:"
      const stripped = rawClean
        .replace(/^(?:here(?:'s| is) (?:a |the )?(?:suggested |recommended )?(?:title|excerpt|meta title|meta description|slug|tag|tags|description|answer|alt text|cover alt|code|code snippet)?[:\-\s]*)/i, "")
        .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
        .trim();

      if (stripped) {
        if (spec.kind === "tags") {
          value = stripped.split(/[\n,]+/).map((t) => t.replace(/^[-*•\d.)\s]+/, "").trim()).filter(Boolean);
        } else {
          value = stripped;
        }
      }
    }
  }

  if (value === undefined || value === null || (typeof value === "string" && !value.trim())) {
    throw new AiOutputError("The AI answer was not in the expected format. Try again.");
  }

  const extractedValue = value;
  if (spec.kind === "tags") {
    const list = Array.isArray(extractedValue) ? extractedValue : String(extractedValue).split(",");
    const seen = new Set();
    value = list
      .map((tag) => cleanText(tag).replace(/^#/, "").slice(0, spec.maxItem))
      .filter((tag) => tag && !seen.has(tag.toLowerCase()) && seen.add(tag.toLowerCase()))
      .slice(0, spec.maxItems);
    if (!value.length) throw new AiOutputError("The AI returned no usable tags. Try again.");
  } else if (spec.kind === "slug") {
    value = slugify(cleanText(extractedValue));
    if (value.length > spec.max) value = value.slice(0, spec.max).replace(/-[^-]*$/, "");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new AiOutputError("The AI returned an unusable URL slug. Try again.");
  } else if (spec.kind === "code") {
    let codeStr = String(extractedValue || "")
      .replace(/^```[a-zA-Z0-9_-]*\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();
    if (!codeStr) throw new AiOutputError("The AI returned an empty code snippet. Try again.");
    if (codeStr.length > spec.max) codeStr = codeStr.slice(0, spec.max);
    value = codeStr;
  } else {
    const guarded = guardUrls(cleanText(extractedValue), inputText, inputLinks);
    if (guarded.removed.length) warnings.push(`Removed links that were not in your post: ${guarded.removed.join(", ")}`);
    value = truncate(guarded.text, spec.max);
    if (!value) throw new AiOutputError("The AI answer was empty. Try again.");
    if (spec.min && value.length < spec.min) warnings.push(`Only ${value.length} characters; ${spec.min}+ works better here.`);
  }

  const numbers = unverifiedNumbers(Array.isArray(value) ? value.join(" ") : value, inputText);
  if (numbers.length) warnings.push(`Check these numbers; they are not in your post: ${numbers.join(", ")}`);
  return { status: "ok", value, warnings };
}
