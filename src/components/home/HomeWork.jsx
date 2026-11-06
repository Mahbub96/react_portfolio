import React from "react";
import styles from "./home.module.css";
import SectionHead from "./SectionHead";
import { ItemAdmin, AddItem } from "./HomeAdmin";
import { SectionAdminProvider } from "@/components/admin/contextual/PortfolioContextualControls";
import { buildProjectCatalog, projectPath } from "@/lib/seo/projectCatalog.mjs";
import { caseStudyFor } from "@/lib/seo/caseStudies.mjs";
import { CASE_DIAGRAMS } from "./CaseDiagrams";
import WorkAccordion from "./WorkAccordion";
import { displayImage, thumbImage } from "@/lib/displayImage";

/**
 * Selected work as an FAQ-style list: every project is a row, one open at a
 * time, with a screenshot thumbnail while it is closed. Projects with a
 * written case study open to problem → design → trade-off; the right side
 * shows the architecture diagram when there is one, otherwise the full
 * screenshot. All copy comes from caseStudies.mjs / the CMS.
 */
const DIAGRAMS = CASE_DIAGRAMS;

const MAX_STACK = 7;
// The homepage lists a handful of projects; the full set lives on /projects/.
const MAX_ROWS = 6;

export default function HomeWork({ projects = [] }) {
  const rawById = new Map(projects.filter(Boolean).map((p) => [String(p.id), p]));
  const catalog = buildProjectCatalog(projects).map((project) => ({
    ...project,
    raw: rawById.get(String(project.id)) || project,
    study: caseStudyFor(project.slug),
  }));

  // Case studies with a diagram first, then other case studies, then the rest.
  const rank = (p) => (p.study?.highlight ? (DIAGRAMS[p.slug] ? 0 : 1) : 2);
  const shown = [...catalog].sort((a, b) => rank(a) - rank(b)).slice(0, MAX_ROWS);

  const items = shown.map((project) => {
    const h = project.study?.highlight;
    return {
      key: project.slug,
      name: shortName(project.name),
      summary: h?.tagline || project.description,
      meta: h?.category || project.stack.slice(0, 2).join(" · "),
      thumb: project.image ? thumbImage(project.image) : null,
      admin: <ItemAdmin collection="Projects" item={project.raw} />,
      panel: h ? <CasePanel project={project} /> : <ProjectPanel project={project} />,
    };
  });

  return (
    <section id="projects" className={styles.section} aria-labelledby="work-heading">
      <div className={styles.wrap}>
        <SectionHead
          index="02"
          kicker="Selected work"
          id="work-heading"
          title="Case studies: the problem, the design, the trade-offs."
          intro="Each project is described from its public repository: the architecture and the decisions behind it, as well as the stack."
        />

        <SectionAdminProvider collectionName="Projects">
          {items.length > 0 && <WorkAccordion items={items} />}
          <AddItem collection="Projects" label="Project" />
        </SectionAdminProvider>

        <p className={styles.sectionFoot}>
          <a href="/projects/">All {catalog.length} projects →</a>
        </p>
      </div>
    </section>
  );
}

function shortName(name = "") {
  return String(name).split(/\s+[\u2013\u2014]\s+/)[0];
}

function Chips({ items }) {
  return (
    <span className={styles.chips}>
      {items.map((tech) => (
        <span key={tech} className={styles.chip}>
          {tech}
        </span>
      ))}
    </span>
  );
}

function Links({ project, label }) {
  return (
    <div className={styles.caseLinks}>
      <a href={projectPath(project)}>{label} →</a>
      {project.githubUrl && (
        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
      )}
    </div>
  );
}

/** Case study: problem → design → trade-off, with the diagram when there is one. */
function CasePanel({ project }) {
  const { study } = project;
  const h = study.highlight;
  const diagram = DIAGRAMS[project.slug];
  const stack = Object.values(study.stackGroups || {}).flat().slice(0, MAX_STACK);
  const Diagram = diagram?.Component;
  const split = diagram || project.image;

  return (
    <div className={`${styles.accBody} ${split ? styles.accBodySplit : ""}`}>
      <div className={styles.accText}>
        <dl className={styles.caseFacts}>
          <dt>Problem</dt>
          <dd>{h.problem}</dd>
          <dt>Design</dt>
          <dd>{h.design}</dd>
          <dt>{h.decisionLabel || "Decision"}</dt>
          <dd>{h.decision}</dd>
          <dt>Stack</dt>
          <dd>
            <Chips items={stack.length ? stack : project.stack.slice(0, MAX_STACK)} />
          </dd>
        </dl>
        <Links project={project} label="Read case study" />
      </div>
      {diagram ? (
        <div className={styles.caseViz}>
          <p className={styles.vizHead}>
            <span>{diagram.label}</span>
            <span>{diagram.note}</span>
          </p>
          <Diagram />
        </div>
      ) : (
        project.image && <Shot project={project} />
      )}
    </div>
  );
}

/** Full screenshot in an open row (lazy: only fetched once a row is near). */
function Shot({ project }) {
  return (
    <figure className={styles.accShot}>
      <img
        src={displayImage(project.image)}
        alt={`${shortName(project.name)} screenshot`}
        width={1024}
        height={576}
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
}

/** Project without a written case study: description and stack. */
function ProjectPanel({ project }) {
  return (
    <div className={`${styles.accBody} ${project.image ? styles.accBodySplit : ""}`}>
      <div className={styles.accText}>
        <p className={styles.accDesc}>{project.description}</p>
        <dl className={styles.caseFacts}>
          <dt>Stack</dt>
          <dd>
            <Chips items={project.stack.slice(0, MAX_STACK)} />
          </dd>
        </dl>
        <Links project={project} label="View project" />
      </div>
      {project.image && <Shot project={project} />}
    </div>
  );
}
