import React from "react";
import styles from "./experience.module.css";
import HarmonicHeading from "../HarmonicHeading";
import HarmonicChip from "@/components/HarmonicChip";
import { SectionAdminProvider } from "@/components/admin/contextual/PortfolioContextualControls";
import ExperienceTimelineClient from "./ExperienceTimelineClient";

// Server-side Experience component for better SEO
function Experience({ data, headingLevel = "h2" }) {
  // Use server data for rendering
  const experiences = Array.isArray(data?.data) ? [...data.data].reverse() : [];

  // Helper to get total experience in years and months or decimal years
  const getTotalExperienceDisplay = () => {
    if (!experiences || experiences.length === 0) return null;

    // Find the earliest start and latest end (or today if any are present)
    let minStart = null;
    let maxEnd = null;

    experiences.forEach((exp) => {
      // Parse start
      let startRaw = exp.startDate || exp.time?.split("-")[0] || exp.time;
      let endRaw = exp.endDate || exp.time?.split("-")[1] || exp.time;

      // Helper to parse YYYY-MM or YYYY/MM or YYYY
      function parseDate(str) {
        if (!str) return null;
        str = str.trim();
        if (/present/i.test(str)) return new Date();

        // Try YYYY-MM or YYYY/MM
        let match = str.match(/^(\d{4})[-/](\d{1,2})$/);
        if (match) {
          // Month is 0-based in JS Date
          return new Date(Number(match[1]), Number(match[2]) - 1);
        }

        // Try YYYY
        match = str.match(/^(\d{4})$/);
        if (match) {
          return new Date(Number(match[1]), 0);
        }

        // Fallback to Date constructor
        let d = new Date(str);
        if (!isNaN(d)) return d;
        return null;
      }

      let start = parseDate(startRaw);
      let end = parseDate(endRaw);
      if (!end) end = new Date();

      // Only use valid dates
      if (
        start instanceof Date &&
        !isNaN(start) &&
        end instanceof Date &&
        !isNaN(end)
      ) {
        if (!minStart || start < minStart) minStart = start;
        if (!maxEnd || end > maxEnd) maxEnd = end;
      }
    });

    if (!minStart || !maxEnd) return null;

    let years = maxEnd.getFullYear() - minStart.getFullYear();
    let months = maxEnd.getMonth() - minStart.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    const decimalYears = (years + months / 12).toFixed(1);
    const fullText = `${years} year${years !== 1 ? "s" : ""} ${months} month${
      months !== 1 ? "s" : ""
    }`;

    return {
      decimal: `${decimalYears} year${decimalYears !== "1.0" ? "s" : ""}`,
      full: fullText,
    };
  };

  return (
    <>
      <section
        id="experience"
        className={styles.experienceSection}
        aria-labelledby="experience-heading"
      >
        <div className="container">
          <header className={`${styles.sectionHeader} ${styles.animateIn}`}>
            <HarmonicHeading
              as={headingLevel}
              id="experience-heading"
              text="Where I've Worked"
            >
              <span
                className={styles.experienceCount}
                aria-label={`${experiences.length} experiences`}
              >
                ({experiences.length})
              </span>
            </HarmonicHeading>
            <div className={styles.headerLine} aria-hidden="true"></div>

            {/* Show total experience */}
            {experiences.length > 0 && getTotalExperienceDisplay() && (
              <div
                className={styles.totalExperience}
              >
                <span className={styles.showOnMobile}>
                  <span className={styles.date}>
                    <HarmonicChip text={getTotalExperienceDisplay()?.decimal} />
                  </span>
                </span>
                <span className={styles.showOnDesktop}>
                  <span className={styles.date}>
                    <HarmonicChip text={`Total Experience: ${getTotalExperienceDisplay()?.full}`} />
                  </span>
                </span>
              </div>
            )}
          </header>

          <SectionAdminProvider collectionName="Experiences">
            <ExperienceTimelineClient experiences={experiences} />
          </SectionAdminProvider>
        </div>
      </section>
    </>
  );
}

export default Experience;
