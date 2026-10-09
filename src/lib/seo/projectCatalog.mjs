/**
 * Pure transforms over the project collection.
 *
 * Deliberately free of any data-fetching: callers pass in the raw array,
 * whether it came from MongoDB (runtime) or db.json (build scripts). That is
 * what lets the sitemap generator run at build time with no database
 * connection while the app uses the same logic against live data.
 */

import { withUniqueSlugs } from "./slug.mjs";
import { caseStudyFor } from "./caseStudies.mjs";

/**
 * Normalise a raw project record into the shape SEO surfaces consume.
 * Tolerates both `name`/`title` and missing optional fields.
 */
function normalizeProject(project = {}) {
  const stack = Array.isArray(project.lang)
    ? project.lang.filter(Boolean)
    : [];

  return {
    id: project.id ?? null,
    slug: project.slug ?? null,
    name: (project.name || project.title || "").trim(),
    description: (project.desc || project.description || "").trim(),
    image: project.src || null,
    stack,
    githubUrl: project.githubUrl || null,
    liveUrl: project.liveUrl || null,
    downloadUrl: project.downloadUrl || null,
  };
}

/**
 * Full catalogue: normalised, uniquely slugged, and filtered to records that
 * can actually back a page. A project with no name would render a blank
 * document at a meaningless URL, so it is excluded rather than emitted.
 */
export function buildProjectCatalog(rawProjects = []) {
  const normalized = (rawProjects || []).map(normalizeProject);
  return withUniqueSlugs(normalized).filter(
    (project) => project.name && project.slug
  );
}

/** Look up one catalogue entry by its slug. */
export function findProjectBySlug(rawProjects = [], slug) {
  if (!slug) return null;
  return (
    buildProjectCatalog(rawProjects).find(
      (project) => project.slug === slug
    ) || null
  );
}

/** Internal path for a project's detail page. */
export function projectPath(project = {}) {
  return project.slug ? `/projects/${project.slug}/` : "/projects/";
}

/**
 * Projects worth their own indexable page.
 *
 * The bar is unique long-form content: a detail page that only repeats the
 * card's one-line description is ~100 words, which Google treats as thin and
 * leaves "crawled – currently not indexed". Only projects with a written case
 * study (caseStudies.mjs) are indexable and listed in the sitemap/llms.txt.
 * Every other project still renders at its URL — with `noindex` — and stays
 * visible as a card on /projects/.
 */
export function isIndexableProject(project = {}) {
  return Boolean(caseStudyFor(project.slug));
}

export function indexableProjects(rawProjects = []) {
  return buildProjectCatalog(rawProjects).filter(isIndexableProject);
}
