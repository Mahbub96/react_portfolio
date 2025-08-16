import React from "react";
import styles from "./projects.module.css";
import Project from "./Project";

// Server-side data fetching function
async function getProjectsData() {
  try {
    // This would be your actual data fetching logic
    // For now, returning mock data structure
    return {
      projects: [],
      totalCount: 0,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching projects data:", error);
    return {
      projects: [],
      totalCount: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

function Projects({ data }) {
  const projects = data?.data || [];
  const totalCount = projects.length;

  // Enhanced structured data for projects section
  const projectsStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://mahbub.dev#projects",
    name: "Mahbub Alam Portfolio Projects",
    description: "Full Stack Development Projects showcasing React, Node.js, PHP, and modern web technologies",
    numberOfItems: totalCount,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        "@id": `https://mahbub.dev#project-${project.id || index}`,
        name: project.name,
        description: project.desc,
        applicationCategory: "Web Application",
        operatingSystem: "Web Browser",
        softwareVersion: "1.0.0",
        author: {
          "@type": "Person",
          name: "Mahbub Alam",
          url: "https://mahbub.dev",
        },
        creator: {
          "@type": "Person",
          name: "Mahbub Alam",
          url: "https://mahbub.dev",
        },
        dateCreated: project.createdAt || new Date().toISOString(),
        dateModified: project.updatedAt || new Date().toISOString(),
        ...(project.src && {
          image: project.src.startsWith("http") ? project.src : `https://mahbub.dev${project.src}`,
        }),
        ...(project.to && project.to !== "#" && {
          url: project.to,
        }),
        ...(project.lang && {
          programmingLanguage: Array.isArray(project.lang) ? project.lang.join(", ") : project.lang,
        }),
      },
    })),
  };

  return (
    <>
      {/* Structured Data for Projects */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectsStructuredData),
        }}
      />

      <section 
        id="projects" 
        className={styles.projectsSection}
        itemScope
        itemType="https://schema.org/ItemList"
        aria-labelledby="projects-heading"
      >
        <div className="container">
          <header className={`${styles.sectionHeader} ${styles.animateIn}`}>
            <h2 id="projects-heading">
              <span className={styles.sectionNumber} aria-label="Section 5">05.</span> 
              Projects
              <span className={styles.projectCount} aria-label={`${totalCount} projects`}>
                ({totalCount})
              </span>
            </h2>
            <div className={styles.headerLine} aria-hidden="true"></div>
            <p className={styles.sectionDescription}>
              Showcasing my expertise in full-stack development, mobile applications, and system architecture
            </p>
          </header>

          <div className={styles.projectsGrid}>
            {projects.length > 0 ? (
              projects.map((project, idx) => (
                <Project 
                  key={project.id || `project-${idx}`} 
                  project={project} 
                  idx={idx} 
                />
              ))
            ) : (
              <div className={styles.noProjects}>
                <div className={styles.noProjectsIcon}>🚀</div>
                <h3>Projects Coming Soon</h3>
                <p>I'm currently working on some exciting projects. Check back soon!</p>
                <div className={styles.placeholderProjects}>
                  <div className={styles.placeholderProject}>
                    <div className={styles.placeholderImage}></div>
                    <div className={styles.placeholderContent}>
                      <div className={styles.placeholderTitle}></div>
                      <div className={styles.placeholderDesc}></div>
                      <div className={styles.placeholderTech}></div>
                    </div>
                  </div>
                  <div className={styles.placeholderProject}>
                    <div className={styles.placeholderImage}></div>
                    <div className={styles.placeholderContent}>
                      <div className={styles.placeholderTitle}></div>
                      <div className={styles.placeholderDesc}></div>
                      <div className={styles.placeholderTech}></div>
                    </div>
                  </div>
                  <div className={styles.placeholderProject}>
                    <div className={styles.placeholderImage}></div>
                    <div className={styles.placeholderContent}>
                      <div className={styles.placeholderTitle}></div>
                      <div className={styles.placeholderDesc}></div>
                      <div className={styles.placeholderTech}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Projects Summary */}
          {projects.length > 0 && (
            <footer className={styles.projectsFooter}>
              <div className={styles.projectsStats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{totalCount}</span>
                  <span className={styles.statLabel}>Total Projects</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>
                    {projects.filter(p => p.to && p.to !== "#").length}
                  </span>
                  <span className={styles.statLabel}>Live Demos</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>
                    {new Set(projects.flatMap(p => Array.isArray(p.lang) ? p.lang : (p.lang || "").split(", "))).size}
                  </span>
                  <span className={styles.statLabel}>Technologies</span>
                </div>
              </div>
            </footer>
          )}
        </div>
      </section>
    </>
  );
}

export default Projects;
