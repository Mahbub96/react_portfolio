/**
 * Display-image resolution.
 *
 * The production server runs Linux x86_64 while the standalone build is
 * produced on macOS, so the bundled `sharp` binary cannot load there and
 * Next's /_next/image optimizer silently returns the original file — the
 * homepage was shipping ~6 MB of 1 MB PNGs. Instead of depending on runtime
 * image processing on a 1 GB server, pre-optimised WebP copies live next to
 * the originals (public/assets/img/*.webp, 1024px wide, ~40–65 KB each) and
 * are served as static files.
 *
 * The originals stay in place: Open Graph / Twitter cards and JSON-LD keep
 * using PNG/JPEG, which every social crawler supports.
 */

const OPTIMISED = /^(\/assets\/img\/(?:project-[\w-]+|profile))\.(?:png|jpe?g)$/i;

/** Normalise legacy relative paths ("./assets/img/x", "../../assets/img/x"). */
function normalise(src) {
  const value = String(src).trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return value;
  return `/${value.replace(/^(\.\.?\/)+/, "")}`.replace(/^\/(?!assets\/)/, "/assets/img/");
}

/** Best on-page image for `src`: the WebP copy when one exists. */
export function displayImage(src) {
  if (!src) return src;
  const path = normalise(src);
  const match = path.match(OPTIMISED);
  return match ? `${match[1]}.webp` : path;
}
