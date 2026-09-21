/**
 * URL construction helpers.
 *
 * Kept separate from siteConfig so that path-shape rules (trailing slash,
 * absolute vs relative) live in exactly one place. A canonical tag that
 * disagrees with the served URL by a single slash is enough to make Google
 * treat the page as a duplicate, so this is not a cosmetic concern.
 */

import { SITE_ORIGIN, TRAILING_SLASH } from "./siteConfig.mjs";

/**
 * Normalise any internal path to the shape the server actually serves:
 * leading slash, and a trailing slash when next.config.js demands one.
 * The site root stays exactly "/".
 */
export function normalizePath(path = "/") {
  let normalized = String(path).trim();

  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  // Collapse accidental duplicate slashes ("//projects//" -> "/projects/")
  normalized = normalized.replace(/\/{2,}/g, "/");

  if (normalized === "/") return "/";

  const withoutTrailing = normalized.replace(/\/+$/, "");
  return TRAILING_SLASH ? `${withoutTrailing}/` : withoutTrailing;
}

/** Absolute production URL for an internal path. */
export function absoluteUrl(path = "/") {
  return `${SITE_ORIGIN}${normalizePath(path)}`;
}

/**
 * Canonical value for a Next.js `metadata.alternates.canonical` field.
 *
 * Exists as its own named export so page files read declaratively
 * (`canonical: canonicalFor("/projects/")`) and can never accidentally
 * inherit the layout's site-root canonical.
 */
export function canonicalFor(path = "/") {
  return absoluteUrl(path);
}

/** Absolute URL for an asset that may already be absolute (e.g. a CDN image). */
export function absoluteAssetUrl(src) {
  if (!src) return null;
  return /^https?:\/\//i.test(src) ? src : `${SITE_ORIGIN}${src}`;
}
