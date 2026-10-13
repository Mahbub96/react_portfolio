import React from "react";
import styles from "./skills.module.css";
import HarmonicHeading from "../HarmonicHeading";
import CoreStrengthsCard from "./CoreStrengthsCard";
import SkillCategoryCard from "./SkillCategoryCard";
import SkillsClient from "./SkillsClient";
import {
  CATEGORY_METADATA,
  normalizeSkillCategory,
} from "./skillsRegistry";
import legacyDb from "../../../db.json";

export default function SkillsServer({
  data,
  coreStrengths,
  headingLevel = "h2",
}) {
  // Extract dynamic skills array from database/API
  const rawSkills = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : legacyDb.skills || [];

  // Extract dynamic core strengths from database/API
  const rawCoreStrengths = Array.isArray(coreStrengths?.data)
    ? coreStrengths.data
    : Array.isArray(coreStrengths)
    ? coreStrengths
    : legacyDb.coreStrengths || [];

  // Sequential heading levels for accessibility & SEO
  const level = Number(String(headingLevel).replace(/\D/g, "")) || 2;
  const cardHeadingLevel = `h${Math.min(level + 1, 6)}`;

  // Group dynamic skills from DB by category
  const groupedBuckets = {
    languages: [],
    frameworks: [],
    "data-infra": [],
    "ai-engineering": [],
  };

  rawSkills.forEach((skill) => {
    const categoryKey = normalizeSkillCategory(skill);
    if (groupedBuckets[categoryKey]) {
      groupedBuckets[categoryKey].push(skill);
    } else {
      groupedBuckets.frameworks.push(skill);
    }
  });

  const languagesCategory = {
    ...CATEGORY_METADATA.languages,
    skills: groupedBuckets.languages,
  };

  const frameworksCategory = {
    ...CATEGORY_METADATA.frameworks,
    skills: groupedBuckets.frameworks,
  };

  const dataCategory = {
    ...CATEGORY_METADATA["data-infra"],
    skills: groupedBuckets["data-infra"],
  };

  const aiCategory = {
    ...CATEGORY_METADATA["ai-engineering"],
    skills: groupedBuckets["ai-engineering"],
  };

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

        {/* 3-Column Asymmetric Bento Grid (Dynamic from DB) */}
        <div
          className={styles.bentoGrid}
          role="region"
          aria-label="Skills & Technologies Overview"
        >
          {/* Column 1: Core Strengths (Spans 2 rows on desktop) */}
          <CoreStrengthsCard
            coreStrengths={rawCoreStrengths}
            headingLevel={cardHeadingLevel}
          />

          {/* Column 2, Row 1: Languages */}
          <SkillCategoryCard
            category={languagesCategory}
            headingLevel={cardHeadingLevel}
            cardClassName={styles.languagesCard}
          />

          {/* Column 3, Row 1: Frameworks & Libraries */}
          <SkillCategoryCard
            category={frameworksCategory}
            headingLevel={cardHeadingLevel}
            cardClassName={styles.frameworksCard}
          />

          {/* Column 2, Row 2: Data & Infrastructure */}
          <SkillCategoryCard
            category={dataCategory}
            headingLevel={cardHeadingLevel}
            cardClassName={styles.dataCard}
          />

          {/* Column 3, Row 2: AI & Engineering */}
          <SkillCategoryCard
            category={aiCategory}
            headingLevel={cardHeadingLevel}
            cardClassName={styles.aiCard}
          />
        </div>

        {/* Client-side admin controls (rendered only when authenticated) */}
        <SkillsClient skills={rawSkills} />
      </div>
    </section>
  );
}
