/**
 * Blog data access.
 *
 * Posts are rendered from content/blog/*.md by scripts/generate-blog.mjs
 * (prebuild/predev) into blog.generated.json, so pages, the footer and the
 * layout read plain JSON — no filesystem access or Markdown parsing at
 * runtime on the server.
 */

import generated from "@/content/blog.generated.json";

const POSTS = Array.isArray(generated?.posts) ? generated.posts : [];

/** Every post in this build (drafts only when built with BLOG_INCLUDE_DRAFTS=1). */
export function allPosts() {
  return POSTS;
}

/** Posts that may be indexed, listed in the sitemap/RSS and linked publicly. */
export function publishedPosts() {
  return POSTS.filter((post) => !post.draft);
}

export function getPost(slug) {
  return POSTS.find((post) => post.slug === slug) || null;
}

/** True when the blog has anything to show in this build. */
export function hasPosts() {
  return POSTS.length > 0;
}

/** Human date, e.g. "20 October 2026". */
export function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
