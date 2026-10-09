/**
 * JSON-LD (schema.org) builders.
 *
 * Every page emits exactly ONE <script type="application/ld+json"> holding a
 * single `@graph`. The Person and WebSite nodes have stable `@id`s and are
 * defined identically on every page; everything else (WebPage, breadcrumbs,
 * projects) references them by `@id`. That is what lets Google and LLM
 * crawlers merge the site into one entity ("Mahbub Alam, Software Engineer")
 * instead of the three conflicting Person records the site used to publish.
 *
 * Deliberately NOT emitted:
 *  - JobPosting      — reserved for real vacancies; using it for work history
 *                      violates Google's structured-data policy.
 *  - LocalBusiness / OfferCatalog / ContactPoint — this is a personal site,
 *                      not a business, and those types signal freelancing.
 *  - FAQPage         — Google restricts FAQ rich results to government/health
 *                      sites, so it adds noise and no SERP benefit.
 *  - telephone       — no phone number is published.
 */

import {
  SITE_AUTHOR,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_SUMMARY,
  SITE_EXPERTISE,
  SAME_AS,
} from "./siteConfig.mjs";
import { absoluteUrl, absoluteAssetUrl } from "./urls.mjs";
import { projectPath } from "./projectCatalog.mjs";
import { ABOUT_TOPICS } from "./aboutProfile.mjs";

export const PERSON_ID = `${SITE_ORIGIN}/#person`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

const personRef = { "@id": PERSON_ID };
const websiteRef = { "@id": WEBSITE_ID };

/** The canonical Person entity. */
export function personNode() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE_AUTHOR.name,
    givenName: SITE_AUTHOR.givenName,
    familyName: SITE_AUTHOR.familyName,
    alternateName: SITE_AUTHOR.alternateNames,
    url: `${SITE_ORIGIN}/`,
    image: {
      "@type": "ImageObject",
      "@id": `${SITE_ORIGIN}/#profile-image`,
      url: absoluteAssetUrl(SITE_AUTHOR.image),
      caption: SITE_AUTHOR.name,
    },
    jobTitle: SITE_AUTHOR.jobTitle,
    description: SITE_SUMMARY,
    email: `mailto:${SITE_AUTHOR.email}`,
    worksFor: {
      "@type": "Organization",
      name: SITE_AUTHOR.company,
      url: SITE_AUTHOR.companyUrl,
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: SITE_AUTHOR.alumniOf.name,
      url: SITE_AUTHOR.alumniOf.url,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_AUTHOR.locality,
      addressCountry: SITE_AUTHOR.countryCode,
    },
    knowsAbout: [...new Set([...SITE_EXPERTISE, ...ABOUT_TOPICS])],
    sameAs: SAME_AS,
  };
}

/** The WebSite entity — published by the Person. */
export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_ORIGIN}/`,
    name: SITE_NAME,
    inLanguage: "en",
    publisher: personRef,
    author: personRef,
  };
}

/**
 * BreadcrumbList for a path like [{ name: "Projects", path: "/projects/" }].
 * "Home" is prepended automatically.
 */
export function breadcrumbNode(pageUrl, trail = []) {
  const items = [{ name: "Home", url: `${SITE_ORIGIN}/` }].concat(
    trail.map((step) => ({ name: step.name, url: absoluteUrl(step.path) }))
  );

  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Build the full graph for one page.
 *
 * @param {object} opts
 * @param {string} opts.path         internal path, e.g. "/projects/"
 * @param {string} opts.name         page name (usually the <title> without suffix)
 * @param {string} opts.description  page description
 * @param {string} [opts.type]       schema.org page type (WebPage, ProfilePage, CollectionPage, ContactPage…)
 * @param {Array}  [opts.breadcrumb] trail after Home; omit for the homepage
 * @param {string} [opts.dateModified] ISO date of the last real content change
 * @param {object} [opts.mainEntity] node the page is primarily about (defaults to the Person on ProfilePage)
 * @param {Array}  [opts.nodes]      extra nodes to add to the graph
 */
export function buildPageGraph({
  path = "/",
  name,
  description,
  type = "WebPage",
  breadcrumb,
  dateModified,
  mainEntity,
  nodes = [],
} = {}) {
  const url = absoluteUrl(path);

  const page = {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "en",
    isPartOf: websiteRef,
    about: personRef,
    author: personRef,
  };

  if (dateModified) page.dateModified = dateModified;
  if (mainEntity) page.mainEntity = mainEntity;
  else if (type === "ProfilePage") page.mainEntity = personRef;

  const graph = [websiteNode(), personNode(), page];

  if (breadcrumb?.length) {
    const crumbs = breadcrumbNode(url, breadcrumb);
    page.breadcrumb = { "@id": crumbs["@id"] };
    graph.push(crumbs);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph.concat(nodes),
  };
}

/**
 * SoftwareSourceCode is the correct type for a code project: it expresses the
 * repository link and the languages used, which CreativeWork cannot.
 */
export function projectNode(project = {}) {
  const url = absoluteUrl(projectPath(project));
  const image = absoluteAssetUrl(project.image);

  const node = {
    "@type": "SoftwareSourceCode",
    "@id": `${url}#project`,
    name: project.name,
    description: project.summary || project.description,
    url,
    programmingLanguage: project.stack,
    author: personRef,
    creator: personRef,
    mainEntityOfPage: { "@id": `${url}#webpage` },
  };

  if (image) node.image = image;
  if (project.githubUrl) node.codeRepository = project.githubUrl;
  if (project.liveUrl) node.sameAs = [project.liveUrl];
  if (project.keywords?.length) node.keywords = project.keywords.join(", ");

  return node;
}

/** ItemList of project detail pages — used on /projects/. */
export function projectListNode(projects = []) {
  return {
    "@type": "ItemList",
    "@id": `${absoluteUrl("/projects/")}#list`,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(projectPath(project)),
      name: project.name,
    })),
  };
}

/** Blog entity for /blog/ — written and published by the Person. */
export function blogNode(posts = []) {
  const url = absoluteUrl("/blog/");
  return {
    "@type": "Blog",
    "@id": `${url}#blog`,
    url,
    name: `${SITE_NAME} — Writing`,
    inLanguage: "en",
    author: personRef,
    publisher: personRef,
    blogPost: posts.map((post) => ({ "@id": `${absoluteUrl(post.path)}#article` })),
  };
}

/**
 * BlogPosting for one article. author/publisher reference the Person @id so
 * every article strengthens the same "Mahbub Alam" entity.
 */
export function blogPostingNode(post) {
  const url = absoluteUrl(post.path);
  const node = {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    inLanguage: "en",
    wordCount: post.wordCount,
    author: personRef,
    publisher: personRef,
    isPartOf: { "@id": `${absoluteUrl("/blog/")}#blog` },
    mainEntityOfPage: { "@id": `${url}#webpage` },
  };
  if (post.tags?.length) node.keywords = post.tags.join(", ");
  const image = absoluteAssetUrl(post.image || "/assets/img/og-cover.jpg");
  if (image) node.image = image;
  return node;
}
