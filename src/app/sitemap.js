/**
 * Next.js native sitemap route -> /sitemap.xml
 *
 * Serves live database content between deploys. The identical URL set is also
 * emitted as a static public/sitemap.xml at build time by
 * scripts/generate-seo-artifacts.mjs, because in production nginx answers
 * /sitemap.xml from disk before the request reaches this handler. Both paths
 * share src/lib/seo/sitemapBuilder.mjs so they cannot drift.
 */

import { getPortfolioData } from "@/lib/getPortfolioData";
import { buildSitemapEntries } from "@/lib/seo/sitemapBuilder.mjs";

export default async function sitemap() {
  let projects = [];

  try {
    const portfolioData = await getPortfolioData();
    projects = portfolioData?.Projects?.data || [];
  } catch (error) {
    // getPortfolioData already falls back to db.json; this only catches a
    // hard failure. An empty list still yields the static routes, which is
    // strictly better than returning no sitemap at all.
    console.error("sitemap: falling back to static routes only:", error);
  }

  return buildSitemapEntries({ projects }).map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
    ...(entry.images?.length ? { images: entry.images } : {}),
  }));
}
