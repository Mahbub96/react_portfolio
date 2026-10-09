import React from "react";
import styles from "./skills.module.css";
import ThreeDots from "../ThreeDots";
import { groupSkills } from "@/lib/seo/skillCatalog.mjs";
import HarmonicHeading from "../HarmonicHeading";
import HarmonicChip from "@/components/HarmonicChip";

// Server-side Skills component for better SEO
// headingLevel defaults to h2 because this section also renders on the
// homepage (which has its own h1); the standalone /skills page passes "h1".
const SkillsServer = ({ data, headingLevel = "h2" }) => {
  // Validate and normalize skills data
  const validateSkillsData = (skillsData) => {
    if (!skillsData || !Array.isArray(skillsData)) {
      return [];
    }

    return skillsData.filter((skill) => skill && typeof skill === "object");
  };

  const skills = validateSkillsData(data?.data);

  // Shared with llms.txt and the /skills page so a skill is never filed
  // under different categories in different places.
  const grouped = groupSkills(skills);

  // Keep the heading outline sequential under whichever level the section
  // title uses (h1 on /skills/, h2 on the homepage).
  const level = Number(String(headingLevel).replace(/\D/g, "")) || 2;
  const GroupHeading = `h${Math.min(level + 1, 6)}`;
  const SkillHeading = `h${Math.min(level + 2, 6)}`;
  const skillGroups = Object.fromEntries(
    grouped.map(({ category, skills: items }) => [category, items])
  );
  const orderedGroups = grouped.map(({ category }) => category);

  // Helper function to normalize image paths
  const normalizeImagePath = (src) => {
    if (!src) return src;
    return src.startsWith("./") || src.startsWith("../")
      ? src.replace(/^\.\.\/\.\.\/assets\/img\//, "/assets/img/")
      : src;
  };

  return (
    <>
      <section
        id="skills"
        className={styles.skillsSection}
        aria-labelledby="skills-heading"
      >
        <div className="container">
          <div className={`${styles.sectionHeader} ${styles.animateIn}`}>
            <HarmonicHeading
              as={headingLevel}
              id="skills-heading"
              text="Skills & Technologies"
            />
            <div className={styles.headerLine} aria-hidden="true"></div>
          </div>

          <div className={styles.skillsGroups}>
            {skills.length > 0 ? (
              orderedGroups.map((category) => (
                <section
                  key={category}
                  className={styles.skillGroup}
                  aria-labelledby={`skills-${category
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")}`}
                >
                  <div className={styles.groupHeader}>
                    <GroupHeading
                      id={`skills-${category
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")}`}
                    >
                      {category}
                    </GroupHeading>
                    <span>
                      <HarmonicChip text={`${skillGroups[category].length} technologies`} />
                    </span>
                  </div>

                  <div
                    className={styles.skillsGrid}
                    role="list"
                    aria-label={`${category} skills`}
                  >
                    {skillGroups[category].map((skill, index) => (
                      <div
                        key={skill.id || `${category}-${skill.name}`}
                        className={`${styles.skillCard} ${styles.animateInCard}`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                        role="listitem"
                        aria-label={`${skill.name} skill card`}
                      >
                        <div className={styles.skillIcon}>
                          <img
                            src={normalizeImagePath(skill.src)}
                            alt={`${skill.name} technology icon`}
                            loading="lazy"
                            width="64"
                            height="64"
                            title={`${skill.name} - Technical Skill`}
                          />
                        </div>
                        <SkillHeading className={styles.skillName}>
                          <HarmonicChip text={skill.name} />
                        </SkillHeading>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className={styles.loading}>
                <ThreeDots />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default SkillsServer;
