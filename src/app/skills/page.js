import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import Link from "next/link";
import { getPortfolioData } from "@/lib/getPortfolioData";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { buildPageGraph } from "@/lib/seo/structuredData.mjs";
import {
  buildProjectCatalog,
  isIndexableProject,
  projectPath,
} from "@/lib/seo/projectCatalog.mjs";
import { groupSkills } from "@/lib/seo/skillCatalog.mjs";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import styles from "./skillsUsage.module.css";

export const dynamic = "force-dynamic";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), {
  ssr: true,
});

const Skills = NextDynamic(() => import("@/components/skills/SkillsServer"), {
  ssr: true,
});

const Footer = NextDynamic(() => import("@/components/Footer"), {
  ssr: true,
});

const TITLE = "Skills & Technologies";
const DESCRIPTION = `Languages, frameworks and tools ${SITE_AUTHOR.name} uses — Node.js, NestJS, Python, FastAPI, React, Next.js, PostgreSQL, Docker — and the projects using them.`;

export const metadata = pageMetadata({
  path: "/skills/",
  title: TITLE,
  description: DESCRIPTION,
});

/** Normalise a technology name so "React.js" matches "React", "Node.js" matches "Node". */
function techKey(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/\.js$/, "")
    .replace(/[^a-z0-9+#]/g, "");
}

/**
 * For each skill, the projects whose stack lists it. Built purely from the
 * portfolio data, so every claim on the page is backed by a project card.
 */
function skillUsage(skills = [], projects = []) {
  const catalog = buildProjectCatalog(projects);

  return groupSkills(skills).map(({ category, skills: grouped }) => ({
    category,
    skills: grouped
      .map((skill) => {
        const name = skill.name || skill.title || skill.altTxt;
        const key = techKey(name);
        const usedIn = catalog.filter((project) =>
          project.stack.some((tech) => techKey(tech) === key)
        );
        return { name, usedIn };
      })
      .filter((entry) => entry.name),
  }));
}

export default async function SkillsPage() {
  const portfolioData = await getPortfolioData();
  const skillsData = portfolioData?.Skills || { data: [] };
  const usage = skillUsage(skillsData.data || [], portfolioData?.Projects?.data || []);

  const graph = buildPageGraph({
    path: "/skills/",
    name: `${TITLE} — ${SITE_AUTHOR.name}`,
    description: DESCRIPTION,
    type: "WebPage",
    breadcrumb: [{ name: "Skills", path: "/skills/" }],
  });

  return (
    <div>
      <JsonLd data={graph} />

      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main role="main" style={{ paddingTop: "5rem" }}>
        <Suspense fallback={null}>
          <Skills
            data={skillsData}
            coreStrengths={portfolioData?.CoreStrengths}
            headingLevel="h1"
          />
        </Suspense>

        <section className={styles.usage} aria-labelledby="skills-usage-heading">
          <div className="container">
            <header className={styles.usageHeader}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowBar} aria-hidden="true" />
                <span className={styles.eyebrowText}>APPLIED ENGINEERING</span>
              </div>
              <h2 id="skills-usage-heading" className={styles.heading}>
                Project Cross-References
              </h2>
              <p className={styles.intro}>
                Each technology below links directly to production repositories and portfolio projects demonstrating real-world usage.
              </p>
            </header>

            <div className={styles.usageGrid}>
              {usage
                .filter(({ skills }) => skills.some(({ usedIn }) => usedIn.length))
                .map(({ category, skills }) => (
                  <article key={category} className={styles.usageCard}>
                    <h3 className={styles.groupTitle}>{category}</h3>
                    <div className={styles.skillList}>
                      {skills
                        .filter(({ usedIn }) => usedIn.length)
                        .map(({ name, usedIn }) => (
                          <div key={name} className={styles.skillRow}>
                            <span className={styles.skillBadge}>{name}</span>
                            <div className={styles.projectPills}>
                              {usedIn.map((project) =>
                                isIndexableProject(project) ? (
                                  <Link
                                    key={project.slug}
                                    href={projectPath(project)}
                                    className={styles.projectPill}
                                  >
                                    {project.name}
                                  </Link>
                                ) : (
                                  <span key={project.slug} className={styles.projectPillStatic}>
                                    {project.name}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </section>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
