/**
 * AI-assisted translation for blog posts (English -> Bengali/Bangla).
 *
 * Preserves:
 * - HTML structure, classes, and attribute values
 * - Code blocks (<pre><code>) and inline code (<code>)
 * - Heading IDs (<h2 id="...">, <h3 id="...">) for TOC linking
 * - Links and media URLs
 * - Zero em dashes (—) or en dashes (–)
 */
import { aiConfig } from "../ai/config.mjs";
import { complete, AiProviderError } from "../ai/nim.mjs";

export class TranslationError extends Error {
  constructor(message, status = 500, extra = {}) {
    super(message);
    this.name = "TranslationError";
    this.status = status;
    Object.assign(this, extra);
  }
}

/** Extract headings from HTML as a fallback or validator for TOC */
export function extractHeadingsFromHtml(html) {
  if (!html || typeof html !== "string") return [];
  const regex = /<h([2-4])(?:\s+[^>]*id=["']([^"']+)["'][^>]*)?>([\s\S]*?)<\/h\1>/gi;
  const headings = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const id = match[2] || "";
    // Strip inner tags for plain heading text
    const text = match[3].replace(/<[^>]+>/g, "").trim();
    if (text) {
      headings.push({ id, text, level });
    }
  }
  return headings;
}

/** Clean up model output to parse JSON safely */
function extractJson(text) {
  if (!text) return null;
  let clean = text.trim();
  // Strip markdown code fences if wrapped in ```json ... ```
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  try {
    return JSON.parse(clean);
  } catch {
    // Try to find the outermost { ... }
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(clean.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Strict sanitizer for AI-translated HTML to prevent stored XSS, script injection,
 * malicious iframe/embeds, and inline event handlers.
 */
export function sanitizeTranslatedHtml(html) {
  if (!html || typeof html !== "string") return "";

  let clean = html
    // 1. Strip executable / dangerous tags and their content
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

  // 2. Strip all inline event handlers (on*)
  clean = clean.replace(/\s+on[a-z0-9_-]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

  // 3. Neutralize dangerous URL schemes in href or src (javascript:, vbscript:, data:)
  clean = clean.replace(/\s+(href|src)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, ' $1="#"');
  clean = clean.replace(/\s+(href|src)\s*=\s*(?:'vbscript:[^']*'|"vbscript:[^"]*"|vbscript:[^\s>]+)/gi, ' $1="#"');
  clean = clean.replace(/\s+(href|src)\s*=\s*(?:'data:[^']*'|"data:[^"]*"|data:[^\s>]+)/gi, ' $1="#"');

  // 4. Sanitize all id attributes to prevent DOM clobbering or attribute injection
  clean = clean.replace(/\bid=["']([^"']*)["']/gi, (m, id) => {
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "");
    return `id="${safeId}"`;
  });

  // 5. Clean em/en dashes
  clean = clean.replace(/[—–]/g, ", ").replace(/\s{2,}/g, " ");

  return clean.trim();
}

/** Plain text cleaner: removes all HTML tags and forbidden dashes */
export function sanitizePlainText(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/[—–]/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();
}



/**
 * Translates a blog post's title, excerpt, HTML content, and TOC into Bengali.
 *
 * @param {object} post - The post object containing title, excerpt, html, toc
 * @param {string} targetLang - Target language code (currently "bn")
 * @returns {Promise<{ title: string, excerpt: string, html: string, toc: Array }>}
 */
export async function translatePostToBangla(post, targetLang = "bn", options = {}) {
  if (targetLang !== "bn") {
    throw new TranslationError(`Unsupported target language: ${targetLang}`, 400);
  }

  const title = post?.title || "";
  const excerpt = post?.excerpt || "";
  const html = post?.html || "";
  const originalToc = Array.isArray(post?.toc) ? post.toc : [];

  if (!html && !title) {
    throw new TranslationError("Post has no content to translate.", 400);
  }

  const config = aiConfig();
  if (!config.enabled) {
    throw new TranslationError("AI translation service is not configured (missing API key).", 503, {
      code: "not_configured",
    });
  }

  const systemPrompt = [
    "You are an expert bilingual technical editor and translator specializing in translating English articles into natural, fluent, and authentic Bengali (বাংলা).",
    "",
    "Rules for translation:",
    "1. Language Style: Write in modern, natural standard Bengali (প্রমিত চলিত বাংলা). The tone must sound like an experienced engineer or writer explaining practical ideas to peers.",
    "2. CRITICAL PRESERVATION & TRANSLATION: Keep all HTML tags and their attributes (like id, class, href, src, role) 100% intact. Translate all readable text inside <p>, <h2>, <h3>, <h4>, <li>, <blockquote>, <td>, <th>, and image alt attributes into natural Bengali. Do NOT leave paragraphs or headings in English.",
    "3. CODE PRESERVATION: Do NOT translate code inside <pre><code>...</code></pre> blocks or inline <code>...</code> tags. Keep code, function names, and technical syntax in English.",
    "4. TECHNICAL TERMS: Widely accepted terms in tech (e.g., 'API', 'JavaScript', 'React', 'Docker', 'Database', 'Node.js', 'Frontend', 'Backend', 'Bug', 'Server') should remain in English or natural Bengali transliteration.",
    "5. PUNCTUATION: Never use em dashes (—) or en dashes (–). Use commas, periods, colons, or parentheses instead.",
    "6. HEADING IDs: Preserve all existing heading id attributes (e.g. <h2 id=\"section-name\">) exactly as they are so table of contents navigation continues to work.",
    "7. OUTPUT FORMAT: Return ONLY a valid JSON object with no markdown fences, no conversational text before or after.",
    "",
    "Expected JSON format:",
    JSON.stringify({
      title: "বাংলায় অনুবাদ করা শিরোনাম",
      excerpt: "বাংলায় অনুবাদ করা সারাংশ",
      html: "<p>বাংলায় অনুবাদ করা অনুচ্ছেদ...</p>",
      toc: originalToc.map((t) => ({ id: t.id, text: "বাংলায় অনুবাদের শিরোনাম", level: t.level })),
    }),
  ].join("\n");

  const userContent = JSON.stringify({
    title,
    excerpt,
    html,
    toc: originalToc,
  });

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Translate the following blog post to Bengali (Bangla):\n\n${userContent}` },
  ];

  try {
    const maxTokens = Math.min(Math.max(config.maxTokens * 4, 4000), 8000);
    const translationModel =
      options.model ||
      (process.env.NIM_TRANSLATION_MODEL || "").trim() ||
      "meta/llama-3.1-8b-instruct";
    const timeoutMs = options.timeoutMs ?? 120000;
    const translationConfig = {
      ...config,
      model: translationModel,
      disableThinking: false,
      timeoutMs: Math.max(config.timeoutMs, timeoutMs),
    };
    const result = await complete(translationConfig, messages, { maxTokens });
    const parsed = extractJson(result.text);

    if (!parsed || !parsed.html) {
      throw new TranslationError("Failed to parse translated content from AI provider.", 502, {
        code: "invalid_output",
      });
    }

    // Extract headings from translated HTML to ensure TOC matches exactly
    const derivedToc = extractHeadingsFromHtml(parsed.html);
    const finalToc =
      Array.isArray(parsed.toc) && parsed.toc.length >= originalToc.length
        ? parsed.toc
        : derivedToc.length > 0
        ? derivedToc
        : originalToc;

    const cleanHtml = sanitizeTranslatedHtml(parsed.html) || html;
    const cleanTitle = sanitizePlainText(parsed.title) || title;
    const cleanExcerpt = sanitizePlainText(parsed.excerpt) || excerpt;

    return {
      title: cleanTitle,
      excerpt: cleanExcerpt,
      html: cleanHtml,
      toc: finalToc.map((item) => ({
        id: String(item.id || "").replace(/[^a-zA-Z0-9_-]/g, ""),
        text: sanitizePlainText(item.text),
        level: item.level || 2,
      })),
      plainText: cleanHtml.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim(),
    };
  } catch (error) {
    if (error instanceof TranslationError) throw error;
    if (error instanceof AiProviderError) {
      throw new TranslationError(error.message, error.status, { retryAfter: error.retryAfter });
    }
    throw new TranslationError(
      `Translation failed: ${error.message || "Unknown error"}`,
      500
    );
  }
}
