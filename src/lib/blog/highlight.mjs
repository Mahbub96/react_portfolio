/**
 * Server-side syntax highlighting for code blocks. Runs once when a post is
 * published, so readers download no highlighting JavaScript; the colours
 * come from the --syntax-* theme tokens (see prose styles).
 */
import { common, createLowlight } from "lowlight";
import { toHtml } from "hast-util-to-html";

const lowlight = createLowlight(common);

export { CODE_LANGUAGES } from "./codeLanguages.mjs";

const ALIASES = { js: "javascript", ts: "typescript", py: "python", sh: "bash", shell: "bash", html: "xml", yml: "yaml", md: "markdown", text: "plaintext" };

export function normalizeLanguage(language) {
  const id = String(language || "").toLowerCase().trim();
  const resolved = ALIASES[id] || id;
  return resolved && lowlight.registered(resolved) ? resolved : "plaintext";
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Highlighted, escaped HTML for `code` (escaped plain text for plaintext). */
export function highlightCode(code, language) {
  const lang = normalizeLanguage(language);
  if (lang === "plaintext") return escapeHtml(code);
  return toHtml(lowlight.highlight(lang, code));
}
