/**
 * Content for /about/ — the page that answers "who is Mahbub Alam".
 *
 * Kept in code (like caseStudies.mjs), not in MongoDB: what the public site
 * says about its owner is a reviewed decision, and stale CMS rows have leaked
 * wrong details before.
 *
 * CONTENT RULE: every statement must be verifiable from the portfolio data
 * (db.json experiences/educations), the public project READMEs or siteConfig.
 * Neutral wording only — no availability, hiring or job-search language, and
 * nothing about employer work beyond what the resume already states.
 */

import { SITE_AUTHOR } from "./siteConfig.mjs";

export const ABOUT_TITLE = `About ${SITE_AUTHOR.name}`;

/** Under 160 characters. */
export const ABOUT_DESCRIPTION = `${SITE_AUTHOR.name} (Md Mahbub Alam) is a Software Engineer in Dhaka building backend systems, full-stack products and applied AI, including Bangla speech recognition.`;

/** Opening paragraphs. The first sentence is written to be quoted verbatim. */
export const ABOUT_INTRO = [
  `${SITE_AUTHOR.name} (Md Mahbub Alam) is a Software Engineer at ${SITE_AUTHOR.company} in ${SITE_AUTHOR.location}. He builds backend services and APIs, full-stack web applications and applied AI systems.`,
  "His professional work covers enterprise, healthcare, education, ERP and automation-focused systems. Outside of it, he builds open-source projects around speech recognition, local voice AI, link analytics and offline-first mobile apps.",
];

export const ABOUT_FOCUS = [
  {
    title: "Backend and platform engineering",
    text: "REST APIs, authentication and authorization, database design and background processing with Node.js, NestJS, Python/FastAPI and PHP/Laravel on PostgreSQL, MySQL, MongoDB and Redis.",
  },
  {
    title: "Full-stack products",
    text: "Web applications with React and Next.js, and mobile apps with React Native — from data model and API to the interface.",
  },
  {
    title: "Applied AI and speech",
    text: "Bangla and English automatic speech recognition with Whisper fine-tuning, and fully local voice assistants. His undergraduate thesis was on speech emotion recognition using deep learning.",
  },
  {
    title: "Deployment and operations",
    text: "Docker, Linux servers, Nginx, PM2 and Cloudflare — shipping applications to small, resource-constrained servers and keeping them observable and maintainable.",
  },
];

export const ABOUT_APPROACH = [
  "Find the root cause before changing code, and back decisions with evidence — logs, measurements and tests.",
  "Prefer the simplest design that will scale, and avoid complexity the problem does not need.",
  "Treat maintainability, security and observability as part of the feature, not follow-up work.",
];

/** From db.json `experiences` — titles and dates exactly as on the resume. */
export const ABOUT_CAREER = [
  {
    role: "Junior Software Engineer II",
    org: "Brotecs Technologies Ltd.",
    period: "March 2025 – Present",
    text: "Develops and maintains full-stack web applications and backend services with secure workflows, performance improvements, CI/CD and maintainable architecture.",
  },
  {
    role: "Junior Software Engineer I",
    org: "Brotecs Technologies Ltd.",
    period: "March 2024 – March 2025",
    text: "Built full-stack features, backend APIs, dashboards, authentication and authorization flows, reporting and integration workflows.",
  },
  {
    role: "Software Engineer Intern",
    org: "Brotecs Technologies Ltd.",
    period: "September 2023 – March 2024",
    text: "Worked on web application modules, bug fixes, UI flows and databases while learning production software practices.",
  },
];

/** From db.json `educations` (degree-level only). */
export const ABOUT_EDUCATION = {
  degree: "B.Sc. in Computer Science and Engineering",
  org: SITE_AUTHOR.alumniOf.name,
  period: "2019 – 2022",
  detail: "CGPA 3.70 / 4.00 · Thesis: Speech Emotion Recognition Using Deep Learning",
};

/** Topics added to Person.knowsAbout — each is backed by a project or the thesis. */
export const ABOUT_TOPICS = [
  "Automatic Speech Recognition",
  "Bangla Speech Recognition",
  "OpenAI Whisper",
  "Speech Emotion Recognition",
  "Voice Assistants",
  "React Native",
  "Offline-First Applications",
];
