import React from "react";
import styles from "./skills.module.css";
import ThreeDots from "../ThreeDots";
import HarmonicHeading from "../HarmonicHeading";
import HarmonicChip from "@/components/HarmonicChip";

// Server-side Skills component for better SEO
const SkillsServer = ({ data }) => {
  // Validate and normalize skills data
  const validateSkillsData = (skillsData) => {
    if (!skillsData || !Array.isArray(skillsData)) {
      return [];
    }

    return skillsData.filter((skill) => skill && typeof skill === "object");
  };

  const skills = validateSkillsData(data?.data);

  const getSkillCategory = (skillName = "") => {
    const name = skillName.toLowerCase();

    if (/(react|javascript|jquery|css|tailwind|bootstrap|vue)/.test(name)) {
      return "Frontend";
    }

    if (/(php|node|python|java|c plus|assembly|swing)/.test(name)) {
      return "Backend & Languages";
    }

    if (/(mysql|sqlite|mongo|database)/.test(name)) {
      return "Data";
    }

    if (/(git|docker|aws|linux|ci|cd)/.test(name)) {
      return "Tools & Delivery";
    }

    return "Additional";
  };

  const skillGroups = skills.reduce((groups, skill) => {
    const category = getSkillCategory(skill.name);
    return {
      ...groups,
      [category]: [...(groups[category] || []), skill],
    };
  }, {});

  const orderedGroups = [
    "Frontend",
    "Backend & Languages",
    "Data",
    "Tools & Delivery",
    "Additional",
  ].filter((category) => skillGroups[category]?.length);

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
        skillLevel: "Professional working proficiency",
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
            <HarmonicHeading
              as="h2"
              id="skills-heading"
              text="Skills & Technologies"
            />
            <div className={styles.headerLine} aria-hidden="true"></div>
          </div>

          <div className={styles.skillsGroups} itemProp="itemListElement">
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
                    <h3
                      id={`skills-${category
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")}`}
                    >
                      {category}
                    </h3>
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
                        <h4 itemProp="name" className={styles.skillName}>
                          <HarmonicChip text={skill.name} />
                        </h4>
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
