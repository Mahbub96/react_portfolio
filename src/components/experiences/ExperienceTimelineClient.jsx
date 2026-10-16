"use client";

import React, { useState } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import styles from "./experience.module.css";
import HarmonicChip from "@/components/HarmonicChip";
import { ExperienceCardAdmin, ExperienceAddButton } from "./ExperienceAdminControls";

// Highest 3 rows initially
const INITIAL_EXPERIENCE_COUNT = 3;
const PAGE_SIZE = 3;

export default function ExperienceTimelineClient({ experiences = [] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_EXPERIENCE_COUNT);

  const totalExperiences = experiences.length;
  const visibleExperiences = experiences.slice(0, visibleCount);
  const hasMore = visibleCount < totalExperiences;
  const isExpanded = visibleCount > INITIAL_EXPERIENCE_COUNT;
  const remainingCount = totalExperiences - visibleCount;

  const handleSeeMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, totalExperiences));
  };

  const handleShowLess = () => {
    setVisibleCount(INITIAL_EXPERIENCE_COUNT);
    const sectionEl = document.getElementById("experience");
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <div className={styles.timelineContainer}>
        <div className={styles.verticalLine} aria-hidden="true"></div>

        {visibleExperiences.length > 0 ? (
          visibleExperiences.map((experience, index) => (
            <div
              key={experience.id || `experience-${index}`}
              className={`${styles.timelineItem} ${
                index % 2 === 0 ? styles.left : styles.right
              } ${styles.animateInTimeline}`}
              style={{ animationDelay: `${(index % PAGE_SIZE) * 0.15}s` }}
            >
              <div className={styles.timelineContent}>
                <ExperienceCardAdmin experience={experience} />
                <div
                  className={styles.timelineDot}
                  aria-hidden="true"
                ></div>

                {/* Experience Date */}
                <time
                  className={styles.date}
                  dateTime={
                    experience.startDate ||
                    experience.time?.split("-")[0] ||
                    experience.time
                  }
                >
                  <HarmonicChip text={experience.time} />
                </time>

                {/* Job Title */}
                <h3
                  className={styles.title}
                  id={`experience-${experience.id || index}-title`}
                >
                  {experience.name}
                </h3>

                {/* Job Description */}
                <p className={styles.description}>
                  {experience.how}
                </p>

                {/* Company Information */}
                {experience.company && (
                  <div className={styles.companyInfo}>
                    <span className={styles.companyName}>
                      <HarmonicChip text={experience.company} />
                    </span>
                    {experience.companyUrl && (
                      <a
                        href={experience.companyUrl}
                        className={styles.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit ${experience.company} website`}
                      >
                        <HarmonicChip text="Company Website" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noExperience}>
            <div className={styles.noExperienceIcon}>💼</div>
            <h3>Experience Coming Soon</h3>
            <p>I&apos;m building my professional experience. Check back soon!</p>
            <div className={styles.placeholderExperience}>
              <div className={styles.placeholderTimeline}>
                <div className={styles.placeholderDot}></div>
                <div className={styles.placeholderContent}>
                  <div className={styles.placeholderTitle}></div>
                  <div className={styles.placeholderDesc}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <ExperienceAddButton />
      </div>

      {totalExperiences > INITIAL_EXPERIENCE_COUNT && (
        <div className={styles.loadMoreContainer}>
          <div className={styles.loadMoreButtonsGroup}>
            {hasMore && (
              <button
                type="button"
                className={styles.seeMoreButton}
                onClick={handleSeeMore}
                aria-label={`Load more experiences, currently showing ${visibleExperiences.length} of ${totalExperiences}`}
              >
                <span>See More Experience</span>
                <span className={styles.seeMoreBadge}>+{remainingCount}</span>
                <HiOutlineChevronDown aria-hidden="true" />
              </button>
            )}

            {isExpanded && (
              <button
                type="button"
                className={styles.showLessButton}
                onClick={handleShowLess}
                aria-label="Show fewer experiences"
              >
                <HiOutlineChevronUp aria-hidden="true" />
                <span>Show Less</span>
              </button>
            )}
          </div>

          <div className={styles.loadMoreCounter} aria-live="polite">
            Showing {visibleExperiences.length} of {totalExperiences} experiences
          </div>
        </div>
      )}
    </>
  );
}
