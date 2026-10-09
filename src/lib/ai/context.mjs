/**
 * The context sent with every AI request: every field of the post, labelled
 * by name, so the model knows what it is filling and from what.
 *
 * The body is reduced to plain text with the same allow-list renderer the
 * public page uses (no HTML ever reaches the model), headings listed first,
 * and capped so long posts don't cost a fortune in tokens.
 */
import { renderDoc } from "../blog/renderDoc.mjs";

export const BODY_CHAR_LIMIT = 6000;
export const SELECTION_CHAR_LIMIT = 4000;
export const NEARBY_CHAR_LIMIT = 1500;

const clean = (value, max = 1000) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function cap(text, max) {
  const value = String(text || "").trim();
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(". ") + 1, max - 200))}\n[…truncated]`;
}

/**
 * @param {object} input validated request body:
 *   { fields: { title, excerpt, slug, tags, metaTitle, metaDescription,
 *               coverAlt, coverCaption, contentJson }, selection, nearbyText,
 *     image: { caption, nearbyText } }
 */
export function buildPayload(input) {
  const fields = input.fields || {};
  const rendered = fields.contentJson ? renderDoc(fields.contentJson) : null;

  const payload = {
    post: {
      title: clean(fields.title, 200),
      excerpt: clean(fields.excerpt, 300),
      slug: clean(fields.slug, 80),
      tags: (Array.isArray(fields.tags) ? fields.tags : []).map((t) => clean(t, 40)).filter(Boolean).slice(0, 10),
      metaTitle: clean(fields.metaTitle, 140),
      metaDescription: clean(fields.metaDescription, 320),
      cover: { alt: clean(fields.coverAlt, 300), caption: clean(fields.coverCaption, 500) },
    },
    headings: rendered ? rendered.headings.map((h) => `${"#".repeat(h.level)} ${clean(h.text, 160)}`) : [],
    body: rendered ? cap(rendered.plainText, BODY_CHAR_LIMIT) : "",
  };
  if (input.selection) payload.selection = cap(input.selection, SELECTION_CHAR_LIMIT);
  if (input.nearbyText) payload.nearbyText = cap(input.nearbyText, NEARBY_CHAR_LIMIT);
  if (input.image) {
    payload.image = { caption: clean(input.image.caption, 500), nearbyText: cap(input.image.nearbyText, NEARBY_CHAR_LIMIT) };
  }
  return payload;
}

/** All text the owner supplied, for the URL and number guards. */
export function inputText(payload) {
  const parts = [];
  const walk = (value) => {
    if (typeof value === "string") parts.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(payload);
  return parts.join("\n");
}

/** Links present in the post's content (rendered hrefs are not in plain text). */
export function inputLinks(contentJson) {
  const links = new Set();
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    for (const mark of node.marks || []) if (mark?.type === "link" && mark.attrs?.href) links.add(String(mark.attrs.href));
    (node.content || []).forEach(walk);
  };
  walk(contentJson);
  return [...links];
}
