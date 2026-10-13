import React from "react";
import styles from "./skills.module.css";
import TechnologyChip from "./TechnologyChip";

export default function SkillCategoryCard({
  category,
  headingLevel = "h3",
  cardClassName = "",
}) {
  const { id, title, description, icon: Icon, accentColor, skills = [] } = category;
  const CardHeading = headingLevel;

  return (
    <article
      className={`${styles.bentoCard} ${styles.categoryCard} ${cardClassName}`.trim()}
      aria-labelledby={`category-${id}-title`}
    >
      <div className={styles.cardHeader}>
        {Icon && (
          <div
            className={styles.cardIconBadge}
            style={{
              "--badge-accent": accentColor || "var(--accent-primary)",
            }}
            aria-hidden="true"
          >
            <Icon className={styles.headerIcon} />
          </div>
        )}
        <div className={styles.cardHeaderText}>
          <CardHeading
            id={`category-${id}-title`}
            className={styles.cardTitle}
          >
            {title}
          </CardHeading>
          {description && (
            <p className={styles.cardDescription}>{description}</p>
          )}
        </div>
      </div>

      <div
        className={styles.chipsGrid}
        role="list"
        aria-label={`${title} skills`}
      >
        {skills.map((skill) => (
          <TechnologyChip
            key={skill.id || skill.name}
            skill={skill}
          />
        ))}
      </div>
    </article>
  );
}
