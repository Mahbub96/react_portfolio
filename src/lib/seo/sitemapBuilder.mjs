/**
 * Sitemap assembly.
 *
 * Split into "what should be in the sitemap" (buildSitemapEntries) and "how it
 * is serialised" (renderSitemapXml) so the same entry list feeds both Next's
 * native `app/sitemap.js` export and the build-time static file generator
 * without either re-deriving the URL set.
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
 * `lastModified` defaults to the build/request date rather than a hardcoded
 * constant — a sitemap frozen at a fixed past date tells crawlers nothing has
 * changed and suppresses re-crawls.
 */
export function buildSitemapEntries({ projects = [], lastModified } = {}) {
  const stamp = isoDate(lastModified);

  const staticEntries = sitemapRoutes().map((route) => {
    const entry = {
      url: absoluteUrl(route.path),
      lastModified: stamp,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      images: [],
    };

    if (route.path === "/") {
      entry.images = [
        absoluteAssetUrl("/assets/img/profile.png"),
        absoluteAssetUrl("/assets/img/og-cover.jpg"),
      ].filter(Boolean);
    }

    return entry;
  });

  const catalog = indexableProjects(projects);

  // Project images belong to their own detail page, not piled onto /projects/.
  const projectEntries = catalog.map((project) => ({
    url: absoluteUrl(projectPath(project)),
    lastModified: stamp,
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
