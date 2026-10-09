import React from "react";
import styles from "./educations.module.css";
import ThreeDots from "../ThreeDots";
import HarmonicHeading from "../HarmonicHeading";
import HarmonicChip from "@/components/HarmonicChip";

// Server-side Educations component for better SEO
function Educations({ data }) {
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
              as="h2"
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

          <div className={styles.timelineContainer}>
            <div className={styles.verticalLine} aria-hidden="true"></div>

            {education.length > 0 ? (
              education.map((edu, index) => (
                <div
                  key={edu.id || `education-${index}`}
                  className={`${styles.timelineItem} ${
                    index % 2 === 0 ? styles.left : styles.right
                  } ${styles.animateInTimeline}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className={styles.timelineContent}>
                    <div
                      className={styles.timelineDot}
                      aria-hidden="true"
                    ></div>

                    {/* Education Date */}
                    <time
                      className={styles.date}
                      dateTime={edu.time}
                    >
                      <HarmonicChip text={edu.time} />
                    </time>

                    {/* Institution Name */}
                    <h3
                      className={styles.title}
                      id={`education-${edu.id || index}-title`}
                    >
                      {edu.name}
                    </h3>

                    {/* Degree Name */}
                    <p className={styles.degree}>
                      <HarmonicChip text={edu.degName} />
                    </p>

                    {/* Department */}
                    {edu.Department && (
                      <p
                        className={styles.department}
                      >
                        <HarmonicChip text={edu.Department} />
                      </p>
                    )}

                    {/* CGPA */}
                    {edu.cgpa && (
                      <p className={styles.cgpa}>
                        <span className={styles.cgpaLabel}>CGPA:</span>
                        <span
                          className={styles.cgpaValue}
                        >
                          <HarmonicChip text={edu.cgpa} />
                        </span>
                      </p>
                    )}

                    {/* Thesis */}
                    {edu.Thesis && (
                      <p className={styles.thesis}>
                        <span className={styles.thesisLabel}>Thesis:</span>
                        <span
                          className={styles.thesisValue}
                        >
                          {edu.Thesis}
                        </span>
                      </p>
                    )}

                    {/* Institution Details */}
                    {edu.url && (
                      <div className={styles.institutionDetails}>
                        <a
                          href={edu.url}
                          className={styles.institutionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Visit ${edu.name} website`}
                        >
                          <HarmonicChip text={edu.url} />
                        </a>
                      </div>
                    )}

                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noEducation}>
                <div className={styles.noEducationIcon}>🎓</div>
                <h3>Education Details Coming Soon</h3>
                <p>I'm updating my educational background. Check back soon!</p>
                <div className={styles.placeholderEducation}>
                  <div className={styles.placeholderTimeline}>
                    <div className={styles.placeholderDot}></div>
                    <div className={styles.placeholderContent}>
                      <div className={styles.placeholderTitle}></div>
                      <div className={styles.placeholderDegree}></div>
                      <div className={styles.placeholderDepartment}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Educations;
