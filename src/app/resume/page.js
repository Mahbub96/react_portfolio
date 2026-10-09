import { getPortfolioData } from "@/lib/getPortfolioData";
import { buildCV } from "@/lib/cvBuilder";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { buildPageGraph } from "@/lib/seo/structuredData.mjs";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import PrintButton from "./PrintButton";
import styles from "./resume.module.css";

// Rebuild hourly; the CV only changes when the portfolio data changes.
export const revalidate = 3600;

/**
 * Goes through getPortfolioData() like every other page, so the resume falls
 * back to db.json instead of rendering empty when MongoDB is unreachable.
 * Public identity fields are pinned to the SEO site config: no phone number
 * is published and only the one public email address is shown.
 */
async function getCV() {
  try {
    const portfolio = await getPortfolioData();
    const cv = buildCV(portfolio);
    return {
      ...cv,
      profile: {
        ...cv.profile,
        name: SITE_AUTHOR.name,
        email: SITE_AUTHOR.email,
        phone: "",
        website: "https://mahbub.dev/",
        linkedin: SITE_AUTHOR.linkedin,
        github: SITE_AUTHOR.github,
      },
    };
  } catch (error) {
    console.error("Error loading CV data:", error);
    return null;
  }
}

const TITLE = "Resume";
const DESCRIPTION = `Resume of ${SITE_AUTHOR.name}, ${SITE_AUTHOR.jobTitle} at ${SITE_AUTHOR.company}: experience, skills, projects and education in backend, full-stack and applied AI.`;

export const metadata = pageMetadata({
  path: "/resume/",
  title: TITLE,
  description: DESCRIPTION,
  ogType: "profile",
});

function stripProtocol(url = "") {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export default async function ResumePage() {
  const cv = await getCV();

  if (!cv) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.sheet}>
          <p className={styles.empty}>
            Resume data is temporarily unavailable. Please try again shortly.
          </p>
        </div>
      </div>
    );
  }

  const { profile, summary, experience, experiences, education, skillGroups, projects } = cv;

  const graph = buildPageGraph({
    path: "/resume/",
    name: `${TITLE} — ${SITE_AUTHOR.name}`,
    description: DESCRIPTION,
    type: "ProfilePage",
    breadcrumb: [{ name: TITLE, path: "/resume/" }],
  });

  return (
    <div className={styles.wrapper}>
      <JsonLd data={graph} />
      <div className={styles.toolbar}>
        <p className={styles.toolbarNote}>
          Generated from live portfolio data
          {experience.label ? ` · ${experience.label} of experience` : ""}
          {" · "}Use “Save as PDF” in the print dialog.
        </p>
        <PrintButton />
      </div>

      <article className={styles.sheet}>
        {/* ---------- Header ---------- */}
        <header className={styles.header}>
          <h1 className={styles.name}>{profile.name}</h1>
          {profile.title && <p className={styles.title}>{profile.title}</p>}

          <div className={styles.contactRow}>
            {profile.location && <span>{profile.location}</span>}
            {profile.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
            {profile.website && (
              <a href={profile.website}>{stripProtocol(profile.website)}</a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin}>{stripProtocol(profile.linkedin)}</a>
            )}
            {profile.github && <a href={profile.github}>{stripProtocol(profile.github)}</a>}
          </div>
        </header>

        {/* ---------- Summary ---------- */}
        {summary && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Professional Summary</h2>
            <p className={styles.summary}>{summary}</p>
          </section>
        )}

        {/* ---------- Skills ---------- */}
        {skillGroups.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Technical Skills</h2>
            <div className={styles.skillGrid}>
              {skillGroups.map(({ group, items }) => (
                <div key={group} style={{ display: "contents" }}>
                  <span className={styles.skillGroup}>{group}</span>
                  <span className={styles.skillItems}>{items.join(" · ")}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------- Experience ---------- */}
        {experiences.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Professional Experience
              {experience.label ? ` — ${experience.label}` : ""}
            </h2>
            {experiences.map((exp, i) => (
              <div className={styles.entry} key={`${exp.title}-${i}`}>
                <div className={styles.entryHead}>
                  <h3 className={styles.entryTitle}>{exp.title}</h3>
                  {exp.period && <span className={styles.entryPeriod}>{exp.period}</span>}
                </div>
                {exp.company && (
                  <p className={styles.entrySub}>
                    {exp.companyUrl ? (
                      <a href={exp.companyUrl}>{exp.company}</a>
                    ) : (
                      exp.company
                    )}
                  </p>
                )}
                {exp.description && <p className={styles.entryBody}>{exp.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* ---------- Projects (AI-flagged first) ---------- */}
        {projects.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Selected Projects</h2>
            {projects.map((project, i) => (
              <div className={styles.entry} key={`${project.name}-${i}`}>
                <div className={styles.projectHead}>
                  <h3 className={styles.entryTitle}>{project.name}</h3>
                  {project.isAI && <span className={styles.aiTag}>AI</span>}
                  {project.githubUrl && (
                    <a className={styles.projectLink} href={project.githubUrl}>
                      source
                    </a>
                  )}
                  {project.liveUrl && (
                    <a className={styles.projectLink} href={project.liveUrl}>
                      live
                    </a>
                  )}
                </div>
                {project.description && (
                  <p className={styles.entryBody}>{project.description}</p>
                )}
                {project.stack.length > 0 && (
                  <p className={styles.stack}>{project.stack.join(" · ")}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ---------- Education ---------- */}
        {education.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Education</h2>
            {education.map((edu, i) => (
              <div className={styles.entry} key={`${edu.institution}-${i}`}>
                <div className={styles.entryHead}>
                  <h3 className={styles.entryTitle}>
                    {edu.degree}
                    {edu.department ? ` — ${edu.department}` : ""}
                  </h3>
                  {edu.period && <span className={styles.entryPeriod}>{edu.period}</span>}
                </div>
                <p className={styles.entrySub}>{edu.institution}</p>
                {(edu.cgpa || edu.thesis) && (
                  <p className={styles.entryMeta}>
                    {edu.cgpa && <>CGPA {edu.cgpa}</>}
                    {edu.cgpa && edu.thesis && " · "}
                    {edu.thesis && <>Thesis: {edu.thesis}</>}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}
      </article>
    </div>
  );
}
