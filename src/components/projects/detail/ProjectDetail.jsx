import React from "react";
import Image from "next/image";
import { displayImage } from "@/lib/displayImage";
import styles from "@/components/page/page.module.css";
import { Breadcrumb } from "@/components/page/PageHeader";
import CaseToc from "@/components/page/CaseToc";
import { CASE_DIAGRAMS } from "@/components/home/CaseDiagrams";

/**
 * Presentational body of a project detail page.
 *
 * Heading outline: one h1 (the project), then h2 sections. When a case study
 * exists (lib/seo/caseStudies.mjs) the page reads as a standalone technical
 * write-up — problem, approach, features, decisions, stack — which is the
 * content that lets it rank on its own. Without one it falls back to the card
 * data and the route marks itself noindex.
 */

const META_GROUPS = 4;
const META_ITEMS = 3;

function plain(tech = "") {
  return String(tech).replace(/\s*\(.*\)$/, "");
}

function toneFor(category = "") {
  if (/local/i.test(category)) return styles.cat_local;
  if (/mobile/i.test(category)) return styles.cat_mobile;
  if (/ai|speech/i.test(category)) return styles.cat_ai;
  return styles.cat_backend;
}

function Section({ id, index, title, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>
        <span className={styles.mono}>{String(index).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ProjectDetail({ project, caseStudy = null, next = null }) {
  if (!project) return null;

  const { name, description, image, stack = [], githubUrl, liveUrl, downloadUrl } = project;
  const shortTitle = String(name).split(/\s+[\u2013\u2014:]\s+/)[0];

  const links = [
    githubUrl && { href: githubUrl, label: "GitHub ↗" },
    liveUrl && { href: liveUrl, label: "Live site ↗" },
    downloadUrl && { href: downloadUrl, label: "Download ↗" },
  ].filter(Boolean);

  const title = caseStudy?.headline || name;
  const intro = caseStudy?.summary || description;
  const category = caseStudy?.highlight?.category;
  const stackGroups = caseStudy?.stackGroups
    ? Object.entries(caseStudy.stackGroups)
    : stack.length
      ? [["Stack", stack]]
      : [];
  const diagram = CASE_DIAGRAMS[project.slug];

  const sections = [
    caseStudy?.problem?.length && { id: "problem", label: "Problem", title: "The problem" },
    caseStudy?.approach?.length && {
      id: "architecture",
      label: "Architecture",
      title: "Architecture and approach",
    },
    caseStudy?.features?.length && { id: "features", label: "Features", title: "Key features" },
    caseStudy?.decisions?.length && {
      id: "decisions",
      label: "Decisions",
      title: "Engineering decisions",
    },
    stackGroups.length && { id: "stack", label: "Stack", title: "Technology stack" },
  ].filter(Boolean);

  const body = {
    problem: () =>
      caseStudy.problem.map((text) => <p key={text.slice(0, 40)}>{text}</p>),
    architecture: () => (
      <>
        {diagram && (
          <figure className={styles.diagram}>
            <figcaption className={styles.diagramHead}>
              <span>{diagram.label}</span>
              <span>{diagram.note}</span>
            </figcaption>
            <diagram.Component />
          </figure>
        )}
        <ol className={styles.steps}>
          {caseStudy.approach.map((text) => (
            <li key={text.slice(0, 40)}>{text}</li>
          ))}
        </ol>
      </>
    ),
    features: () => (
      <ul className={styles.feat}>
        {caseStudy.features.map((text) => (
          <li key={text.slice(0, 40)}>{text}</li>
        ))}
      </ul>
    ),
    decisions: () => (
      <ol className={styles.decisions}>
        {caseStudy.decisions.map((text, index) => (
          <li key={text.slice(0, 40)}>
            <b>DECISION {String(index + 1).padStart(2, "0")}</b>
            {text}
          </li>
        ))}
      </ol>
    ),
    stack: () => (
      <dl className={styles.stackGrid}>
        {stackGroups.map(([group, items]) => (
          <div key={group}>
            <dt>{group}</dt>
            <dd>
              <ul className={styles.chips}>
                {items.map((tech) => (
                  <li key={tech} className={styles.chip}>
                    {tech}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    ),
  };

  return (
    <article>
      <header className={styles.phead}>
        <div className={styles.wrap}>
          <Breadcrumb
            crumbs={[
              { name: "Projects", href: "/projects/" },
              { name: shortTitle, href: `/projects/${project.slug}/` },
            ]}
          />
          <div className={styles.caseHead}>
            <div>
              {category && <span className={`${styles.cat} ${toneFor(category)}`}>{category}</span>}
              <h1 className={styles.title}>{title}</h1>
              {intro && <p className={styles.lead}>{intro}</p>}
            </div>
            {(stackGroups.length > 0 || links.length > 0) && (
              <aside className={styles.meta} aria-label="Project facts">
                {stackGroups.length > 0 && (
                  <dl>
                    {stackGroups.slice(0, META_GROUPS).map(([group, items]) => (
                      <React.Fragment key={group}>
                        <dt>{group}</dt>
                        <dd>{items.slice(0, META_ITEMS).map(plain).join(", ")}</dd>
                      </React.Fragment>
                    ))}
                  </dl>
                )}
                {links.length > 0 && (
                  <div className={styles.btns}>
                    {links.map((link, index) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className={`${styles.btn} ${index === 0 ? styles.btnPrimary : ""}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </aside>
            )}
          </div>
          {image && (
            <div className={styles.heroShot}>
              <Image
                src={displayImage(image)}
                alt={`${shortTitle} — project screenshot`}
                width={1024}
                height={576}
                sizes="(max-width: 1240px) 100vw, 1160px"
                priority
              />
            </div>
          )}
        </div>
      </header>

      {sections.length > 0 && (
        <section className={styles.sec} aria-label="Case study">
          <div className={`${styles.wrap} ${styles.body}`}>
            {sections.length > 1 ? (
              <CaseToc sections={sections.map(({ id, label }) => ({ id, label }))} />
            ) : (
              <span />
            )}
            <div className={styles.cs}>
              {sections.map((section, index) => (
                <Section key={section.id} id={section.id} index={index + 1} title={section.title}>
                  {body[section.id]()}
                </Section>
              ))}
            </div>
          </div>
        </section>
      )}

      <nav className={`${styles.sec} ${styles.tint}`} aria-label="More projects">
        <div className={`${styles.wrap} ${styles.next}`}>
          <a href="/projects/">
            <small>← ALL PROJECTS</small>
            <b>Back to projects</b>
          </a>
          {next && (
            <a href={next.href} className={styles.nextRight}>
              <small>NEXT CASE STUDY →</small>
              <b>{next.name}</b>
            </a>
          )}
        </div>
      </nav>
    </article>
  );
}
