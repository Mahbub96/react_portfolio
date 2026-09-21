/**
 * JSON-LD builders for the project detail pages.
 *
 * Structured data is generated from the project record rather than hand-written
 * per page, so a new project gets correct schema automatically and no page can
 * carry stale claims about a different project.
 */

import { SITE_AUTHOR, SITE_ORIGIN } from "./siteConfig.mjs";
import { absoluteUrl, absoluteAssetUrl } from "./urls.mjs";
import { projectPath } from "./projectCatalog.mjs";

/**
 * SoftwareSourceCode is the correct type for a code project: it expresses the
 * repository link and the languages used, which CreativeWork cannot.
 */
export function buildProjectJsonLd(project = {}) {
  const url = absoluteUrl(projectPath(project));
  const image = absoluteAssetUrl(project.image);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `${url}#project`,
    name: project.name,
    description: project.description,
    url,
    programmingLanguage: project.stack,
    author: {
      "@type": "Person",
      name: SITE_AUTHOR.name,
      url: `${SITE_ORIGIN}/`,
    },
    isPartOf: {
      "@type": "CollectionPage",
      "@id": absoluteUrl("/projects/"),
      name: "Projects",
      url: absoluteUrl("/projects/"),
    },
  };

  if (image) jsonLd.image = image;
  if (project.githubUrl) jsonLd.codeRepository = project.githubUrl;
  if (project.liveUrl) {
    jsonLd.sameAs = [project.liveUrl];
    jsonLd.softwareHelp = project.liveUrl;
  }

  return jsonLd;
}

/**
 * Breadcrumbs let Google render "mahbub.dev › Projects › LinkLens" instead of
 * a bare URL, and make the detail page's place in the hierarchy explicit.
 */
export function buildBreadcrumbJsonLd(project = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_ORIGIN}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: absoluteUrl("/projects/"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.name,
        item: absoluteUrl(projectPath(project)),
      },
    ],
  };
}
