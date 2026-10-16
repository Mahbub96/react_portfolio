import React from "react";
import styles from "./educations.module.css";
import HarmonicHeading from "../HarmonicHeading";
import { SectionAdminProvider } from "@/components/admin/contextual/PortfolioContextualControls";
import EducationsTimelineClient from "./EducationsTimelineClient";

// Server-side Educations component for better SEO
function Educations({ data, headingLevel = "h2" }) {
  // Use server data for rendering
  const education = Array.isArray(data?.data) ? [...data.data] : [];

  return (
    <>
      <section
        id="education"
        className={styles.educationSection}
        aria-labelledby="education-heading"
      >
        <div className="container">
          <header className={`${styles.sectionHeader} ${styles.animateIn}`}>
            <HarmonicHeading
              as={headingLevel}
              id="education-heading"
              text="Education"
            >
              <span
                className={styles.educationCount}
                aria-label={`${education.length} degrees`}
              >
                ({education.length})
              </span>
            </HarmonicHeading>
            <div className={styles.headerLine} aria-hidden="true"></div>
          </header>

          <SectionAdminProvider collectionName="Educations">
            <EducationsTimelineClient education={education} />
          </SectionAdminProvider>
        </div>
      </section>
    </>
  );
}

export default Educations;
