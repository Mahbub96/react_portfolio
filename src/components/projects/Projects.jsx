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
        className="py-24 relative overflow-hidden bg-gray-900 w-full max-w-full"
        itemScope
        itemType="https://schema.org/ItemList"
        aria-labelledby="projects-heading"
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-100 pointer-events-none -z-10"></div>
        <div className="absolute inset-0 bg-gradient-radial from-teal-500/5 via-transparent to-blue-500/5 opacity-30 pointer-events-none -z-10"></div>
        <div className="container mx-auto px-4">
          <header className="flex items-center gap-6 mb-16 relative">
            <h2
              id="projects-heading"
              className="text-4xl md:text-5xl font-bold text-gray-100 flex items-center gap-6 m-0"
            >
              Projects
              <span
                className="text-2xl font-semibold text-teal-400 font-mono relative"
                aria-label={`${totalCount} projects`}
              >
                ({totalCount})
              </span>
            </h2>
            <div
              className="h-0.5 flex-grow bg-gradient-to-r from-teal-400 to-blue-500 rounded-full relative overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl">
              Showcasing my expertise in full-stack development, mobile
              applications, and system architecture
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6 md:gap-8 lg:gap-8 xl:gap-8 max-w-7xl mx-auto">
            {projects.length > 0 ? (
              projects.map((project, idx) => (
                <Project
                  key={project.id || `project-${idx}`}
                  project={project}
                  idx={idx}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-gray-200 mb-4">
                  Projects Coming Soon
                </h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  I'm currently working on some exciting projects. Check back
                  soon!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
                    <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
                    <div className="space-y-3">
                      <div className="bg-gray-700 h-6 rounded w-3/4"></div>
                      <div className="bg-gray-700 h-4 rounded w-full"></div>
                      <div className="bg-gray-700 h-4 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
                    <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
                    <div className="space-y-3">
                      <div className="bg-gray-700 h-6 rounded w-3/4"></div>
                      <div className="bg-gray-700 h-4 rounded w-full"></div>
                      <div className="bg-gray-700 h-4 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-6 animate-pulse md:col-span-2 lg:col-span-1">
                    <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
                    <div className="space-y-3">
                      <div className="bg-gray-700 h-6 rounded w-3/4"></div>
                      <div className="bg-gray-700 h-4 rounded w-full"></div>
                      <div className="bg-gray-700 h-4 rounded w-2/3"></div>
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
                    {projects.filter((p) => p.to && p.to !== "#").length}
                  </span>
                  <span className={styles.statLabel}>Live Demos</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>
                    {
                      new Set(
                        projects.flatMap((p) =>
                          Array.isArray(p.lang)
                            ? p.lang
                            : (p.lang || "").split(", ")
                        )
                      ).size
                    }
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
