import React from "react";
import styles from "./home.module.css";
import SectionHead from "./SectionHead";
import { ItemAdmin, AddItem } from "./HomeAdmin";
import { SectionAdminProvider } from "@/components/admin/contextual/PortfolioContextualControls";
import { buildProjectCatalog, projectPath } from "@/lib/seo/projectCatalog.mjs";
import { caseStudyFor } from "@/lib/seo/caseStudies.mjs";

/**
 * Selected work. Projects that have a written case study AND a diagram get a
 * full problem → design → trade-off card; every other project is a compact
 * row. All copy comes from caseStudies.mjs / the CMS — nothing invented here.
 */
const DIAGRAMS = {
  linklens: { label: "REQUEST PATH", note: "read ≠ write", Component: RequestPathDiagram },
  "bangla-and-english-asr-studio": {
    label: "GUARDED TRAINING WORKFLOW",
    note: "fixed test split",
    Component: TrainingWorkflowDiagram,
  },
};

const MAX_LIST_TECH = 3;
// The homepage lists a few more projects; the full set lives on /projects/.
const MAX_LIST_ROWS = 4;

export default function HomeWork({ projects = [] }) {
  const rawById = new Map(projects.filter(Boolean).map((p) => [String(p.id), p]));
  const catalog = buildProjectCatalog(projects).map((project) => ({
    ...project,
    raw: rawById.get(String(project.id)) || project,
    study: caseStudyFor(project.slug),
  }));

  const featured = catalog.filter((p) => p.study?.highlight && DIAGRAMS[p.slug]);
  const rest = catalog.filter((p) => !featured.includes(p)).slice(0, MAX_LIST_ROWS);

  return (
    <section id="projects" className={styles.section} aria-labelledby="work-heading">
      <div className={styles.wrap}>
        <SectionHead
          index="02"
          kicker="Selected work"
          id="work-heading"
          title="Case studies: the problem, the design, the trade-offs."
          intro="Each project is described from its public repository — architecture and decisions, not just a stack list."
        />

        <SectionAdminProvider collectionName="Projects">
          {featured.map((project) => (
            <CaseCard key={project.slug} project={project} />
          ))}

          {rest.length > 0 && (
            <ul className={styles.workList} aria-label="More projects">
              {rest.map((project, index) => (
                <li key={project.slug} className={styles.workRow}>
                  <ItemAdmin collection="Projects" item={project.raw} />
                  <span className={styles.mono}>
                    {String(featured.length + index + 1).padStart(2, "0")}
                  </span>
                  <h3>
                    <a href={projectPath(project)}>{shortName(project.name)}</a>
                  </h3>
                  <p>{project.description}</p>
                  <div className={styles.chips}>
                    {project.stack.slice(0, MAX_LIST_TECH).map((tech) => (
                      <span key={tech} className={styles.chip}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  <span className={styles.rowArrow} aria-hidden="true">
                    ↗
                  </span>
                </li>
              ))}
            </ul>
          )}

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

function CaseCard({ project }) {
  const { study } = project;
  const h = study.highlight;
  const diagram = DIAGRAMS[project.slug];
  const stack = Object.values(study.stackGroups || {}).flat().slice(0, 7);
  const Diagram = diagram.Component;

  return (
    <article className={styles.case} aria-labelledby={`case-${project.slug}`}>
      <ItemAdmin collection="Projects" item={project.raw} />
      <div className={styles.caseText}>
        <p className={styles.caseCategory}>{h.category}</p>
        <h3 id={`case-${project.slug}`}>{study.headline.split(" — ")[0]}</h3>
        <p className={styles.caseTagline}>{h.tagline}</p>
        <dl className={styles.caseFacts}>
          <dt>Problem</dt>
          <dd>{h.problem}</dd>
          <dt>Design</dt>
          <dd>{h.design}</dd>
          <dt>{h.decisionLabel || "Decision"}</dt>
          <dd>{h.decision}</dd>
          <dt>Stack</dt>
          <dd className={styles.chips}>
            {stack.map((tech) => (
              <span key={tech} className={styles.chip}>
                {tech}
              </span>
            ))}
          </dd>
        </dl>
        <div className={styles.caseLinks}>
          <a href={projectPath(project)}>Read case study →</a>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
          )}
        </div>
      </div>
      <div className={styles.caseViz}>
        <p className={styles.vizHead}>
          <span>{diagram.label}</span>
          <span>{diagram.note}</span>
        </p>
        <Diagram />
      </div>
    </article>
  );
}

function Flow({ nodes }) {
  return (
    <div className={styles.flowRow}>
      {nodes.map(([title, sub], index) => (
        <React.Fragment key={title}>
          {index > 0 && <span className={styles.flowArrow} aria-hidden="true" />}
          <div className={styles.flowNode}>
            <b>{title}</b>
            <span>{sub}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/** LinkLens: the redirect never waits on analytics (from the case study). */
function RequestPathDiagram() {
  return (
    <div className={styles.lanes}>
      <div className={`${styles.lane} ${styles.laneHot}`}>
        <span className={styles.laneLabel}>HOT PATH · USER WAITS</span>
        <Flow
          nodes={[
            ["Click", "/:slug"],
            ["NestJS", "redirect engine"],
            ["Redis", "link rules"],
            ["Redirect", "to target"],
          ]}
        />
      </div>
      <p className={styles.laneSplit}>
        <i />
        publish event · non-blocking
        <i />
      </p>
      <div className={`${styles.lane} ${styles.laneCold}`}>
        <span className={styles.laneLabel}>COLD PATH · ASYNC</span>
        <Flow
          nodes={[
            ["BullMQ", "queue"],
            ["Workers", "geo · device"],
            ["ClickHouse", "analytics"],
            ["Dashboards", "live feed"],
          ]}
        />
      </div>
    </div>
  );
}

/** ASR Studio: the guarded fine-tuning workflow (from the case study). */
function TrainingWorkflowDiagram() {
  const steps = [
    "Back up model",
    "Baseline WER/CER",
    "LoRA fine-tune",
    "Re-evaluate",
    "Side-by-side diff",
    "Confusion analysis",
  ];
  return (
    <div>
      <ol className={styles.pipe}>
        {steps.map((step, index) => (
          <li key={step} className={index === 2 ? styles.pipeKey : undefined}>
            <span>STEP {index + 1}</span>
            <b>{step}</b>
          </li>
        ))}
      </ol>
      <div className={styles.verdict}>
        <span className={styles.verdictGood}>New better</span>
        <span>Mixed</span>
        <span className={styles.verdictWarn}>Old better</span>
      </div>
      <p className={styles.gate}>
        <span>GATE</span>A person decides before any model is replaced.
      </p>
    </div>
  );
}
