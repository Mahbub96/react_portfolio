import React from "react";
import styles from "./skills.module.css";
import ThreeDots from "../ThreeDots";

// Client-side only components
import dynamic from "next/dynamic";
const SkillsClient = dynamic(() => import("./SkillsClient"), {
  ssr: false,
});

function Skills({ data }) {
  const skills = data?.data || [];

  // Helper function to normalize image paths
  const normalizeImagePath = (src) => {
    if (!src) return src;
    return src.startsWith("./") || src.startsWith("../")
      ? src.replace(/^\.\.\/\.\.\/assets\/img\//, "/assets/img/")
      : src;
  };

  return (
    <section
      id="skills"
      className={styles.skillsSection}
      itemScope
      itemType="http://schema.org/ItemList"
    >
      <div className="container">
        <div className={`${styles.sectionHeader} ${styles.animateIn}`}>
          <h2>
            <span className={styles.sectionNumber}>02.</span> Skills &
            Technologies
          </h2>
          <div className={styles.headerLine}></div>
        </div>

        <div className={styles.skillsGrid} itemProp="itemListElement">
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <div
                key={skill.id}
                className={`${styles.skillCard} ${styles.animateInCard}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                itemScope
                itemType="http://schema.org/Thing"
                itemProp="itemListElement"
              >
                <div className={styles.skillIcon}>
                  <img
                    src={normalizeImagePath(skill.src)}
                    alt={`${skill.name} technology icon`}
                    loading="lazy"
                    itemProp="image"
                    width="64"
                    height="64"
                  />
                </div>
                <h3 itemProp="name">{skill.name}</h3>
              </div>
            ))
          ) : (
            <div className={styles.loading}>
              <ThreeDots />
            </div>
          )}
        </div>
      </div>

      {/* Client-side interactive features */}
      <SkillsClient skills={skills} />
    </section>
  );
}

export default Skills;
