/**
 * Single source of truth for site-wide SEO identity.
 *
 * Every other SEO module derives from this one. Nothing else in the codebase
 * should hardcode the production origin, contact details or profile URLs —
 * importing from here is what keeps canonical tags, the sitemap, llms.txt,
 * JSON-LD and the visible page from drifting apart.
 *
 * Public identity and contact details are deliberately NOT read from the
 * CMS/Mongo data: stale database rows previously published a second LinkedIn
 * URL, four email addresses and a phone number. What the public site says
 * about its owner is a code-reviewed decision, not editable content.
 */

/** Production origin, without a trailing slash. */
export const SITE_ORIGIN = "https://mahbub.dev";

/**
 * next.config.js sets `trailingSlash: true`, so every internal path must end
 * with "/" or the server 308-redirects and the canonical disagrees with the
 * URL Google actually fetched.
 */
export const TRAILING_SLASH = true;

/** Site name as shown in og:site_name and the WebSite JSON-LD node. */
export const SITE_NAME = "Mahbub Alam";

/** Default social/OG image — the only 1200×630 asset on the site. */
export const DEFAULT_OG_IMAGE = {
  url: "/assets/img/og-cover.jpg",
  width: 1200,
  height: 630,
  alt: "Mahbub Alam — Software Engineer",
};

export const SITE_AUTHOR = {
  name: "Mahbub Alam",
  givenName: "Mahbub",
  familyName: "Alam",
  alternateNames: ["Md Mahbub Alam", "Md. Mahbub Alam"],
  /** Primary title — identical in <title>, JSON-LD, llms.txt and the hero. */
  jobTitle: "Software Engineer",
  /** Positioning line shown next to the title. */
  tagline: "Backend, Full-Stack & Applied AI",
  /** The one public email address. No phone number is published. */
  email: "mahbubcse96@gmail.com",
  location: "Dhaka, Bangladesh",
  locality: "Dhaka",
  countryCode: "BD",
  company: "Brotecs Technologies Ltd.",
  companyUrl: "https://brotecs.com",
  alumniOf: {
    name: "Stamford University Bangladesh",
    url: "https://stamforduniversity.edu.bd",
  },
  image: "/assets/img/profile.png",
  github: "https://github.com/Mahbub96",
  linkedin: "https://www.linkedin.com/in/mahbubcse96",
  x: "https://x.com/mahbubcse96",
  xHandle: "@mahbubcse96",
  facebook: "https://www.facebook.com/MahbubCSE96",
};

/** Profiles of the same person — JSON-LD `sameAs`, in priority order. */
export const SAME_AS = [
  SITE_AUTHOR.linkedin,
  SITE_AUTHOR.github,
  SITE_AUTHOR.x,
  SITE_AUTHOR.facebook,
];

/** One plain, quotable sentence — search snippets and LLMs lift it verbatim. */
export const SITE_SUMMARY =
  "Mahbub Alam is a Software Engineer at Brotecs Technologies in Dhaka, Bangladesh, building backend APIs, full-stack products and applied AI systems.";

/** Default meta description (kept under ~160 characters). */
export const SITE_DESCRIPTION =
  "Mahbub Alam is a Software Engineer in Dhaka building backend APIs, full-stack web apps and applied AI systems with Node.js, NestJS, Python and React.";

/**
 * Neutral contact-section copy. Kept in code (not the CMS) so availability or
 * job-search wording cannot reappear on the public site through data edits.
 */
export const CONTACT_MESSAGE =
  "Questions about a project, a technical topic or something you saw here? Send a message and I'll get back to you.";

/**
 * Current positioning. Deliberately excludes legacy VoIP/CodeIgniter framing:
 * stale expertise claims in structured data misrepresent the site to both
 * search engines and LLM crawlers long after the portfolio copy has moved on.
 */
export const SITE_EXPERTISE = [
  "Software Engineering",
  "Backend Development",
  "Full Stack Development",
  "REST API Design",
  "Node.js",
  "NestJS",
  "TypeScript",
  "React",
  "Next.js",
  "Python",
  "FastAPI",
  "PHP",
  "Laravel",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "Redis",
  "Docker",
  "Linux",
  "Cloud Deployment",
  "System Architecture",
  "DevSecOps",
  "Applied AI",
  "Machine Learning",
  "Speech Recognition",
  "Large Language Models",
];
