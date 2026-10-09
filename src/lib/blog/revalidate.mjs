/**
 * Cache refresh and search-engine notification after a publish, unpublish,
 * slug change or delete. Public blog pages and the sitemap/RSS/llms routes
 * are cached under the "blog" tag; this drops them so the next request
 * re-renders with the new state.
 */
import { revalidatePath, revalidateTag } from "next/cache";
import { submitIndexNow } from "../seo/indexnow.mjs";
import { absoluteUrl } from "../seo/urls.mjs";
import { isProductionSite } from "./env.mjs";

export const BLOG_TAG = "blog";

export function postPath(slug) {
  return `/blog/${slug}/`;
}

export function refreshBlog(slugs = []) {
  revalidateTag(BLOG_TAG);
  revalidatePath("/blog/");
  for (const slug of new Set(slugs.filter(Boolean))) revalidatePath(postPath(slug));
}

/**
 * Tell IndexNow engines the URLs changed. Production only (test and dev
 * share the canonical host and must never submit), fire-and-forget: a slow
 * or failing ping never fails the publish. Resolves to the status or null.
 */
export async function pingSearchEngines(slugs = []) {
  if (!isProductionSite()) return null;
  const urls = [...new Set(slugs.filter(Boolean))].map((slug) => absoluteUrl(postPath(slug)));
  urls.push(absoluteUrl("/blog/"));
  try {
    return await submitIndexNow(urls, { timeoutMs: 5000 });
  } catch (error) {
    console.warn("IndexNow ping failed:", error.message);
    return null;
  }
}
