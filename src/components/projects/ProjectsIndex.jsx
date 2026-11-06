import React from "react";
import Image from "next/image";
import styles from "@/components/page/page.module.css";
import PageHeader from "@/components/page/PageHeader";
import StudyFilter from "@/components/page/StudyFilter";
import { ItemAdmin, AddItem } from "@/components/home/HomeAdmin";
import { SectionAdminProvider } from "@/components/admin/contextual/PortfolioContextualControls";
import { buildProjectCatalog, projectPath } from "@/lib/seo/projectCatalog.mjs";
import { caseStudyFor } from "@/lib/seo/caseStudies.mjs";
import { displayImage } from "@/lib/displayImage";

/**
 * /projects/ — case studies first (problem → design → decision, from
 * caseStudies.mjs), then every other project as a compact card. Counts are
 * derived from the data; no copy is invented here.
 */

const MAX_STUDY_TECH = 4;
const MAX_CARD_TECH = 3;

export function shortName(name = "") {
  return String(name).split(/\s+[\u2013\u2014:]\s+/)[0].trim() || name;
}

/** "Applied AI · Speech" → { key: "applied-ai", label: "Applied AI" } */
function primaryCategory(category = "") {
  const label = String(category).split("·")[0].trim();
  return label ? { key: label.toLowerCase().replace(/\s+/g, "-"), label } : null;
}

/** Badge tone per category, matching the homepage legend colours. */
function toneFor(category = "") {
  if (/local/i.test(category)) return styles.cat_local;
  if (/mobile/i.test(category)) return styles.cat_mobile;
  if (/ai|speech/i.test(category)) return styles.cat_ai;
  return styles.cat_backend;
}

export default function ProjectsIndex({ projects = [] }) {
  const rawById = new Map(projects.filter(Boolean).map((p) => [String(p.id), p]));
  const catalog = buildProjectCatalog(projects).map((project) => ({
    ...project,
    raw: rawById.get(String(project.id)) || project,
    study: caseStudyFor(project.slug),
  }));

  const studies = catalog.filter((p) => p.study);
  const rest = catalog.filter((p) => !p.study);
  const withSource = catalog.filter((p) => p.githubUrl).length;

  const filters = [];
  for (const project of studies) {
    const cat = primaryCategory(project.study.highlight?.category);
    if (cat && !filters.some((f) => f.key === cat.key)) filters.push(cat);
  }

  return (
    <>
      <PageHeader
        crumbs={[{ name: "Projects", href: "/projects/" }]}
        title="Projects"
        lead="Backend platforms, applied AI and speech recognition, and full-stack and mobile apps. Projects with a case study explain the problem, the design and the trade-offs."
      >
        <dl className={styles.stats}>
          <div>
            <dt>{catalog.length}</dt>
            <dd>Projects</dd>
          </div>
          <div>
            <dt>{studies.length}</dt>
            <dd>Case studies</dd>
          </div>
          <div>
            <dt>{withSource}</dt>
            <dd>Source on GitHub</dd>
          </div>
        </dl>
      </PageHeader>

      <SectionAdminProvider collectionName="Projects">
        {studies.length > 0 && (
          <section className={styles.sec} aria-labelledby="studies-heading">
            <div className={styles.wrap}>
              <StudyFilter
                head={
                  <div>
                    <p className={styles.kicker}>01 — Case studies</p>
                    <h2 id="studies-heading">Built end-to-end, documented in depth.</h2>
                  </div>
                }
                filters={filters}
                items={studies.map((project, index) => ({
                  key: project.slug,
                  cats: [primaryCategory(project.study.highlight?.category)?.key].filter(Boolean),
                  node: <StudyCard project={project} priority={index === 0} />,
                }))}
              />
            </div>
          </section>
        )}

        <section className={`${styles.sec} ${styles.tint}`} aria-labelledby="more-heading">
          <div className={styles.wrap}>
            <div className={styles.sh}>
              <div>
                <p className={styles.kicker}>{studies.length > 0 ? "02" : "01"} — More work</p>
                <h2 id="more-heading">Professional and earlier projects.</h2>
              </div>
            </div>
            {rest.length > 0 ? (
              <ul className={styles.grid3}>
                {rest.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>Every project currently has a case study above.</p>
            )}
            <AddItem collection="Projects" label="Project" />
          </div>
        </section>
      </SectionAdminProvider>
    </>
  );
}

function StudyCard({ project, priority = false }) {
  const { study } = project;
  const h = study.highlight || {};
  const category = h.category || "Case study";
  const decision = h.decision || study.decisions?.[0];
  const stack = Object.values(study.stackGroups || {}).flat();
  const tech = (stack.length ? stack : project.stack).slice(0, MAX_STUDY_TECH);
  const title = study.headline.split(" — ")[0];

  return (
    <article className={styles.study} aria-labelledby={`study-${project.slug}`}>
      <ItemAdmin collection="Projects" item={project.raw} />
      {project.image && (
        <div className={styles.shot}>
          <Image
            src={displayImage(project.image)}
            alt={`${title} — architecture overview`}
            width={1024}
            height={576}
            sizes="(max-width: 860px) 100vw, 380px"
            priority={priority}
          />
        </div>
      )}
      <div className={styles.studyText}>
        <div className={styles.studyTop}>
          <span className={`${styles.cat} ${toneFor(category)}`}>{category}</span>
          <span className={styles.mono}>CASE STUDY</span>
        </div>
        <h3 id={`study-${project.slug}`}>
          <a href={projectPath(project)}>{title}</a>
        </h3>
        <p>{h.tagline || study.summary}</p>
        {decision && (
          <p className={styles.dec}>
            <b>{h.decisionLabel || "Decision"}</b>
            {decision}
          </p>
        )}
        <div className={styles.studyFoot}>
          <ul className={styles.chips} aria-label="Stack">
            {tech.map((t) => (
              <li key={t} className={styles.chip}>
                {t.replace(/\s*\(.*\)$/, "")}
              </li>
            ))}
          </ul>
          <span className={styles.go} aria-hidden="true">
            Read case study →
          </span>
        </div>
      </div>
    </article>
  );
}

function ProjectCard({ project }) {
  const name = shortName(project.name);
  return (
    <li className={styles.pcard}>
      <ItemAdmin collection="Projects" item={project.raw} />
      <div className={styles.pcardImg}>
        {project.image && (
          <Image
            src={displayImage(project.image)}
            alt={`${name} — project screenshot`}
            width={1024}
            height={576}
            sizes="(max-width: 860px) 100vw, 380px"
            loading="lazy"
          />
        )}
      </div>
      <div className={styles.pcardBody}>
        <h3>
          <a href={projectPath(project)}>{project.name}</a>
        </h3>
        {project.description && <p>{project.description}</p>}
        {project.stack.length > 0 && (
          <ul className={styles.chips} aria-label="Stack">
            {project.stack.slice(0, MAX_CARD_TECH).map((t) => (
              <li key={t} className={styles.chip}>
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
