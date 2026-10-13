import React from "react";
import styles from "./skills.module.css";
import { LuCode, LuTerminal, LuServer, LuAppWindow, LuBrain } from "react-icons/lu";

const CAPABILITY_ICONS = {
  server: LuServer,
  window: LuAppWindow,
  brain: LuBrain,
};

export default function CoreStrengthsCard({
  coreStrengths = [],
  headingLevel = "h3",
}) {
  const CardHeading = headingLevel;
  const BlockHeading = `h${Math.min(
    (Number(String(headingLevel).replace(/\D/g, "")) || 3) + 1,
    6
  )}`;

  const blocks = Array.isArray(coreStrengths) ? coreStrengths : [];

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
            Core strengths
          </CardHeading>
          <p className={styles.cardDescription}>
            The areas I focus on and have the deepest experience in, built through real projects and professional work.
          </p>
        </div>
      </div>

      <div className={styles.capabilityList} role="list">
        {blocks.map((block) => {
          const Icon = CAPABILITY_ICONS[block.icon] || LuServer;
          return (
            <div
              key={block.id || block.title}
              className={styles.capabilityBlock}
              role="listitem"
            >
              <div
                className={styles.capabilityIconWrapper}
                style={{
                  "--accent-glow": block.glowBg || "rgba(32, 201, 151, 0.12)",
                  "--accent-color": block.accentColor || "var(--accent-primary)",
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
          Built through production work and hands-on projects.
        </span>
      </div>
    </article>
  );
}
