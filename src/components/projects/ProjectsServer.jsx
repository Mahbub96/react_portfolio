import React from "react";
import styles from "./projects.module.css";
import Project from "./Project";
import HarmonicHeading from "../HarmonicHeading";

// Server-side Projects component for better SEO
const ProjectsServer = ({ data }) => {
  // Validate and normalize projects data
  const validateProjectsData = (projectsData) => {
    if (!projectsData || !Array.isArray(projectsData)) {
      return [];
    }

    return projectsData.filter(
      (project) => project && typeof project === "object"
    );
  };

  const projects = validateProjectsData(data?.data);
  const totalCount = projects.length;

  return (
    <>
      <section
        id="projects"
        className={styles.projectsSection}
        aria-labelledby="projects-heading"
      >
        <div className="container">
          <header className={`${styles.sectionHeader} ${styles.animateIn}`}>
            <HarmonicHeading
              as="h2"
              id="projects-heading"
              text="Projects"
            >
              <span
                className={styles.projectCount}
                aria-label={`${totalCount} projects`}
              >
                ({totalCount})
              </span>
            </HarmonicHeading>
            <div className={styles.headerLine} aria-hidden="true"></div>
          </header>

          <div
            className={styles.projectsGrid}
            role="list"
            aria-label="Portfolio projects grid"
          >
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <div
                  key={project.id}
                  className={styles.projectListItem}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  role="listitem"
                  aria-label={`${project.name} project card`}
                >
                  <Project
                    project={project}
                    index={index}
                  />
                </div>
              ))
            ) : (
              <div className={styles.noProjects}>
                <p>No projects available at the moment.</p>
                <p>Check back soon for new additions to the portfolio!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ProjectsServer;
