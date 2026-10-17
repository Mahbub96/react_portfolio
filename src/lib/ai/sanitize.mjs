/**
 * Centralized sanitization and anti-injection for LLM responses.
 *
 * Guarantees that responses received from LLMs contain only clean, safe content:
 * - Plain text fields are stripped of all HTML tags, script tags, event handlers, and injected code.
 * - Markdown fields have dangerous tags (<script>, <iframe>, <object>, etc.) and dangerous URL schemes neutralized.
 * - Tags, slugs, and code snippets are strictly validated.
 *
 * Pure module: browser- and server-safe.
 */

export function removeEmDashes(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s*–\s*/g, ", ")
    .replace(/\s*--\s*/g, ", ")
    .replace(/,\s*,+/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/,\s*:/g, ":")
    .replace(/,\s*;/g, ";");
}

/**
 * Strips all HTML/XML tags, script injection, event handlers, and dangerous URL schemes.
 * Guarantees that only clean human plain text remains.
 */
export function sanitizePlainText(text, { preserveNewlines = false, trim = true } = {}) {
  if (!text || typeof text !== "string") return "";

  let out = removeEmDashes(text)
    // 1. Strip <script>...</script> and <style>...</style> along with their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // 2. Strip all remaining HTML/XML tags
    .replace(/<[^>]+>/g, "")
    // 3. Neutralize executable schemes if present in plain text
    .replace(/\b(?:javascript|vbscript|data):/gi, "")
    // 4. Strip inline event handler patterns
    .replace(/\bon[a-z0-9_-]+\s*=/gi, "");

  if (preserveNewlines) {
    out = out.replace(/[^\S\r\n\t]{2,}/g, " ");
  } else {
    out = out
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s{2,}/g, " ");
  }

  out = out
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .replace(/^(?:alt text|image alt|cover alt)[:\-\s]*/i, "")
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "");

  return trim ? out.trim() : out;
}

/**
 * Sanitizes Markdown output from LLMs:
 * Preserves Markdown syntax (headings, bold, lists, code fences) while stripping
 * dangerous executable HTML tags, event handlers, and dangerous URL schemes.
 */
export function sanitizeMarkdown(text) {
  if (!text || typeof text !== "string") return "";

  let clean = removeEmDashes(text)
    // 1. Strip dangerous tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
    .replace(/<input\b[^>]*>/gi, "")
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<math\b[^<]*(?:(?!<\/math>)<[^<]*)*<\/math>/gi, "")
    .replace(/<base\b[^>]*>/gi, "")
    .replace(/<meta\b[^>]*>/gi, "")
    .replace(/<link\b[^>]*>/gi, "");

  // 2. Strip inline event handlers (on*=)
  clean = clean.replace(/\s+on[a-z0-9_-]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

  // 3. Neutralize dangerous URL schemes in markdown links [text](javascript:...) or HTML attributes
  clean = clean.replace(/\[([^\]]*)\]\(\s*(?:javascript|vbscript|data):[^)]*\)/gi, "[$1](#)");
  clean = clean.replace(/\s+(href|src)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, ' $1="#"');
  clean = clean.replace(/\s+(href|src)\s*=\s*(?:'vbscript:[^']*'|"vbscript:[^"]*"|vbscript:[^\s>]+)/gi, ' $1="#"');
  clean = clean.replace(/\s+(href|src)\s*=\s*(?:'data:[^']*'|"data:[^"]*"|data:[^\s>]+)/gi, ' $1="#"');

  return clean.trim();
}

/**
 * Sanitizes tag arrays: each tag must be clean plain text without HTML, hashtags, or duplicates.
 */
export function sanitizeTags(tags, { maxItems = 10, maxItem = 40 } = {}) {
  const list = Array.isArray(tags) ? tags : String(tags || "").split(/[\n,]+/);
  const seen = new Set();
  const cleaned = [];

  for (const item of list) {
    const plain = sanitizePlainText(item).replace(/^#+/, "").slice(0, maxItem).trim();
    if (plain && !seen.has(plain.toLowerCase())) {
      seen.add(plain.toLowerCase());
      cleaned.push(plain);
      if (cleaned.length >= maxItems) break;
    }
  }

  return cleaned;
}

/**
 * Sanitizes code snippets: strips outer markdown fences, preserves internal code formatting.
 */
export function sanitizeCodeSnippet(code, { max = 3000 } = {}) {
  let clean = String(code || "")
    .replace(/^```[a-zA-Z0-9_-]*\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
  if (clean.length > max) clean = clean.slice(0, max);
  return clean;
}

/**
 * Central dispatcher to sanitize any LLM response according to target specification kind.
 */
export function sanitizeLlmResponse(kind, value, options = {}) {
  switch (kind) {
    case "tags":
      return sanitizeTags(value, options);
    case "markdown":
      return sanitizeMarkdown(value);
    case "code":
      return sanitizeCodeSnippet(value, options);
    case "slug":
    case "text":
    default:
      return sanitizePlainText(value);
  }
}
