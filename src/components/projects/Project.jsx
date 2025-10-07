"use client";

import React, { useState } from "react";
import {
  HiOutlineExternalLink,
  HiOutlineDownload,
  HiOutlineCode,
} from "react-icons/hi";
import styles from "./projects.module.css";

function Project({ project, idx }) {
  const { name, desc, src, lang, to, id } = project;
  const [imageError, setImageError] = useState(false);

  // Handle different data structures
  const technologies = Array.isArray(lang) ? lang : (lang || "").split(", ");
  const liveUrl = to && to !== "#" ? to : null;
  const githubUrl = null; // Your real projects don't have GitHub URLs
  const downloadUrl = null; // Your real projects don't have download URLs

  // Enhanced image path normalization
  const normalizeImagePath = (imageSrc) => {
    if (!imageSrc) return null;

    // If it's already a full URL, return as is
    if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
      return imageSrc;
    }

    // Handle relative paths
    if (imageSrc.startsWith("./") || imageSrc.startsWith("../")) {
      // Remove the relative path prefixes and normalize
      const cleanPath = imageSrc
        .replace(/^\.\.\/\.\.\/assets\/img\//, "/assets/img/")
        .replace(/^\.\/assets\/img\//, "/assets/img/")
        .replace(/^\.\.\/assets\/img\//, "/assets/img/");

      return cleanPath;
    }

    // If it's a path starting with /, it's already absolute
    if (imageSrc.startsWith("/")) {
      return imageSrc;
    }

    // Default fallback
    return `/assets/img/${imageSrc}`;
  };

  // Get the normalized image source
  const normalizedSrc = normalizeImagePath(src);

  // Enhanced image URL for production with fallback
  const imageUrl = normalizedSrc || "/assets/img/default-project.jpg";

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // Server-side safe event handlers
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
      aria-labelledby={`project-${id || idx}-title`}
    >
      {/* Project Image with Error Handling */}
      <div className={styles.projectImage}>
        {!imageError ? (
          <img
            src={imageUrl}
            alt={`${name} - ${desc}`}
            itemProp="image"
            loading="lazy"
            width="400"
            height="250"
            onError={handleImageError}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <div className={styles.imageFallback}>
            <div className={styles.fallbackIcon}>
              <HiOutlineCode />
            </div>
            <span className={styles.fallbackText}>{name}</span>
          </div>
        )}
        <div className={styles.imageOverlay}>
          <div className={styles.overlayContent}>
            <h3 id={`project-${id || idx}-title`}>{name}</h3>
            <p className={styles.overlayDescription}>{desc}</p>
          </div>
        </div>
      </div>

      {/* Project Content */}
      <div className={styles.projectContent}>
        <h3 itemProp="name" id={`project-${id || idx}-title`}>
          {name}
        </h3>
        <p className={styles.bodyDescription} itemProp="description">
          {desc}
        </p>

        {/* Technologies Stack */}
        <div className={styles.techStack} aria-label="Technologies used">
          {technologies.map((tech, index) => (
            <span
              key={index}
              className={styles.techTag}
              itemProp="programmingLanguage"
            >
              {tech.trim()}
            </span>
          ))}
        </div>

        {/* Project Metadata */}
        <div className={styles.projectMetadata}>
          <meta itemProp="applicationCategory" content="Web Application" />
          <meta itemProp="operatingSystem" content="Web Browser" />
          <meta itemProp="softwareVersion" content="1.0.0" />
          <meta
            itemProp="dateCreated"
            content={project.createdAt || new Date().toISOString()}
          />
          <meta
            itemProp="dateModified"
            content={project.updatedAt || new Date().toISOString()}
          />
        </div>
      </div>

      {/* Action Buttons Container - Appears in the gap on hover */}
      <div className={styles.actionButtonsContainer}>
        {liveUrl && (
          <button
            className={`${styles.projectButton} ${styles.runButton}`}
            onClick={handleRunProject}
            title="View Live Demo"
            aria-label={`View ${name} live demo`}
            itemProp="url"
          >
            <HiOutlineExternalLink
              className={styles.buttonIcon}
              aria-hidden="true"
            />
          </button>
        )}

        {downloadUrl && (
          <button
            className={`${styles.projectButton} ${styles.downloadButton}`}
            onClick={handleDownloadProject}
            title="Download Project"
            aria-label={`Download ${name} project`}
          >
            <HiOutlineDownload
              className={styles.buttonIcon}
              aria-hidden="true"
            />
          </button>
        )}

        {githubUrl && (
          <button
            className={`${styles.projectButton} ${styles.codeButton}`}
            onClick={handleViewCode}
            title="View Source Code"
            aria-label={`View ${name} source code`}
          >
            <HiOutlineCode className={styles.buttonIcon} aria-hidden="true" />
          </button>
        )}

        {/* Fallback for projects without actions */}
        {!liveUrl && !downloadUrl && !githubUrl && (
          <div className={styles.noActions}>
            <span className={styles.noActionsText}>No Actions Available</span>
          </div>
        )}
      </div>

      {/* Additional Schema.org markup */}
      <div className={styles.schemaData} style={{ display: "none" }}>
        <meta itemProp="author" content="Mahbub Alam" />
        <meta itemProp="creator" content="Mahbub Alam" />
        <meta itemProp="publisher" content="Mahbub Alam" />
        <meta itemProp="inLanguage" content="en" />
        <meta itemProp="isAccessibleForFree" content="true" />
        <meta itemProp="offers" content="Free to use" />
      </div>
    </article>
  );
}

export default Project;
