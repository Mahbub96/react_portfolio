/** Only same-site admin paths are valid post-login destinations. */
export function safeAdminNext(value, fallback = "/admin/posts/") {
  const next = String(value || "");
  return /^\/admin\/[\w\-./?=&%]*$/.test(next) && !next.startsWith("//") && !next.includes("..")
    ? next
    : fallback;
}
