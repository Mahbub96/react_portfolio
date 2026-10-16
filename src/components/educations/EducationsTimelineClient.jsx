"use client";

import React, { useState } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import styles from "./educations.module.css";
import HarmonicChip from "@/components/HarmonicChip";
import { EducationCardAdmin, EducationAddButton } from "./EducationAdminControls";

// Highest 3 rows initially
const INITIAL_EDUCATION_COUNT = 3;
const PAGE_SIZE = 3;

export default function EducationsTimelineClient({ education = [] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_EDUCATION_COUNT);

  const totalEducation = education.length;
  const visibleEducation = education.slice(0, visibleCount);
  const hasMore = visibleCount < totalEducation;
  const isExpanded = visibleCount > INITIAL_EDUCATION_COUNT;
  const remainingCount = totalEducation - visibleCount;

  const handleSeeMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, totalEducation));
  };

  const handleShowLess = () => {
    setVisibleCount(INITIAL_EDUCATION_COUNT);
    const sectionEl = document.getElementById("education");
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <div className={styles.timelineContainer}>
        <div className={styles.verticalLine} aria-hidden="true"></div>

        {visibleEducation.length > 0 ? (
          visibleEducation.map((edu, index) => (
            <div
              key={edu.id || `education-${index}`}
              className={`${styles.timelineItem} ${
                index % 2 === 0 ? styles.left : styles.right
              } ${styles.animateInTimeline}`}
              style={{ animationDelay: `${(index % PAGE_SIZE) * 0.15}s` }}
            >
              <div className={styles.timelineContent}>
                <EducationCardAdmin education={edu} />
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
                  <p className={styles.department}>
                    <HarmonicChip text={edu.Department} />
                  </p>
                )}

                {/* CGPA */}
                {edu.cgpa && (
                  <p className={styles.cgpa}>
                    <span className={styles.cgpaLabel}>CGPA:</span>
                    <span className={styles.cgpaValue}>
                      <HarmonicChip text={edu.cgpa} />
                    </span>
                  </p>
                )}

                {/* Thesis */}
                {edu.Thesis && (
                  <p className={styles.thesis}>
                    <span className={styles.thesisLabel}>Thesis:</span>
                    <span className={styles.thesisValue}>
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
            <p>I&apos;m updating my educational background. Check back soon!</p>
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
        <EducationAddButton />
      </div>

      {totalEducation > INITIAL_EDUCATION_COUNT && (
        <div className={styles.loadMoreContainer}>
          <div className={styles.loadMoreButtonsGroup}>
            {hasMore && (
              <button
                type="button"
                className={styles.seeMoreButton}
                onClick={handleSeeMore}
                aria-label={`Load more education entries, currently showing ${visibleEducation.length} of ${totalEducation}`}
              >
                <span>See More Education</span>
                <span className={styles.seeMoreBadge}>+{remainingCount}</span>
                <HiOutlineChevronDown aria-hidden="true" />
              </button>
            )}

            {isExpanded && (
              <button
                type="button"
                className={styles.showLessButton}
                onClick={handleShowLess}
                aria-label="Show fewer education entries"
              >
                <HiOutlineChevronUp aria-hidden="true" />
                <span>Show Less</span>
              </button>
            )}
          </div>

          <div className={styles.loadMoreCounter} aria-live="polite">
            Showing {visibleEducation.length} of {totalEducation} education entries
          </div>
        </div>
      )}
    </>
  );
}
