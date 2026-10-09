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
  SITE_SUMMARY,
  SITE_DESCRIPTION,
  SITE_EXPERTISE,
  SAME_AS,
  DEFAULT_OG_IMAGE,
  CONTACT_MESSAGE,
  TRAILING_SLASH,
} from "./siteConfig.mjs";

export {
  normalizePath,
  absoluteUrl,
  canonicalFor,
  absoluteAssetUrl,
} from "./urls.mjs";

export { STATIC_ROUTES, sitemapRoutes } from "./routes.mjs";

export { slugify, projectSlug, withUniqueSlugs } from "./slug.mjs";

export {
  buildProjectCatalog,
  findProjectBySlug,
  projectPath,
  isIndexableProject,
  indexableProjects,
} from "./projectCatalog.mjs";

export { CASE_STUDIES, caseStudyFor } from "./caseStudies.mjs";

export { pageMetadata, clampDescription } from "./metadata.mjs";

export { renderRobotsTxt, AI_AGENTS, DISALLOWED_PATHS } from "./robots.mjs";

export {
  SKILL_CATEGORY_ORDER,
  skillCategory,
  groupSkills,
} from "./skillCatalog.mjs";

export { buildSitemapEntries, renderSitemapXml } from "./sitemapBuilder.mjs";

export { renderLlmsTxt, renderLlmsFullTxt } from "./llmsProfile.mjs";

export {
  PERSON_ID,
  WEBSITE_ID,
  personNode,
  websiteNode,
  breadcrumbNode,
  buildPageGraph,
  projectNode,
  projectListNode,
} from "./structuredData.mjs";
