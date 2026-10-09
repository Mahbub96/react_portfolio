/**
 * llms.txt / llms-full.txt generation.
 *
 * Generated from the same data the site renders (project catalogue, skills,
 * experience, education, case studies) so the machine-readable profile can
 * never drift from the pages. llms.txt is the short index (llmstxt.org
 * convention: H1, blockquote summary, H2 link sections); llms-full.txt is
 * the full plain-text profile with case studies, for agents that want
 * everything in one fetch.
 */

import {
  SITE_AUTHOR,
  SITE_ORIGIN,
  SITE_SUMMARY,
} from "./siteConfig.mjs";
import { sitemapRoutes } from "./routes.mjs";
import { absoluteUrl } from "./urls.mjs";
import {
  buildProjectCatalog,
  isIndexableProject,
  projectPath,
} from "./projectCatalog.mjs";
import { caseStudyFor } from "./caseStudies.mjs";
import { groupSkills } from "./skillCatalog.mjs";

function skillLines(skills = []) {
  return groupSkills(skills).map(
    ({ category, skills: grouped }) =>
      `- **${category}**: ${grouped
        .map((skill) => skill.name || skill.title || skill.altTxt)
        .filter(Boolean)
        .join(", ")}`
  );
}

function experienceLines(experiences = []) {
  return [...experiences]
    .sort((a, b) => String(b.startDate || "").localeCompare(String(a.startDate || "")))
    .map((exp) => {
      const company = exp.company ? ` — ${exp.company}` : "";
      const period = exp.time ? ` (${exp.time})` : "";
      const how = exp.how ? `: ${exp.how}` : "";
      return `- **${exp.name}**${company}${period}${how}`;
    });
}

function educationLines(educations = []) {
  return educations.map((edu) => {
    const dept = edu.Department && edu.Department !== edu.group ? `, ${edu.Department}` : "";
    const period = edu.time ? ` (${edu.time})` : "";
    const cgpa = edu.cgpa ? ` — CGPA ${edu.cgpa}` : "";
    const thesis = edu.Thesis && edu.Thesis !== "N/A" ? `. Thesis: ${edu.Thesis}` : "";
    return `- **${edu.degName}${dept}** — ${edu.name}${period}${cgpa}${thesis}`;
  });
}

function profileBlock() {
  return `- **Name**: ${SITE_AUTHOR.name} (also written ${SITE_AUTHOR.alternateNames.join(", ")})
- **Role**: ${SITE_AUTHOR.jobTitle} — ${SITE_AUTHOR.tagline}
- **Employer**: ${SITE_AUTHOR.company} (${SITE_AUTHOR.companyUrl})
- **Location**: ${SITE_AUTHOR.location}
- **Email**: ${SITE_AUTHOR.email}
- **Website**: ${SITE_ORIGIN}/
- **LinkedIn**: ${SITE_AUTHOR.linkedin}
- **GitHub**: ${SITE_AUTHOR.github}
- **X**: ${SITE_AUTHOR.x}`;
}

function sections({ projects = [], skills = [], experiences = [], educations = [], posts = [] }) {
  const catalog = buildProjectCatalog(projects);
  const featured = catalog.filter(isIndexableProject);
  const others = catalog.filter((project) => !isIndexableProject(project));

  const featuredBlock = featured
    .map((project) => {
      const study = caseStudyFor(project.slug);
      return `- [${project.name}](${absoluteUrl(projectPath(project))}): ${study.summary} _(${project.stack.join(", ")})_`;
    })
    .join("\n");

  const otherBlock = others
    .map((project) => {
      const link = project.githubUrl || project.liveUrl;
      const name = link ? `[${project.name}](${link})` : project.name;
      return `- ${name}: ${project.description} _(${project.stack.join(", ")})_`;
    })
    .join("\n");

  const routeBlock = sitemapRoutes()
    .map((route) => `- [${route.label}](${absoluteUrl(route.path)}): ${route.description}`)
    .join("\n");

  const postBlock = posts
    .map((post) => `- [${post.title}](${absoluteUrl(post.path)}) (${post.datePublished}): ${post.description}`)
    .join("\n");

  return {
    postBlock,
    featured,
    featuredBlock,
    otherBlock,
    routeBlock,
    skillBlock: skillLines(skills).join("\n"),
    experienceBlock: experienceLines(experiences).join("\n"),
    educationBlock: educationLines(educations).join("\n"),
  };
}

/** Short index: /llms.txt and /.well-known/llms.txt */
export function renderLlmsTxt(content = {}) {
  const s = sections(content);

  return `# ${SITE_AUTHOR.name} — ${SITE_AUTHOR.jobTitle}

> ${SITE_SUMMARY}

${profileBlock()}

## Pages

${s.routeBlock}
- [Full profile for LLMs](${SITE_ORIGIN}/llms-full.txt): Everything on this site as plain Markdown, including project case studies.

## Featured projects

${s.featuredBlock || "- None yet."}
${s.postBlock ? `\n## Writing\n\n${s.postBlock}\n` : ""}${s.otherBlock ? `\n## Other projects\n\n${s.otherBlock}\n` : ""}
## Experience

${s.experienceBlock}

## Education

${s.educationBlock}
${s.skillBlock ? `\n## Skills\n\n${s.skillBlock}\n` : ""}
## Notes for automated readers

- Canonical origin is ${SITE_ORIGIN} (no "www" prefix).
- The machine-readable URL list is ${SITE_ORIGIN}/sitemap.xml.
`;
}

/** Full profile: /llms-full.txt — includes every case study. */
export function renderLlmsFullTxt(content = {}) {
  const s = sections(content);
  const bullets = (items = []) => items.map((item) => `- ${item}`).join("\n");

  const studies = s.featured
    .map((project) => {
      const study = caseStudyFor(project.slug);
      const stack = Object.entries(study.stackGroups || {})
        .map(([group, items]) => `- **${group}**: ${items.join(", ")}`)
        .join("\n");
      const links = [
        `- Page: ${absoluteUrl(projectPath(project))}`,
        project.githubUrl && `- Source: ${project.githubUrl}`,
        project.liveUrl && `- Live: ${project.liveUrl}`,
      ]
        .filter(Boolean)
        .join("\n");

      return `### ${study.headline}

${study.summary}

#### The problem

${study.problem.join("\n\n")}

#### Architecture and approach

${bullets(study.approach)}

#### Key features

${bullets(study.features)}

#### Engineering decisions

${bullets(study.decisions)}

#### Technology stack

${stack}

#### Links

${links}`;
    })
    .join("\n\n");

  return `# ${SITE_AUTHOR.name} — ${SITE_AUTHOR.jobTitle} (full profile)

> ${SITE_SUMMARY}

${profileBlock()}

## Experience

${s.experienceBlock}

## Education

${s.educationBlock}
${s.skillBlock ? `\n## Skills\n\n${s.skillBlock}\n` : ""}
## Project case studies

${studies || "None yet."}
${s.postBlock ? `\n## Writing\n\n${s.postBlock}\n` : ""}${s.otherBlock ? `\n## Other projects\n\n${s.otherBlock}\n` : ""}`;
}
