import React from "react";
import styles from "./projects.module.css";
import Project from "./Project";

function Projects({ data }) {
  const projects = data?.data || [];

  return (
    <section id="projects" className={styles.projectsSection}>
      <div className="container">
        <div className={`${styles.sectionHeader} ${styles.animateIn}`}>
          <h2>
            <span className={styles.sectionNumber}>05.</span> Projects
          </h2>
          <div className={styles.headerLine}></div>
        </div>

        <div className={styles.projectsGrid}>
          {projects.length > 0 ? (
            projects.map((project, idx) => (
              <Project key={project.id} project={project} idx={idx} />
            ))
          ) : (
            <div className={styles.loading}>No projects found.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Projects;
