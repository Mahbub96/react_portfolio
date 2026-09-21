/**
 * Pure transforms over the project collection.
 *
 * Deliberately free of any data-fetching: callers pass in the raw array,
 * whether it came from MongoDB (runtime) or db.json (build scripts). That is
 * what lets the sitemap generator run at build time with no database
 * connection while the app uses the same logic against live data.
 */

import { withUniqueSlugs } from "./slug.mjs";

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
 * The bar is unique content, not a public repository: client work under NDA
 * has no GitHub link but still carries a distinct description and stack, and
 * excluding it would drop real engineering from the index. Entries filtered
 * out here remain visible as cards on /projects/ — they simply do not get a
 * standalone URL that Google would judge as thin.
 */
export function indexableProjects(rawProjects = []) {
  return buildProjectCatalog(rawProjects).filter((project) => {
    const hasDescription = project.description.length >= 80;
    const hasStack = project.stack.length >= 3;
    return hasDescription && hasStack;
  });
}
