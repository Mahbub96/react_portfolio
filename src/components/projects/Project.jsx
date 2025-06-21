"use client";

import React from "react";
import {
  HiOutlineExternalLink,
  HiOutlineDownload,
  HiOutlineCode,
} from "react-icons/hi";
import styles from "./projects.module.css";

function Project({ project, idx }) {
  const { name, desc, src, lang, to, id } = project;

  // Handle different data structures
  const technologies = Array.isArray(lang) ? lang : (lang || "").split(", ");
  const liveUrl = to && to !== "#" ? to : null;
  const githubUrl = null; // Your real projects don't have GitHub URLs
  const downloadUrl = null; // Your real projects don't have download URLs

  // Fix image path if it's relative
  const normalizedSrc =
    src?.startsWith("./") || src?.startsWith("../")
      ? src.replace(/^\.\.\/\.\.\/assets\/img\//, "/assets/img/")
      : src;

  const handleRunProject = () => {
    if (liveUrl) {
      window.open(liveUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownloadProject = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleViewCode = () => {
    if (githubUrl) {
      window.open(githubUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article
      className={styles.projectCard}
      itemScope
      itemType="https://schema.org/SoftwareApplication"
      style={{
        animationDelay: `${idx * 0.1}s`,
      }}
    >
      {/* Project Image */}
      <div className={styles.projectImage}>
        <img
          src={normalizedSrc}
          alt={name}
          itemProp="image"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/400x250/20c997/0f1419?text=${encodeURIComponent(
              name
            )}`;
          }}
        />
        <div className={styles.imageOverlay}>
          <div className={styles.overlayContent}>
            <h3>{name}</h3>
            <p>{desc}</p>
          </div>
        </div>
      </div>

      {/* Project Content */}
      <div className={styles.projectContent}>
        <h3 itemProp="name">{name}</h3>
        <p itemProp="description">{desc}</p>
        <div className={styles.techStack}>
          {technologies.map((tech, index) => (
            <span key={index} className={styles.techTag}>
              {tech.trim()}
            </span>
          ))}
        </div>

        {/* Project Action Buttons */}
        <div className={styles.projectActions}>
          {liveUrl && (
            <button
              className={`${styles.projectButton} ${styles.runButton}`}
              onClick={handleRunProject}
              title="View Live Demo"
              aria-label={`View ${name} live demo`}
            >
              <HiOutlineExternalLink className={styles.buttonIcon} />
            </button>
          )}

          {downloadUrl && (
            <button
              className={`${styles.projectButton} ${styles.downloadButton}`}
              onClick={handleDownloadProject}
              title="Download Project"
              aria-label={`Download ${name} project`}
            >
              <HiOutlineDownload className={styles.buttonIcon} />
            </button>
          )}

          {githubUrl && (
            <button
              className={`${styles.projectButton} ${styles.codeButton}`}
              onClick={handleViewCode}
              title="View Source Code"
              aria-label={`View ${name} source code`}
            >
              <HiOutlineCode className={styles.buttonIcon} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default Project;
