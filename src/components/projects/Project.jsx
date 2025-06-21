"use client";

import React from "react";
import {
  HiOutlineExternalLink,
  HiOutlineDownload,
  HiOutlineCode,
} from "react-icons/hi";
import styles from "./projects.module.css";

function Project({ project, idx }) {
  const { src, name, desc, altTxt, lang, to, liveUrl, downloadUrl, githubUrl } =
    project;

  // Convert lang to string and handle cases where it might be undefined/null
  const technologies = typeof lang === "string" ? lang.split(",") : [];

  const handleRunProject = () => {
    if (liveUrl) {
      window.open(liveUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("Live demo URL not available for this project.");
    }
  };

  const handleDownloadProject = () => {
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Download URL not available for this project.");
    }
  };

  const handleGitHubRepo = () => {
    if (githubUrl) {
      window.open(githubUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("GitHub repository URL not available for this project.");
    }
  };

  return (
    <article
      className={styles.projectCard}
      itemScope
      itemType="http://schema.org/SoftwareApplication"
    >
      <div className={styles.projectImage}>
        <img
          src={src}
          alt={altTxt || `${name} project screenshot`}
          loading="lazy"
          itemProp="image"
        />
      </div>
      <div className={styles.projectContent}>
        <h3 className={styles.projectTitle} itemProp="name">
          {name}
        </h3>
        <p className={styles.projectDesc} itemProp="description">
          {desc}
        </p>
        <div className={styles.projectTech}>
          {technologies.map((tech, index) => (
            <span key={index} className={styles.techTag}>
              {tech.trim()}
            </span>
          ))}
        </div>

        {/* Project Action Buttons */}
        <div className={styles.projectActions}>
          <button
            className={`${styles.projectButton} ${styles.runButton}`}
            onClick={handleRunProject}
            title="View Live Demo"
            aria-label={`View ${name} live demo`}
          >
            <HiOutlineExternalLink className={styles.buttonIcon} />
          </button>

          <button
            className={`${styles.projectButton} ${styles.downloadButton}`}
            onClick={handleDownloadProject}
            title="Download Source Code"
            aria-label={`Download ${name} source code`}
          >
            <HiOutlineDownload className={styles.buttonIcon} />
          </button>

          <button
            className={`${styles.projectButton} ${styles.githubButton}`}
            onClick={handleGitHubRepo}
            title="View Source Code"
            aria-label={`View ${name} source code on GitHub`}
          >
            <HiOutlineCode className={styles.buttonIcon} />
          </button>
        </div>
      </div>
    </article>
  );
}

export default Project;
