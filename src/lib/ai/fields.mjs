/**
 * What each AI target produces and what context it needs.
 *
 * The shared rules (AI_RULES_FILE) decide what is true; these specs decide
 * the form. Where they disagree on form (e.g. "cite sources" vs a 160
 * character meta description), the spec wins.
 *
 * Pure module: safe to import from the browser (the editor reads TARGETS).
 */

export const SHORT_TARGETS = ["title", "excerpt", "metaTitle", "metaDescription", "slug", "tags", "coverAlt", "imageAlt"];
export const BODY_TARGETS = ["body.outline", "body.expand", "body.improve"];
export const TARGETS = [...SHORT_TARGETS, ...BODY_TARGETS];

const words = (text) => (String(text || "").trim() ? String(text).trim().split(/\s+/).length : 0);

/**
 * kind: "text" | "slug" | "tags" | "markdown"
 * need(p): reason string when the payload lacks context, else null
 */
export const FIELD_SPECS = {
  title: {
    kind: "text",
    max: 70,
    instruction: "A specific, plain-language post title that says what the reader will learn. No clickbait, no trailing punctuation.",
    need: (p) => (p.post.excerpt || words(p.body) >= 20 || p.post.tags.length ? null : "Write an excerpt, some tags or a few sentences first."),
  },
  excerpt: {
    kind: "text",
    max: 300,
    instruction: "One or two sentences (at most 300 characters) summarising what the post covers and why it matters.",
    need: (p) => (p.post.title || words(p.body) >= 20 ? null : "Add a title or a few sentences first."),
  },
  metaTitle: {
    kind: "text",
    max: 60,
    instruction: "A search-result title of at most 60 characters. Keep the key topic first. Do not include the author's name; the site adds it.",
    need: (p) => (p.post.title || p.post.excerpt || words(p.body) >= 20 ? null : "Add a title or an excerpt first."),
  },
  metaDescription: {
    kind: "text",
    min: 70,
    max: 160,
    instruction: "A search-result description of 120 to 160 characters: what the reader gets from the post. One or two plain sentences, no quotes, no emoji.",
    need: (p) => (p.post.title || p.post.excerpt || words(p.body) >= 20 ? null : "Add a title or an excerpt first."),
  },
  slug: {
    kind: "slug",
    max: 80,
    instruction: "A short URL slug: lowercase English words joined by single hyphens, 3 to 6 words, no stop words where avoidable.",
    need: (p) => (p.post.title || p.post.excerpt ? null : "Add a title first."),
  },
  tags: {
    kind: "tags",
    maxItems: 10,
    maxItem: 40,
    instruction: "3 to 6 topic tags a reader would search for (technologies, fields, methods). Title Case or the official spelling of a product.",
    need: (p) => (p.post.title || p.post.excerpt || words(p.body) >= 20 ? null : "Add a title or some text first."),
  },
  coverAlt: {
    kind: "text",
    max: 200,
    instruction: "Alt text for the post's cover image, under 200 characters. You cannot see the image: describe only what the caption, title and excerpt establish about it; never invent visual details.",
    need: (p) => (p.post.cover.caption || p.post.title || p.post.excerpt ? null : "Add a cover caption or a title first."),
  },
  imageAlt: {
    kind: "text",
    max: 200,
    instruction: "Alt text for an image in the post, under 200 characters. You cannot see the image: describe only what its caption and the surrounding text establish; never invent visual details.",
    need: (p) => (p.image?.caption || words(p.image?.nearbyText) >= 8 ? null : "Add a caption or some text near the image first."),
  },
  "body.outline": {
    kind: "markdown",
    instruction: "Turn the owner's notes into a post outline: Markdown ## and ### headings with short bullet points under each, in a logical order. Use only points present in the notes; do not add sections the notes do not support.",
    need: (p) => (p.post.title && words(p.body) >= 30 ? null : "Write a title and at least 30 words of notes first."),
  },
  "body.expand": {
    kind: "markdown",
    instruction: "Expand the selected text into fuller paragraphs in the same voice, keeping every claim it makes and adding no new facts, numbers or sources. Return only the replacement Markdown.",
    need: (p) => (words(p.selection) >= 5 ? null : "Select at least a sentence to expand."),
  },
  "body.improve": {
    kind: "markdown",
    instruction: "Improve the wording of the selected text: clearer, tighter, correct grammar, same meaning and voice. Do not add facts. Return only the replacement Markdown.",
    need: (p) => (words(p.selection) >= 3 ? null : "Select the text to improve."),
  },
};

export function isTarget(target) {
  return Object.hasOwn(FIELD_SPECS, target);
}

/** Null when the payload has enough to work from, else a reason for the owner. */
export function missingContext(target, payload) {
  return FIELD_SPECS[target].need(payload);
}
