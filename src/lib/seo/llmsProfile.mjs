/**
 * llms.txt generation.
 *
 * The previous file was hand-maintained and had drifted badly: it advertised
 * projects that no longer exist on the site while omitting every current one,
 * and listed routes as canonical that the pages themselves canonicalised away.
 * Generating it from the same project catalogue the site renders removes the
 * possibility of that drift recurring.
 */

import { SITE_AUTHOR, SITE_ORIGIN } from "./siteConfig.mjs";
import { sitemapRoutes } from "./routes.mjs";
import { absoluteUrl } from "./urls.mjs";
import { buildProjectCatalog, projectPath } from "./projectCatalog.mjs";
import { groupSkills } from "./skillCatalog.mjs";

/**
 * Render skills as one line per category, reusing the site's own grouping so
 * the profile and the rendered page never disagree.
 */
function skillLines(skills = []) {
  return groupSkills(skills).map(
    ({ category, skills: grouped }) =>
      `- **${category}**: ${grouped
        .map((skill) => skill.name || skill.title || skill.altTxt)
        .filter(Boolean)
        .join(", ")}`
  );
}

/**
 * Render the llms.txt document.
 *
 * Kept to the conventional shape (H1, blockquote summary, H2 sections) that
 * llms.txt consumers expect, with every project link pointing at a URL that
 * actually resolves.
 */
export function renderLlmsTxt({ projects = [], skills = [] } = {}) {
  const catalog = buildProjectCatalog(projects);

  const projectBlock = catalog.length
    ? catalog
        .map((project) => {
          const stack = project.stack.length
            ? ` _(${project.stack.join(", ")})_`
            : "";
          const url = absoluteUrl(projectPath(project));
          return `- [${project.name}](${url}): ${project.description}${stack}`;
        })
        .join("\n")
    : "- Project catalogue is currently unavailable.";

  const skillBlock = skillLines(skills).join("\n");

  const routeBlock = sitemapRoutes()
    .map((route) => `- [${route.label}](${absoluteUrl(route.path)}): ${route.description}`)
    .join("\n");

  return `# ${SITE_AUTHOR.name} — ${SITE_AUTHOR.jobTitle}

> Software Engineer building full-stack products, backend APIs, cloud-deployed
> services and applied AI systems. Based in ${SITE_AUTHOR.location}.

- **Name**: ${SITE_AUTHOR.name}
- **Title**: ${SITE_AUTHOR.jobTitle}
- **Location**: ${SITE_AUTHOR.location}
- **Company**: ${SITE_AUTHOR.company}
- **Email**: ${SITE_AUTHOR.email}
- **Website**: ${SITE_ORIGIN}/
- **GitHub**: ${SITE_AUTHOR.github}
- **LinkedIn**: ${SITE_AUTHOR.linkedin}

## Pages

${routeBlock}

## Projects

${projectBlock}
${skillBlock ? `\n## Skills\n\n${skillBlock}\n` : ""}
## Notes for automated readers

- Canonical origin is ${SITE_ORIGIN} (no "www" prefix).
- The machine-readable URL list is ${SITE_ORIGIN}/sitemap.xml.
`;
}
