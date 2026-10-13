import React from "react";
import styles from "./skills.module.css";
import HarmonicHeading from "../HarmonicHeading";
import CoreStrengthsCard from "./CoreStrengthsCard";
import SkillCategoryCard from "./SkillCategoryCard";
import SkillsClient from "./SkillsClient";
import { SKILL_CATEGORIES } from "./skillsData";

export default function SkillsServer({ data, headingLevel = "h2" }) {
  const rawSkills = Array.isArray(data?.data) ? data.data : [];

  // Sequential heading levels for accessibility & SEO
  const level = Number(String(headingLevel).replace(/\D/g, "")) || 2;
  const cardHeadingLevel = `h${Math.min(level + 1, 6)}`;

  // Find categories by ID
  const languagesCategory = SKILL_CATEGORIES.find((c) => c.id === "languages");
  const frameworksCategory = SKILL_CATEGORIES.find((c) => c.id === "frameworks");
  const dataCategory = SKILL_CATEGORIES.find((c) => c.id === "data-infra");
  const aiCategory = SKILL_CATEGORIES.find((c) => c.id === "ai-engineering");

  return (
    <section
      id="skills"
      className={styles.skillsSection}
      aria-labelledby="skills-heading"
    >
      <div className="container">
        {/* Editorial Section Header */}
        <header className={styles.sectionHeader}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowBar} aria-hidden="true" />
            <span className={styles.eyebrowText}>WHAT I WORK WITH</span>
          </div>

          <HarmonicHeading
            as={headingLevel}
            id="skills-heading"
            text="Skills & Technologies"
            className={styles.mainTitle}
          />

          <p className={styles.sectionSubtitle}>
            Tools I use to build reliable products, scalable services, and intelligent systems.
          </p>
        </header>

        {/* 3-Column Asymmetric Bento Grid */}
        <div
          className={styles.bentoGrid}
          role="region"
          aria-label="Skills & Technologies Overview"
        >
          {/* Column 1: Core Strengths (Spans 2 rows on desktop) */}
          <CoreStrengthsCard headingLevel={cardHeadingLevel} />

          {/* Column 2, Row 1: Languages */}
          {languagesCategory && (
            <SkillCategoryCard
              category={languagesCategory}
              headingLevel={cardHeadingLevel}
              cardClassName={styles.languagesCard}
            />
          )}

          {/* Column 3, Row 1: Frameworks & Libraries */}
          {frameworksCategory && (
            <SkillCategoryCard
              category={frameworksCategory}
              headingLevel={cardHeadingLevel}
              cardClassName={styles.frameworksCard}
            />
          )}

          {/* Column 2, Row 2: Data & Infrastructure */}
          {dataCategory && (
            <SkillCategoryCard
              category={dataCategory}
              headingLevel={cardHeadingLevel}
              cardClassName={styles.dataCard}
            />
          )}

          {/* Column 3, Row 2: AI & Engineering */}
          {aiCategory && (
            <SkillCategoryCard
              category={aiCategory}
              headingLevel={cardHeadingLevel}
              cardClassName={styles.aiCard}
            />
          )}
        </div>

        {/* Client-side admin controls (rendered only when authenticated) */}
        <SkillsClient skills={rawSkills} />
      </div>
    </section>
  );
}
