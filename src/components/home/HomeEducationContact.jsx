import React from "react";
import styles from "./home.module.css";
import { ItemAdmin, AddItem } from "./HomeAdmin";
import { SectionAdminProvider } from "@/components/admin/contextual/PortfolioContextualControls";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import { gradeValue } from "./homeData";

/**
 * Education (highest qualification featured, earlier ones listed) next to a
 * plain contact card. The thesis line links his speech-AI work back to it.
 */
export default function HomeEducationContact({ educations = [] }) {
  const [primary, ...earlier] = educations.filter(Boolean);
  const hasThesis = primary?.Thesis && !/^n\/?a$/i.test(primary.Thesis);

  return (
    <section
      id="education"
      className={`${styles.section} ${styles.tint}`}
      aria-labelledby="education-heading"
    >
      <div className={`${styles.wrap} ${styles.duo}`}>
        <SectionAdminProvider collectionName="Educations">
          <div className={styles.box}>
            <p className={styles.kicker}>05 — Education</p>
            {primary ? (
              <div className={styles.eduPrimary}>
                <ItemAdmin collection="Educations" item={primary} />
                <h2 id="education-heading">
                  {primary.degName}
                  {primary.Department ? ` in ${primary.Department}` : ""}
                </h2>
                <p>
                  {primary.name} · {primary.time}
                  {primary.cgpa ? ` · CGPA ${gradeValue(primary.cgpa)}` : ""}
                </p>
                {hasThesis && (
                  <p className={styles.thread}>
                    Thesis: <b>{primary.Thesis}</b>. It started the speech-AI work
                    that continues in the ASR Studio and Local Vocal Agent.
                  </p>
                )}
              </div>
            ) : (
              <h2 id="education-heading">Education</h2>
            )}
            {earlier.length > 0 && (
              <ul className={styles.eduList}>
                {earlier.map((edu) => (
                  <li key={edu.id || edu.name}>
                    <ItemAdmin collection="Educations" item={edu} />
                    <div>
                      <b>{edu.degName}</b>
                      <span>{edu.name}</span>
                    </div>
                    <span className={styles.mono}>{edu.time}</span>
                  </li>
                ))}
              </ul>
            )}
            <AddItem collection="Educations" label="Education" />
          </div>
        </SectionAdminProvider>

        <div id="contact" className={`${styles.box} ${styles.contactBox}`}>
          <p className={styles.kicker}>06 — Contact</p>
          <h2>Questions about a project or the engineering behind it?</h2>
          <p>Email is the best way to reach me. You can also send a message from the contact page.</p>
          <a className={styles.mail} href={`mailto:${SITE_AUTHOR.email}`}>
            {SITE_AUTHOR.email}
          </a>
          <a className={styles.contactPage} href="/contact/">
            Contact page →
          </a>
        </div>
      </div>
    </section>
  );
}
