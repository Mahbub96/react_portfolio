/**
 * What each AI target produces and what context it needs.
 *
 * The shared rules (AI_RULES_FILE) decide what is true; these specs decide
 * the form. Where they disagree on form (e.g. "cite sources" vs a 160
 * character meta description), the spec wins.
 *
 * Pure module: safe to import from the browser (the editor reads TARGETS).
 */

export const SHORT_TARGETS = [
  "title",
  "excerpt",
  "metaTitle",
  "metaDescription",
  "slug",
  "tags",
  "coverAlt",
  "imageAlt",
  "codeSnippet",
  "calloutText",
];
export const BODY_TARGETS = ["body.outline", "body.expand", "body.improve"];
export const TARGETS = [...SHORT_TARGETS, ...BODY_TARGETS];

const words = (text) => (String(text || "").trim() ? String(text).trim().split(/\s+/).length : 0);

/**
 * kind: "text" | "slug" | "tags" | "markdown" | "code"
 * need(p): reason string when the payload lacks context, else null
 */
export const FIELD_SPECS = {
  title: {
    kind: "text",
    max: 70,
    instruction: "A realistic, technically compelling post title that clearly states the problem, architecture, or solution. Direct engineering tone, zero clickbait, no vague teaser phrasing, no trailing punctuation.",
    need: (p) => (p.post.excerpt || words(p.body) >= 20 || p.post.tags.length ? null : "Write an excerpt, some tags or a few sentences first."),
  },
  excerpt: {
    kind: "text",
    max: 300,
    instruction: "A punchy, realistic 1-2 sentence technical summary (under 300 chars) explaining the core problem, architectural approach, and actionable engineering takeaways.",
    need: (p) => (p.post.title || words(p.body) >= 20 ? null : "Add a title or a few sentences first."),
  },
  metaTitle: {
    kind: "text",
    max: 60,
    instruction: "An SEO-optimized, highly clickable search title (max 60 chars) highlighting the core technology and problem. High-intent keywords first, no author name.",
    need: (p) => (p.post.title || p.post.excerpt || words(p.body) >= 20 ? null : "Add a title or an excerpt first."),
  },
  metaDescription: {
    kind: "text",
    min: 70,
    max: 160,
    instruction: "A high-conversion search description of 120 to 160 characters: explaining exactly what practical engineering insights developers will gain. Active voice, zero hype, no emoji.",
    need: (p) => (p.post.title || p.post.excerpt || words(p.body) >= 20 ? null : "Add a title or an excerpt first."),
  },
  slug: {
    kind: "slug",
    max: 80,
    instruction: "A clean, URL-friendly slug: lowercase English words joined by single hyphens, 3 to 6 high-intent technical keywords, avoiding stop words.",
    need: (p) => (p.post.title || p.post.excerpt ? null : "Add a title first."),
  },
  tags: {
    kind: "tags",
    maxItems: 10,
    maxItem: 40,
    instruction: "3 to 6 realistic, specific tags a reader would search for: the main subject, its category or field, and closely related topics. Title Case, or the official spelling of a product or brand.",
    need: (p) => (p.post.title || p.post.excerpt || words(p.body) >= 20 ? null : "Add a title or some text first."),
  },
  coverAlt: {
    kind: "text",
    max: 200,
    instruction: "Concise, descriptive alt text for the post's cover image under 200 characters based only on the caption and topic. Factual, zero hallucinated visual details.",
    need: (p) => (p.post.cover.caption || p.post.title || p.post.excerpt ? null : "Add a cover caption or a title first."),
  },
  imageAlt: {
    kind: "text",
    max: 200,
    instruction: "Concise, descriptive alt text for an in-post image or diagram under 200 characters based on caption and nearby context. Factual and objective.",
    need: (p) => (p.image?.caption || words(p.image?.nearbyText) >= 8 ? null : "Add a caption or some text near the image first."),
  },
  codeSnippet: {
    kind: "code",
    max: 3000,
    instruction: "A realistic, production-grade code snippet matching the requested programming language and fitting the post's context and topic. Real-world implementation with idiomatic syntax, realistic function names, clean error handling, and helpful inline comments. Do NOT wrap output in markdown code fences.",
    need: (p) => (p.post.title || p.post.excerpt || words(p.body) >= 10 ? null : "Add a title or some text first."),
  },
  calloutText: {
    kind: "text",
    max: 400,
    instruction: "A concise, impactful engineering tip, warning, takeaway, or note (under 400 chars) that reinforces the post's practical message. Factual, pragmatic, zero fluff.",
    need: (p) => (p.post.title || p.post.excerpt || words(p.body) >= 10 ? null : "Add a title or some text first."),
  },
  "body.outline": {
    kind: "markdown",
    instruction: "A realistic, production-grade post outline with Markdown ## and ### headings and concise technical bullet points. Logical structure: Context & Problem -> Constraints & Design Decisions -> Implementation Deep Dive -> Trade-offs & Production Lessons.",
    need: (p) => (p.post.title && words(p.body) >= 30 ? null : "Write a title and at least 30 words of notes first."),
  },
  "body.expand": {
    kind: "markdown",
    instruction: "Expand the selected text into rich, pragmatic engineering prose maintaining the author's technical voice. Provide clear technical rationale, operational considerations, and trade-offs while strictly preserving all claims and facts.",
    need: (p) => (words(p.selection) >= 5 ? null : "Select at least a sentence to expand."),
  },
  "body.improve": {
    kind: "markdown",
    instruction: "Refine the selected text to senior engineer standards: eliminate passive phrasing, cut redundant words, clarify technical mechanics, and sharpen sentence flow while preserving exact meaning.",
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
