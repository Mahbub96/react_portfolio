import React from "react";
import styles from "./projects.module.css";
import Project from "./Project";

// Server-side Projects component for better SEO
const ProjectsServer = ({ data }) => {
  // Validate and normalize projects data
  const validateProjectsData = (projectsData) => {
    if (!projectsData || !Array.isArray(projectsData)) {
      console.warn(
        "ProjectsServer: Invalid projects data, using empty array",
        projectsData
      );
      return [];
    }

    // Ensure each project has required properties
    return projectsData.filter((project) => {
      if (!project || typeof project !== "object") {
        console.warn("ProjectsServer: Invalid project object:", project);
        return false;
      }
      return true;
    });
  };

  const projects = validateProjectsData(data?.data);
  const totalCount = projects.length;

  // Enhanced structured data for projects section
  const projectsStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://mahbub.dev#projects",
    name: "Mahbub Alam Portfolio Projects",
    description:
      "Full Stack Development Projects showcasing React, Node.js, PHP, and modern web technologies",
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
          image: project.src.startsWith("http")
            ? project.src
            : `https://mahbub.dev${project.src}`,
        }),
        ...(project.to &&
          project.to !== "#" && {
            url: project.to,
          }),
        ...(project.lang && {
          programmingLanguage: Array.isArray(project.lang)
            ? project.lang.join(", ")
            : project.lang,
        }),
      },
    })),
  };

  // Portfolio structured data
  const portfolioStructuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": "https://mahbub.dev#portfolio",
    name: "Mahbub Alam Development Portfolio",
    description:
      "Collection of web development projects and applications built by Mahbub Alam",
    creator: {
      "@type": "Person",
      name: "Mahbub Alam",
      url: "https://mahbub.dev",
    },
    dateCreated: "2024-01-01",
    dateModified: new Date().toISOString(),
    genre: "Web Development",
    keywords:
      "React, Node.js, PHP, Laravel, MongoDB, AWS, Docker, Web Applications",
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Mahbub Alam Portfolio",
      url: "https://mahbub.dev",
    },
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

      {/* Portfolio Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(portfolioStructuredData),
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
              Projects
              <span
                className={styles.projectCount}
                aria-label={`${totalCount} projects`}
              >
                ({totalCount})
              </span>
            </h2>
            <div className={styles.headerLine} aria-hidden="true"></div>
          </header>

          <div
            className={styles.projectsGrid}
            itemProp="itemListElement"
            role="list"
            aria-label="Portfolio projects grid"
          >
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <div
                  key={project.id}
                  className={`${styles.projectCard} ${styles.animateInCard}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  role="listitem"
                  aria-label={`${project.name} project card`}
                >
                  <Project
                    project={project}
                    index={index}
                    itemScope
                    itemType="https://schema.org/SoftwareApplication"
                    itemProp="itemListElement"
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
