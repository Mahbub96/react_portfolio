/**
 * Sitemap assembly.
 *
 * Split into "what should be in the sitemap" (buildSitemapEntries) and "how it
 * is serialised" (renderSitemapXml). The static public/sitemap.xml generated
 * at build time is the only sitemap the site serves (nginx answers
 * /sitemap.xml from disk), so there is no app/sitemap.js route to drift.
 */

import { sitemapRoutes } from "./routes.mjs";
import { absoluteUrl, absoluteAssetUrl } from "./urls.mjs";
import { indexableProjects, projectPath } from "./projectCatalog.mjs";

/** ISO date (yyyy-mm-dd) — sitemap <lastmod> does not need a timestamp. */
function isoDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

/**
 * Build the complete entry list: static routes plus one entry per indexable
 * project detail page.
 *
 * `lastModifiedFor(kind, item)` should return the date the content behind a
 * URL last really changed (the build script derives it from git history).
 * Stamping every URL with the build date on every deploy teaches crawlers to
 * ignore lastmod; a frozen constant suppresses re-crawls. Falls back to
 * `lastModified`, then to today.
 */
export function buildSitemapEntries({
  projects = [],
  lastModified,
  lastModifiedFor = () => null,
} = {}) {
  const fallback = isoDate(lastModified);
  const dateFor = (kind, item) => {
    const value = lastModifiedFor(kind, item);
    return value ? isoDate(value) : fallback;
  };

  const staticEntries = sitemapRoutes().map((route) => {
    const entry = {
      url: absoluteUrl(route.path),
      lastModified: dateFor("route", route),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      images: [],
    };

    if (route.path === "/") {
      entry.images = [absoluteAssetUrl("/assets/img/profile.png")].filter(Boolean);
    }

    return entry;
  });

  const catalog = indexableProjects(projects);

  // Project images belong to their own detail page, not piled onto /projects/.
  const projectEntries = catalog.map((project) => ({
    url: absoluteUrl(projectPath(project)),
    lastModified: dateFor("project", project),
    changeFrequency: "monthly",
    priority: 0.7,
    images: [absoluteAssetUrl(project.image)].filter(Boolean),
  }));

  return [...staticEntries, ...projectEntries];
}

/** Escape the five XML predefined entities. */
function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Serialise entries as a sitemap.xml document with the image extension. */
export function renderSitemapXml(entries = []) {
  const urls = entries
    .map((entry) => {
      const images = (entry.images || [])
        .map(
          (loc) =>
            `    <image:image>\n      <image:loc>${escapeXml(
              loc
            )}</image:loc>\n    </image:image>`
        )
        .join("\n");

      return [
        "  <url>",
        `    <loc>${escapeXml(entry.url)}</loc>`,
        `    <lastmod>${escapeXml(entry.lastModified)}</lastmod>`,
        `    <changefreq>${escapeXml(entry.changeFrequency)}</changefreq>`,
        `    <priority>${entry.priority.toFixed(1)}</priority>`,
        images,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
}
