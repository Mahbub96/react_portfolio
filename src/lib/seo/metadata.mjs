/**
 * Per-page Next.js Metadata builder.
 *
 * Next merges `metadata` shallowly: a page that sets `openGraph` replaces the
 * layout's whole `openGraph` object, so a page that forgets `images` silently
 * ships a link preview with no image. Building every page's metadata through
 * this one function guarantees each page gets a complete, consistent set:
 * self-referencing canonical, robots, Open Graph and Twitter card.
 */

import {
  DEFAULT_OG_IMAGE,
  SITE_AUTHOR,
  SITE_NAME,
} from "./siteConfig.mjs";
import { canonicalFor } from "./urls.mjs";
import { publishedPosts } from "@/lib/blog/posts.mjs";

const INDEXABLE_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

const NOINDEX_ROBOTS = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

/**
 * @param {object} opts
 * @param {string}  opts.path          internal path ("/projects/")
 * @param {string}  opts.title         page title; the layout template appends " — Mahbub Alam"
 * @param {boolean} [opts.absoluteTitle] use `title` verbatim (homepage)
 * @param {string}  opts.description   meta description, ideally ≤ 160 chars
 * @param {object}  [opts.image]       { url, width, height, alt } — must be the real size
 * @param {string}  [opts.ogType]      "website" | "article" | "profile"
 * @param {boolean} [opts.noindex]     keep the page out of search results
 */
export function pageMetadata({
  path = "/",
  title,
  absoluteTitle = false,
  description,
  image = DEFAULT_OG_IMAGE,
  ogType = "website",
  noindex = false,
} = {}) {
  const url = canonicalFor(path);
  const socialTitle = absoluteTitle ? title : `${title} — ${SITE_AUTHOR.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      // RSS autodiscovery on every page, once there is something to subscribe to.
      ...(publishedPosts().length
        ? { types: { "application/rss+xml": [{ url: "/feed.xml", title: `${SITE_NAME} — Writing` }] } }
        : {}),
    },
    robots: noindex ? NOINDEX_ROBOTS : INDEXABLE_ROBOTS,
    openGraph: {
      type: ogType,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      title: socialTitle,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      site: SITE_AUTHOR.xHandle,
      creator: SITE_AUTHOR.xHandle,
      title: socialTitle,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  };
}

/** Trim to a sentence-safe length for meta descriptions. */
export function clampDescription(text = "", max = 160) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : cut.length).replace(/[,;:.\s]+$/, "")}…`;
}
