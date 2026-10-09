/**
 * Pure blog helpers safe to import anywhere (client or server). Post data
 * itself comes from posts.server.mjs.
 */

export const BLOG_PATH = "/blog/";
export const FEED_PATH = "/blog/feed.xml";

/** Human date, e.g. "20 October 2026" (Dhaka time, where posts are written). */
export function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

/** Same calendar day in Dhaka time? Used to hide "Updated" when it adds nothing. */
export function sameDay(a, b) {
  return formatDate(a) === formatDate(b);
}
