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
const DESCRIPTION = `Languages, frameworks, databases and tools ${SITE_AUTHOR.name} uses — Node.js, NestJS, Python, FastAPI, React, Next.js, PostgreSQL, Docker — and the projects that use them.`;

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

      <main>
        <Suspense fallback={null}>
          <Skills data={skillsData} headingLevel="h1" />
        </Suspense>

        <section className={styles.usage} aria-labelledby="skills-usage-heading">
          <h2 id="skills-usage-heading" className={styles.heading}>
            Where these skills are used
          </h2>
          <p className={styles.intro}>
            {SITE_AUTHOR.name} works mainly on backend services and APIs, full-stack
            web applications and applied AI. Each technology below links to the
            projects in this portfolio that use it.
          </p>

          {usage
            .filter(({ skills }) => skills.some(({ usedIn }) => usedIn.length))
            .map(({ category, skills }) => (
            <div key={category} className={styles.group}>
              <h3 className={styles.groupTitle}>{category}</h3>
              <ul className={styles.list}>
                {skills.filter(({ usedIn }) => usedIn.length).map(({ name, usedIn }) => (
                  <li key={name} className={styles.item}>
                    <span className={styles.skill}>{name}</span>
                    <span className={styles.projects}>
                        {usedIn.map((project, index) => (
                          <span key={project.slug}>
                            {index > 0 ? ", " : ""}
                            {isIndexableProject(project) ? (
                              <Link href={projectPath(project)}>{project.name}</Link>
                            ) : (
                              project.name
                            )}
                          </span>
                        ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
