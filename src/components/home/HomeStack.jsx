import React from "react";
import styles from "./home.module.css";
import SectionHead from "./SectionHead";
import { ItemAdmin, AddItem } from "./HomeAdmin";
import { SectionAdminProvider } from "@/components/admin/contextual/PortfolioContextualControls";
import { normalizeSkillCategory } from "@/components/skills/skillsRegistry";

// Columns follow the layer a tool serves, in the same order as the hero
// diagram. Keys are the categories normalizeSkillCategory() returns.
const COLUMNS = [
  { key: "frameworks", title: "Frameworks", tone: "tone_accent" },
  { key: "data-infra", title: "Data & infrastructure", tone: "tone_violet" },
  { key: "ai-engineering", title: "AI & engineering", tone: "tone_sky" },
  { key: "languages", title: "Languages", tone: "tone_warm" },
];

export default function HomeStack({ skills = [] }) {
  const grouped = Object.fromEntries(COLUMNS.map((col) => [col.key, []]));
  skills.filter(Boolean).forEach((skill) => {
    const key = normalizeSkillCategory(skill);
    (grouped[key] || grouped.frameworks).push(skill);
  });

  return (
    <section id="skills" className={styles.section} aria-labelledby="stack-heading">
      <div className={styles.wrap}>
        <SectionHead
          index="04"
          kicker="Stack"
          id="stack-heading"
          title="Tools grouped by the layer they serve."
        />
        <SectionAdminProvider collectionName="Skills">
          <div className={styles.matrix}>
            {COLUMNS.map((col) => (
              <div key={col.key} className={styles.matrixCol}>
                <h3>
                  <i className={styles[col.tone]} aria-hidden="true" />
                  {col.title}
                </h3>
                <ul>
                  {grouped[col.key].map((skill) => (
                    <li key={skill.id || skill.name} className={styles.skillItem}>
                      {skill.name}
                      <ItemAdmin collection="Skills" item={skill} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <AddItem collection="Skills" label="Skill" />
        </SectionAdminProvider>
        <p className={styles.sectionFoot}>
          <a href="/skills/">Full skills breakdown →</a>
        </p>
      </div>
    </section>
  );
}
