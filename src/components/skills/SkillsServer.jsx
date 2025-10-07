import React from "react";
import styles from "./skills.module.css";
import ThreeDots from "../ThreeDots";

// Server-side Skills component for better SEO
const SkillsServer = ({ data }) => {
  // Validate and normalize skills data
  const validateSkillsData = (skillsData) => {
    if (!skillsData || !Array.isArray(skillsData)) {
      console.warn(
        "SkillsServer: Invalid skills data, using empty array",
        skillsData
      );
      return [];
    }

    // Ensure each skill has required properties
    return skillsData.filter((skill) => {
      if (!skill || typeof skill !== "object") {
        console.warn("SkillsServer: Invalid skill object:", skill);
        return false;
      }
      return true;
    });
  };

  const skills = validateSkillsData(data?.data);

  // Helper function to normalize image paths
  const normalizeImagePath = (src) => {
    if (!src) return src;
    return src.startsWith("./") || src.startsWith("../")
      ? src.replace(/^\.\.\/\.\.\/assets\/img\//, "/assets/img/")
      : src;
  };

  // Enhanced structured data for skills section
  const skillsStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://mahbub.dev#skills",
    name: "Mahbub Alam Technical Skills",
    description:
      "Comprehensive list of technical skills and technologies mastered by Mahbub Alam, Full Stack Developer",
    numberOfItems: skills.length,
    itemListElement: skills.map((skill, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Thing",
        "@id": `https://mahbub.dev#skill-${skill.id || index}`,
        name: skill.name || `Skill ${index + 1}`,
        description: `${
          skill.name || `Skill ${index + 1}`
        } technology and development skill`,
        image: skill.src ? normalizeImagePath(skill.src) : undefined,
        category: "Technical Skill",
        skillLevel: "Expert",
        relatedTo: "Software Development",
        creator: {
          "@type": "Person",
          name: "Mahbub Alam",
          url: "https://mahbub.dev",
        },
      },
    })),
  };

  return (
    <>
      {/* Structured Data for Skills */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(skillsStructuredData),
        }}
      />

      <section
        id="skills"
        className={styles.skillsSection}
        itemScope
        itemType="https://schema.org/ItemList"
        aria-labelledby="skills-heading"
      >
        <div className="container">
          <div className={`${styles.sectionHeader} ${styles.animateIn}`}>
            <h2 id="skills-heading">Skills & Technologies</h2>
            <div className={styles.headerLine} aria-hidden="true"></div>
          </div>

          <div
            className={styles.skillsGrid}
            itemProp="itemListElement"
            role="list"
            aria-label="Technical skills and technologies grid"
          >
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <div
                  key={skill.id}
                  className={`${styles.skillCard} ${styles.animateInCard}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  itemScope
                  itemType="https://schema.org/Thing"
                  itemProp="itemListElement"
                  role="listitem"
                  aria-label={`${skill.name} skill card`}
                >
                  <div className={styles.skillIcon}>
                    <img
                      src={normalizeImagePath(skill.src)}
                      alt={`${skill.name} technology icon`}
                      loading="lazy"
                      itemProp="image"
                      width="64"
                      height="64"
                      title={`${skill.name} - Technical Skill`}
                    />
                  </div>
                  <h3 itemProp="name" className={styles.skillName}>
                    {skill.name}
                  </h3>
                  <div className={styles.skillLevel}>
                    <span className={styles.levelIndicator}>Expert Level</span>
                  </div>
                </div>
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
