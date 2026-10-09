/**
 * Blog post URL slugs: /blog/<slug>/.
 */
import { randomBytes } from "node:crypto";
import { slugify } from "../seo/slug.mjs";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX = 80;

// Words that would shadow present or future /blog/ sub-routes.
export const RESERVED_SLUGS = new Set([
  "admin", "feed", "rss", "tag", "tags", "page", "new", "drafts", "preview", "search",
]);

export function isValidSlug(slug) {
  return (
    typeof slug === "string" &&
    slug.length <= SLUG_MAX &&
    SLUG_PATTERN.test(slug) &&
    !RESERVED_SLUGS.has(slug)
  );
}

/** Slug from a title, cut at a word boundary; Bangla-only titles fall back to a random one. */
export function slugFromTitle(title = "") {
  let slug = slugify(title);
  if (slug.length > 60) slug = slug.slice(0, 60).replace(/-[^-]*$/, "");
  if (!slug || RESERVED_SLUGS.has(slug)) slug = `post-${randomBytes(3).toString("hex")}`;
  return slug;
}
