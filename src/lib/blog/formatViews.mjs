/**
 * Pure view-count formatting, shared by server and client components.
 *
 * This lives in its own module with no "use client" directive on purpose:
 * `PostCard` is a server component, so importing this helper from a
 * "use client" module (it previously came from BlogViewTracker) hands back a
 * client-reference proxy instead of the function, and rendering throws
 * "TypeError: g is not a function" while serialising the RSC payload.
 */
export function formatViews(num) {
  const count = typeof num === "number" && !isNaN(num) ? num : 0;
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return count.toLocaleString();
}
