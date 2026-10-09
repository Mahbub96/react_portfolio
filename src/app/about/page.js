import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { buildPageGraph, PERSON_ID } from "@/lib/seo/structuredData.mjs";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import { CASE_STUDIES } from "@/lib/seo/caseStudies.mjs";
import {
  ABOUT_TITLE,
  ABOUT_DESCRIPTION,
  ABOUT_INTRO,
  ABOUT_FOCUS,
  ABOUT_APPROACH,
  ABOUT_CAREER,
  ABOUT_EDUCATION,
} from "@/lib/seo/aboutProfile.mjs";
import styles from "./about.module.css";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), {
  ssr: true,
});

const Footer = NextDynamic(() => import("@/components/Footer"), {
  ssr: true,
});

const PATH = "/about/";

export const metadata = pageMetadata({
  path: PATH,
  title: `${ABOUT_TITLE} — ${SITE_AUTHOR.jobTitle}`,
  absoluteTitle: true,
  description: ABOUT_DESCRIPTION,
});

/** Case-study pages, so the About page links to every indexable project. */
const FEATURED = Object.entries(CASE_STUDIES).map(([slug, study]) => ({
  slug,
  title: study.title,
  summary: study.summary,
}));

export default function AboutPage() {
  const graph = buildPageGraph({
    path: PATH,
    name: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    type: "AboutPage",
    breadcrumb: [{ name: "About", path: PATH }],
    mainEntity: { "@id": PERSON_ID },
  });

  return (
    <div>
      <JsonLd data={graph} />

      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>About</p>
          <h1 className={styles.title}>{SITE_AUTHOR.name}</h1>
          <p className={styles.role}>
            {SITE_AUTHOR.jobTitle} · {SITE_AUTHOR.tagline} · {SITE_AUTHOR.location}
          </p>
          {ABOUT_INTRO.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className={styles.lead}>
              {paragraph}
            </p>
          ))}
        </header>

        <section className={styles.section} aria-labelledby="about-focus">
          <h2 id="about-focus" className={styles.heading}>
            Focus areas
          </h2>
          <div className={styles.grid}>
            {ABOUT_FOCUS.map((item) => (
              <article key={item.title} className={styles.card}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.text}>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-approach">
          <h2 id="about-approach" className={styles.heading}>
            Engineering approach
          </h2>
          <ul className={styles.bullets}>
            {ABOUT_APPROACH.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="about-projects">
          <h2 id="about-projects" className={styles.heading}>
            Selected projects
          </h2>
          <ul className={styles.projectList}>
            {FEATURED.map((project) => (
              <li key={project.slug}>
                <Link href={`/projects/${project.slug}/`} className={styles.projectLink}>
                  {project.title}
                </Link>
                <p className={styles.text}>{project.summary}</p>
              </li>
            ))}
          </ul>
          <p className={styles.text}>
            <Link href="/projects/">All projects</Link> ·{" "}
            <Link href="/skills/">Skills and where they are used</Link>
          </p>
        </section>

        <section className={styles.section} aria-labelledby="about-career">
          <h2 id="about-career" className={styles.heading}>
            Experience
          </h2>
          <ol className={styles.timeline}>
            {ABOUT_CAREER.map((step) => (
              <li key={step.role}>
                <h3 className={styles.cardTitle}>
                  {step.role} <span className={styles.muted}>· {step.org}</span>
                </h3>
                <p className={styles.period}>{step.period}</p>
                <p className={styles.text}>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="about-education">
          <h2 id="about-education" className={styles.heading}>
            Education
          </h2>
          <h3 className={styles.cardTitle}>
            {ABOUT_EDUCATION.degree}{" "}
            <span className={styles.muted}>· {ABOUT_EDUCATION.org}</span>
          </h3>
          <p className={styles.period}>{ABOUT_EDUCATION.period}</p>
          <p className={styles.text}>{ABOUT_EDUCATION.detail}</p>
        </section>

        <section className={styles.section} aria-labelledby="about-elsewhere">
          <h2 id="about-elsewhere" className={styles.heading}>
            Elsewhere
          </h2>
          <ul className={styles.links}>
            <li>
              <a href={SITE_AUTHOR.github} rel="me noopener noreferrer" target="_blank">
                GitHub
              </a>
            </li>
            <li>
              <a href={SITE_AUTHOR.linkedin} rel="me noopener noreferrer" target="_blank">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={SITE_AUTHOR.x} rel="me noopener noreferrer" target="_blank">
                X
              </a>
            </li>
            <li>
              <Link href="/resume/">Resume</Link>
            </li>
            <li>
              <Link href="/contact/">Contact</Link>
            </li>
          </ul>
        </section>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
