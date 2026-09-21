/**
 * Single source of truth for site-wide SEO identity.
 *
 * Every other SEO module derives from this one. Nothing else in the codebase
 * should hardcode the production origin — importing from here is what keeps
 * canonical tags, the sitemap, llms.txt and JSON-LD from drifting apart.
 */

/** Production origin, without a trailing slash. */
export const SITE_ORIGIN = "https://mahbub.dev";

/**
 * next.config.js sets `trailingSlash: true`, so every internal path must end
 * with "/" or the server 308-redirects and the canonical disagrees with the
 * URL Google actually fetched.
 */
export const TRAILING_SLASH = true;

export const SITE_NAME = "Mahbub Alam Portfolio";

export const SITE_AUTHOR = {
  name: "Mahbub Alam",
  jobTitle: "Software Engineer | Full-Stack, Backend & Applied AI",
  email: "mahbubcse96@gmail.com",
  phone: "+880-1784-310996",
  location: "Dhaka, Bangladesh",
  company: "Brotecs Technologies Ltd.",
  companyUrl: "https://brotecs.com",
  github: "https://github.com/mahbub96",
  linkedin: "https://www.linkedin.com/in/mahbubcse96",
  facebook: "https://fb.me/MahbubCSE96",
};

/**
 * Current positioning. Deliberately excludes legacy VoIP/CodeIgniter framing:
 * stale expertise claims in structured data misrepresent the site to both
 * search engines and LLM crawlers long after the portfolio copy has moved on.
 */
export const SITE_EXPERTISE = [
  "Full Stack Development",
  "Software Engineering",
  "Backend Development",
  "React.js",
  "Next.js",
  "Node.js",
  "NestJS",
  "TypeScript",
  "Python",
  "FastAPI",
  "PHP",
  "Laravel",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "Redis",
  "Docker",
  "Cloud Computing",
  "System Architecture",
  "DevSecOps",
  "Applied AI",
  "Machine Learning",
  "Computer Vision",
  "Speech Recognition",
];
