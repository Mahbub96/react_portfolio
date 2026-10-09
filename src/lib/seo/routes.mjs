/**
 * Registry of the site's static, indexable routes.
 *
 * This is the one list that the sitemap, the footer navigation and llms.txt
 * all read. Adding a page here makes it appear in every surface at once;
 * previously each of those three places kept its own copy and they disagreed.
 *
 * `inSitemap: false` marks a route that is reachable and linkable but must not
 * be advertised to search engines (utility pages, gated views).
 */

export const STATIC_ROUTES = [
  {
    path: "/",
    label: "Home",
    priority: 1.0,
    changeFrequency: "weekly",
    inSitemap: true,
    inFooter: false, // the logo already links home
    description: "Portfolio home: profile, projects, skills, experience.",
  },
  {
    path: "/about/",
    label: "About",
    priority: 0.9,
    changeFrequency: "monthly",
    inSitemap: true,
    inFooter: true,
    description: "Who Mahbub Alam is: focus areas, engineering approach, experience and education.",
  },
  {
    path: "/projects/",
    label: "Projects",
    priority: 0.9,
    changeFrequency: "weekly",
    inSitemap: true,
    inFooter: true,
    description: "Full project catalogue with stack and source links.",
  },
  {
    path: "/skills/",
    label: "Skills",
    priority: 0.8,
    changeFrequency: "monthly",
    inSitemap: true,
    inFooter: true,
    description: "Technical skills grouped by domain.",
  },
  {
    path: "/blog/",
    label: "Blog",
    priority: 0.8,
    changeFrequency: "weekly",
    // Listed by the live /blog/sitemap.xml (with every post), not the static one.
    inSitemap: false,
    inFooter: true,
    description: "Engineering articles on backend systems, applied AI and speech recognition.",
  },
  {
    path: "/contact/",
    label: "Contact",
    priority: 0.8,
    changeFrequency: "monthly",
    inSitemap: true,
    inFooter: true,
    description: "Contact details and enquiry form.",
  },
  {
    path: "/resume/",
    label: "Resume",
    priority: 0.7,
    changeFrequency: "monthly",
    inSitemap: true,
    inFooter: true,
    description: "Printable resume with downloadable PDF.",
  },
];

/** Routes that belong in the XML sitemap. */
export function sitemapRoutes() {
  return STATIC_ROUTES.filter((route) => route.inSitemap);
}

/** Routes that should be rendered as crawlable footer links. */
export function footerRoutes() {
  return STATIC_ROUTES.filter((route) => route.inFooter);
}
