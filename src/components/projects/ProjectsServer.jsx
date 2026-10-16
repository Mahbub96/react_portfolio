import React from "react";
import styles from "./projects.module.css";
import Project from "./Project";
import ProjectsGridClient from "./ProjectsGridClient";
import HarmonicHeading from "../HarmonicHeading";
import { SectionAdminProvider } from "@/components/admin/contextual/PortfolioContextualControls";

// Server-side Projects component for better SEO
const ProjectsServer = ({ data, headingLevel = "h2" }) => {
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
              as={headingLevel}
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

          <SectionAdminProvider collectionName="Projects">
            <ProjectsGridClient
              projects={projects}
              headingLevel={headingLevel}
            />
          </SectionAdminProvider>
        </div>
      </section>
    </>
  );
};

export default ProjectsServer;
