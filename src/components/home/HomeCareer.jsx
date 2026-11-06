import React from "react";
import styles from "./home.module.css";
import SectionHead from "./SectionHead";
import { ItemAdmin, AddItem } from "./HomeAdmin";
import { SectionAdminProvider } from "@/components/admin/contextual/PortfolioContextualControls";
import { experienceRange, isCurrent, sortExperiencesAscending } from "./homeData";

// Domains named in his current role description (CMS Experiences row).
const DOMAINS = ["Enterprise", "Healthcare", "Education", "ERP", "Automation"];

/**
 * Career progression, oldest → newest, drawn as rising steps so the growth in
 * ownership is visible at a glance.
 */
export default function HomeCareer({ experiences = [] }) {
  const ordered = sortExperiencesAscending(experiences);
  const companies = [...new Set(ordered.map((exp) => exp.company).filter(Boolean))];
  const companyUrl = ordered.find((exp) => exp.companyUrl)?.companyUrl;
  const sameCompany = companies.length === 1;

  return (
    <section
      id="experience"
      className={`${styles.section} ${styles.tint}`}
      aria-labelledby="experience-heading"
    >
      <div className={styles.wrap}>
        <SectionHead
          index="03"
          kicker="Experience"
          id="experience-heading"
          title={
            sameCompany && ordered.length > 1
              ? `${ordered.length} roles at one company, each with wider ownership.`
              : "Roles and the ownership that came with them."
          }
        />

        <SectionAdminProvider collectionName="Experiences">
          <ol className={styles.career}>
            {ordered.map((exp, index) => {
              const current = isCurrent(exp);
              return (
                <li
                  key={exp.id || exp.name}
                  className={`${styles.level} ${current ? styles.levelNow : ""}`}
                  style={{ "--step": index }}
                >
                  <ItemAdmin collection="Experiences" item={exp} />
                  {current && <span className={styles.nowBadge}>Current</span>}
                  <p className={styles.mono}>{experienceRange(exp).toUpperCase()}</p>
                  <h3>{exp.name}</h3>
                  {!sameCompany && exp.company && <p className={styles.levelCompany}>{exp.company}</p>}
                  <p>{exp.how}</p>
                </li>
              );
            })}
          </ol>
          <AddItem collection="Experiences" label="Experience" />
        </SectionAdminProvider>

        {sameCompany && (
          <div className={styles.companyBar}>
            <p>
              {companyUrl ? (
                <a href={companyUrl} target="_blank" rel="noopener noreferrer">
                  {companies[0]}
                </a>
              ) : (
                companies[0]
              )}
              <span className={styles.mono}>DHAKA</span>
            </p>
            <ul className={styles.chips} aria-label="Domains">
              {DOMAINS.map((domain) => (
                <li key={domain} className={styles.chip}>
                  {domain}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
