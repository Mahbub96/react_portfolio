import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";
import { buildCV } from "@/lib/cvBuilder";
import { canonicalFor } from "@/lib/seo/urls.mjs";
import PrintButton from "./PrintButton";
import styles from "./resume.module.css";

// Rebuild hourly; the CV only changes when the portfolio data changes.
export const revalidate = 3600;

/**
 * Reads the portfolio collections directly (server component), exactly the
 * pattern src/app/skills/page.js already uses. No HTTP hop to our own API.
 */
async function getCV() {
  try {
    await connectDB();
    const docs = await PortfolioData.find({}).lean();

    const portfolio = {};
    docs.forEach((item) => {
      portfolio[item.collectionName] = {
        data: item.data,
        lastUpdate: item.lastUpdate,
      };
    });

    return buildCV(portfolio);
  } catch (error) {
    console.error("Error loading CV data:", error);
    return null;
  }
}

export async function generateMetadata() {
  const cv = await getCV();
  const name = cv?.profile?.name || "Mahbub Alam";
  const title = cv?.profile?.title || "Software Engineer";
  const years = cv?.experience?.label ? `${cv.experience.label} of experience. ` : "";

  return {
    title: `Resume | ${name} — ${title}`,
    description: `${name} — ${title}. ${years}Backend, full-stack, and applied AI engineering. View and download CV as PDF.`,
    alternates: { canonical: canonicalFor("/resume/") },
    openGraph: {
      title: `Resume | ${name}`,
      description: `${name} — ${title}. ${years}Download CV as PDF.`,
      url: "https://mahbub.dev/resume",
      siteName: "Mahbub Alam Portfolio",
      images: [
        {
          url: "/assets/img/profile.png",
          width: 1200,
          height: 630,
          alt: `Resume - ${name}`,
        },
      ],
    },
    twitter: {
      title: `Resume | ${name}`,
      description: `${name} — ${title}. Download CV as PDF.`,
      images: ["/assets/img/profile.png"],
    },
    robots: { index: true, follow: true },
  };
}

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

  return (
    <div className={styles.wrapper}>
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
            {profile.phone && (
              <a href={`tel:${profile.phone.replace(/[^+\d]/g, "")}`}>{profile.phone}</a>
            )}
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
