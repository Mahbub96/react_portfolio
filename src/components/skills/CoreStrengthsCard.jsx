import React from "react";
import styles from "./skills.module.css";
import { CORE_STRENGTHS } from "./skillsData";
import { LuCode, LuTerminal } from "react-icons/lu";

export default function CoreStrengthsCard({ headingLevel = "h3" }) {
  const CardHeading = headingLevel;
  const BlockHeading = `h${Math.min(
    (Number(String(headingLevel).replace(/\D/g, "")) || 3) + 1,
    6
  )}`;

  return (
    <article
      className={`${styles.bentoCard} ${styles.coreStrengthsCard}`}
      aria-labelledby="core-strengths-title"
    >
      <div className={styles.cardHeader}>
        <div
          className={`${styles.cardIconBadge} ${styles.badgePurple}`}
          aria-hidden="true"
        >
          <LuCode className={styles.headerIcon} />
        </div>
        <div className={styles.cardHeaderText}>
          <CardHeading id="core-strengths-title" className={styles.cardTitle}>
            {CORE_STRENGTHS.eyebrow}
          </CardHeading>
          <p className={styles.cardDescription}>
            {CORE_STRENGTHS.description}
          </p>
        </div>
      </div>

      <div className={styles.capabilityList} role="list">
        {CORE_STRENGTHS.blocks.map((block) => {
          const Icon = block.icon;
          return (
            <div
              key={block.id}
              className={styles.capabilityBlock}
              role="listitem"
            >
              <div
                className={styles.capabilityIconWrapper}
                style={{
                  "--accent-glow": block.glowBg,
                  "--accent-color": block.accentColor,
                }}
                aria-hidden="true"
              >
                <Icon className={styles.capabilityIcon} />
              </div>
              <div className={styles.capabilityContent}>
                <BlockHeading className={styles.capabilityTitle}>
                  {block.title}
                </BlockHeading>
                <p className={styles.capabilityDescription}>
                  {block.description}
                </p>
                <div className={styles.capabilityTech}>{block.tech}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.coreFooter}>
        <span className={styles.terminalPrompt} aria-hidden="true">
          <LuTerminal className={styles.terminalIcon} />
        </span>
        <span className={styles.coreFooterText}>
          {CORE_STRENGTHS.footerStatement}
        </span>
      </div>
    </article>
  );
}
