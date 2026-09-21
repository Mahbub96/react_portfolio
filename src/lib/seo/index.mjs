/**
 * Public surface of the SEO module.
 *
 * App code imports from "@/lib/seo" rather than reaching into individual
 * files, so internal structure can change without touching page components.
 */

export {
  SITE_ORIGIN,
  SITE_NAME,
  SITE_AUTHOR,
  SITE_EXPERTISE,
  TRAILING_SLASH,
} from "./siteConfig.mjs";

export {
  normalizePath,
  absoluteUrl,
  canonicalFor,
  absoluteAssetUrl,
} from "./urls.mjs";

export { STATIC_ROUTES, sitemapRoutes, footerRoutes } from "./routes.mjs";

export { slugify, projectSlug, withUniqueSlugs } from "./slug.mjs";

export {
  buildProjectCatalog,
  findProjectBySlug,
  projectPath,
  indexableProjects,
} from "./projectCatalog.mjs";

export {
  SKILL_CATEGORY_ORDER,
  skillCategory,
  groupSkills,
} from "./skillCatalog.mjs";

export { buildSitemapEntries, renderSitemapXml } from "./sitemapBuilder.mjs";

export { renderLlmsTxt } from "./llmsProfile.mjs";

export { buildProjectJsonLd, buildBreadcrumbJsonLd } from "./structuredData.mjs";
