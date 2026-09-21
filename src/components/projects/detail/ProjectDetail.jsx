import Image from "next/image";
import Link from "next/link";

import { projectPath } from "@/lib/seo/projectCatalog.mjs";
import styles from "./projectDetail.module.css";

/**
 * Presentational body of a project detail page.
 *
 * Kept as its own component so the route file stays focused on data loading
 * and metadata, and so this markup can be reused (e.g. in a future modal or
 * print view) without dragging the page's SEO concerns along with it.
 *
 * Headings are deliberately a single h1 followed by h2 sections: the detail
 * page is the canonical document for this project, so its heading outline
 * should read as a standalone article rather than a card inside a list.
 */
export default function ProjectDetail({ project }) {
  if (!project) return null;

  const { name, description, image, stack, githubUrl, liveUrl, downloadUrl } =
    project;

  const links = [
    githubUrl && { href: githubUrl, label: "View source", external: true },
    liveUrl && { href: liveUrl, label: "Visit live site", external: true },
    downloadUrl && { href: downloadUrl, label: "Download", external: true },
  ].filter(Boolean);

  return (
    <article className={styles.wrapper} itemScope itemType="https://schema.org/SoftwareSourceCode">
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/projects/">Projects</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{name}</span>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title} itemProp="name">
          {name}
        </h1>
        {description ? (
          <p className={styles.description} itemProp="description">
            {description}
          </p>
        ) : null}
      </header>

      {image ? (
        <div className={styles.imageFrame}>
          <Image
            src={image}
            alt={`${name} — project screenshot`}
            width={1200}
            height={675}
            sizes="(max-width: 900px) 100vw, 900px"
            priority
            itemProp="image"
          />
        </div>
      ) : null}

      {stack?.length ? (
        <section className={styles.section} aria-labelledby="tech-heading">
          <h2 id="tech-heading" className={styles.sectionTitle}>
            Technology stack
          </h2>
          <ul className={styles.stackList}>
            {stack.map((tech) => (
              <li key={tech} className={styles.stackItem} itemProp="programmingLanguage">
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
