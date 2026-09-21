/**
 * Deterministic slug generation for project detail routes.
 *
 * Slugs are derived from the project name rather than stored in db.json so the
 * existing seeded data needs no migration. A project may still override its
 * slug by adding an explicit `slug` field — the override wins, which lets a URL
 * stay stable even if the display name is later reworded.
 */

/** Convert arbitrary display text into a URL-safe slug. */
export function slugify(value = "") {
  return String(value)
    .normalize("NFKD")
    // Strip combining marks so accented characters degrade to ASCII
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    // Em/en dashes and ampersands read as word separators, not characters
    .replace(/[\u2013\u2014]/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Drop a trailing tagline from a project name.
 *
 * Names follow a "Proper Name — marketing descriptor" convention
 * ("LinkLens — Enterprise Link Intelligence Platform"). The descriptor belongs
 * in the page copy, not the URL: a 46-character slug is worse to share, worse
 * to read in a SERP, and encodes wording that changes more often than the
 * product's actual name. Only the part before the separator is used, and only
 * when what remains is substantial enough to identify the project.
 */
function projectNameStem(name = "") {
  const stem = String(name).split(/\s+[\u2013\u2014:]\s+/)[0].trim();
  return stem.length >= 3 ? stem : String(name).trim();
}

/** Resolve the canonical slug for a project record. */
export function projectSlug(project = {}) {
  const explicit = project.slug && slugify(project.slug);
  if (explicit) return explicit;

  const fromName = slugify(projectNameStem(project.name || project.title || ""));
  if (fromName) return fromName;

  // Last resort: never emit an empty slug, it would collide with /projects/
  return project.id ? `project-${project.id}` : null;
}

/**
 * Guarantee slug uniqueness across a collection.
 *
 * Two projects sharing a name would otherwise produce two routes resolving to
 * the same URL — one of them silently unreachable.
 */
export function withUniqueSlugs(projects = []) {
  const seen = new Map();

  return projects.map((project) => {
    const base = projectSlug(project);
    if (!base) return { ...project, slug: null };

    const count = seen.get(base) || 0;
    seen.set(base, count + 1);

    return { ...project, slug: count === 0 ? base : `${base}-${count + 1}` };
  });
}
