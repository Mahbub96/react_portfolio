"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  HiOutlineExternalLink,
  HiOutlineDownload,
  HiOutlineCode,
  HiOutlineArrowsExpand,
} from "react-icons/hi";
import styles from "./projects.module.css";
import ProjectModal from "./ProjectModal";
import HarmonicChip from "@/components/HarmonicChip";

function Project({ project, idx = 0 }) {
  const { name, desc, src, lang, to, id } = project;
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const technologies = Array.isArray(lang) ? lang : (lang || "").split(", ");
  const liveUrl = project.liveUrl || (to && to !== "#" ? to : null);
  const githubUrl = project.githubUrl || null;
  const downloadUrl = project.downloadUrl || null;
  const primaryTech = technologies.find(Boolean)?.trim() || "Web App";

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
  const imageUrl = normalizedSrc || "/assets/img/projects.png";

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
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
      {/* Project Image with Click-to-Modal Preview */}
      <div
        className={styles.projectImage}
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`Open full preview and details for ${name}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
      >
        {!imageError ? (
          <Image
            src={imageUrl}
            alt={`${name} - ${desc}`}
            itemProp="image"
            width={400}
            height={250}
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized
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
        <div className={styles.imageZoomOverlay}>
          <HiOutlineArrowsExpand aria-hidden="true" />
          <span>Quick Preview</span>
        </div>
        <div className={styles.projectBadge}>
          <HarmonicChip text={primaryTech} />
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
              <HarmonicChip text={tech.trim()} />
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
          <a
            className={`${styles.projectButton} ${styles.runButton}`}
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="View live demo"
            aria-label={`View ${name} live demo`}
            itemProp="url"
          >
            <HiOutlineExternalLink
              className={styles.buttonIcon}
              aria-hidden="true"
            />
            <span>Live</span>
          </a>
        )}

        {downloadUrl && (
          <a
            className={`${styles.projectButton} ${styles.downloadButton}`}
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Download Project"
            aria-label={`Download ${name} project`}
          >
            <HiOutlineDownload
              className={styles.buttonIcon}
              aria-hidden="true"
            />
            <span>Download</span>
          </a>
        )}

        {githubUrl && (
          <a
            className={`${styles.projectButton} ${styles.codeButton}`}
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="View Source Code"
            aria-label={`View ${name} source code`}
          >
            <HiOutlineCode className={styles.buttonIcon} aria-hidden="true" />
            <span>Code</span>
          </a>
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

      {/* Bezel-less theme-aligned project modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={project}
        imageUrl={imageUrl}
      />
    </article>
  );
}

export default Project;
