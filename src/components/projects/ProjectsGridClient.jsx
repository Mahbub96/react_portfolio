"use client";

import React, { useState } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import styles from "./projects.module.css";
import Project from "./Project";
import ProjectsAddCard from "./ProjectsAddCard";

// Exactly two rows on large screen (3 cards per row in 1240px container)
const INITIAL_PROJECTS_COUNT = 6;
const PAGE_SIZE = 6;

export default function ProjectsGridClient({ projects = [], headingLevel = "h2" }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_PROJECTS_COUNT);

  const totalProjects = projects.length;
  const visibleProjects = projects.slice(0, visibleCount);
  const hasMore = visibleCount < totalProjects;
  const isExpanded = visibleCount > INITIAL_PROJECTS_COUNT;
  const remainingCount = totalProjects - visibleCount;

  const handleSeeMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, totalProjects));
  };

  const handleShowLess = () => {
    setVisibleCount(INITIAL_PROJECTS_COUNT);
    const sectionEl = document.getElementById("projects");
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <div
        className={styles.projectsGrid}
        role="list"
        aria-label="Portfolio projects grid"
      >
        {visibleProjects.length > 0 ? (
          visibleProjects.map((project, index) => (
            <div
              key={project.id || `project-${index}`}
              className={styles.projectListItem}
              style={{ animationDelay: `${(index % PAGE_SIZE) * 0.08}s` }}
              role="listitem"
              aria-label={`${project.name} project card`}
            >
              <Project
                project={project}
                idx={index}
                titleAs={headingLevel === "h1" ? "h2" : "h3"}
              />
            </div>
          ))
        ) : (
          <div className={styles.noProjects}>
            <p>No projects available at the moment.</p>
            <p>Check back soon for new additions to the portfolio!</p>
          </div>
        )}
        <ProjectsAddCard />
      </div>

      {totalProjects > INITIAL_PROJECTS_COUNT && (
        <div className={styles.loadMoreContainer}>
          <div className={styles.loadMoreButtonsGroup}>
            {hasMore && (
              <button
                type="button"
                className={styles.seeMoreButton}
                onClick={handleSeeMore}
                aria-label={`Load more projects, currently showing ${visibleProjects.length} of ${totalProjects}`}
              >
                <span>See More Projects</span>
                <span className={styles.seeMoreBadge}>+{remainingCount}</span>
                <HiOutlineChevronDown aria-hidden="true" />
              </button>
            )}

            {isExpanded && (
              <button
                type="button"
                className={styles.showLessButton}
                onClick={handleShowLess}
                aria-label="Show fewer projects"
              >
                <HiOutlineChevronUp aria-hidden="true" />
                <span>Show Less</span>
              </button>
            )}
          </div>

          <div className={styles.loadMoreCounter} aria-live="polite">
            Showing {visibleProjects.length} of {totalProjects} projects
          </div>
        </div>
      )}
    </>
  );
}
