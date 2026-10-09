import Image from "next/image";
import Link from "next/link";
import { displayImage } from "@/lib/displayImage";

import styles from "./projectDetail.module.css";

/**
 * Presentational body of a project detail page.
 *
 * Heading outline: one h1 (the project), then h2 sections. When a case study
 * exists (lib/seo/caseStudies.mjs) the page reads as a standalone technical
 * write-up — problem, approach, features, decisions, stack — which is the
 * content that lets it rank on its own. Without one it falls back to the card
 * data and the route marks itself noindex.
 */

function Paragraphs({ items = [] }) {
  return items.map((text) => (
    <p key={text.slice(0, 40)} className={styles.body}>
      {text}
    </p>
  ));
}

function Bullets({ items = [] }) {
  return (
    <ul className={styles.bulletList}>
      {items.map((text) => (
        <li key={text.slice(0, 40)}>{text}</li>
      ))}
    </ul>
  );
}

export default function ProjectDetail({ project, caseStudy = null }) {
  if (!project) return null;

  const { name, description, image, stack, githubUrl, liveUrl, downloadUrl } =
    project;

  const links = [
    githubUrl && { href: githubUrl, label: "View source on GitHub" },
    liveUrl && { href: liveUrl, label: "Visit live site" },
    downloadUrl && { href: downloadUrl, label: "Download" },
  ].filter(Boolean);

  const title = caseStudy?.headline || name;
  const intro = caseStudy?.summary || description;
  const stackGroups = caseStudy?.stackGroups
    ? Object.entries(caseStudy.stackGroups)
    : null;

  return (
    <article className={styles.wrapper}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/projects/">Projects</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{name}</span>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {intro ? <p className={styles.description}>{intro}</p> : null}
      </header>

      {image ? (
        <div className={styles.imageFrame}>
          <Image
            src={displayImage(image)}
            alt={`${name} — project screenshot`}
            width={1024}
            height={576}
            sizes="(max-width: 900px) 100vw, 900px"
            priority
          />
        </div>
      ) : null}

      {caseStudy?.problem?.length ? (
        <section className={styles.section} aria-labelledby="problem-heading">
          <h2 id="problem-heading" className={styles.sectionTitle}>
            The problem
          </h2>
          <Paragraphs items={caseStudy.problem} />
        </section>
      ) : null}

      {caseStudy?.approach?.length ? (
        <section className={styles.section} aria-labelledby="approach-heading">
          <h2 id="approach-heading" className={styles.sectionTitle}>
            Architecture and approach
          </h2>
          <Bullets items={caseStudy.approach} />
        </section>
      ) : null}

      {caseStudy?.features?.length ? (
        <section className={styles.section} aria-labelledby="features-heading">
          <h2 id="features-heading" className={styles.sectionTitle}>
            Key features
          </h2>
          <Bullets items={caseStudy.features} />
        </section>
      ) : null}

      {caseStudy?.decisions?.length ? (
        <section className={styles.section} aria-labelledby="decisions-heading">
          <h2 id="decisions-heading" className={styles.sectionTitle}>
            Engineering decisions
          </h2>
          <Bullets items={caseStudy.decisions} />
        </section>
      ) : null}

      {stackGroups ? (
        <section className={styles.section} aria-labelledby="tech-heading">
          <h2 id="tech-heading" className={styles.sectionTitle}>
            Technology stack
          </h2>
          <dl className={styles.stackGroups}>
            {stackGroups.map(([group, items]) => (
              <div key={group} className={styles.stackGroup}>
                <dt>{group}</dt>
                <dd>
                  <ul className={styles.stackList}>
                    {items.map((tech) => (
                      <li key={tech} className={styles.stackItem}>
                        {tech}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : stack?.length ? (
        <section className={styles.section} aria-labelledby="tech-heading">
          <h2 id="tech-heading" className={styles.sectionTitle}>
            Technology stack
          </h2>
          <ul className={styles.stackList}>
            {stack.map((tech) => (
              <li key={tech} className={styles.stackItem}>
                {tech}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {links.length ? (
        <section className={styles.section} aria-labelledby="links-heading">
          <h2 id="links-heading" className={styles.sectionTitle}>
            Links
          </h2>
          <div className={styles.linkRow}>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={styles.linkButton}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <footer className={styles.backRow}>
        <Link href="/projects/" className={styles.backLink}>
          ← All projects
        </Link>
      </footer>
    </article>
  );
}
