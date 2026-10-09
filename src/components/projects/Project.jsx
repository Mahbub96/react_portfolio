"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HiOutlineExternalLink,
  HiOutlineDownload,
  HiOutlineCode,
  HiOutlineArrowsExpand,
} from "react-icons/hi";
import styles from "./projects.module.css";
import ProjectModal from "./ProjectModal";
import HarmonicChip from "@/components/HarmonicChip";
import { projectSlug } from "@/lib/seo/slug.mjs";

// titleAs: h3 under the homepage's h2 "Projects"; the standalone /projects
// page (h1) passes "h2" so the heading outline stays sequential.
function Project({ project, idx = 0, titleAs: TitleTag = "h3" }) {
  const { name, desc, src, lang, to, id } = project;
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const technologies = Array.isArray(lang) ? lang : (lang || "").split(", ");
  const liveUrl = project.liveUrl || (to && to !== "#" ? to : null);
  const githubUrl = project.githubUrl || null;
  const downloadUrl = project.downloadUrl || null;
  const primaryTech = technologies.find(Boolean)?.trim() || "Web App";

  // Detail-page path. Derived with the same helper the route and sitemap use,
  // so a card can never link to a slug the router does not resolve.
  const slug = project.slug || projectSlug(project);
  const detailHref = slug ? `/projects/${slug}/` : null;

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
            width={400}
            height={250}
            sizes="(max-width: 768px) 100vw, 400px"
            /*
              No `unoptimized` here on purpose. next.config.js already declares
              WebP/AVIF output; bypassing the optimizer meant the browser
              downloaded the raw ~1 MB PNG source for every card (~6 MB of
              images on the homepage). Letting Next serve them cuts that by
              roughly an order of magnitude at identical display size.
            */
            loading="lazy"
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
        <TitleTag id={`project-${id || idx}-title`}>
          {name}
        </TitleTag>
        <p className={styles.bodyDescription}>
          {desc}
        </p>

        {/* Technologies Stack */}
        <div className={styles.techStack} aria-label="Technologies used">
          {technologies.map((tech, index) => (
            <span
              key={index}
              className={styles.techTag}
            >
              <HarmonicChip text={tech.trim()} />
            </span>
          ))}
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

        {/*
          Internal link to the project's own page. This is the crawl path that
          makes /projects/<slug>/ reachable: without an <a href> pointing at it
          the detail page exists only in the sitemap, which is a far weaker
          signal than a real in-content link.
        */}
        {detailHref && (
          <Link
            className={`${styles.projectButton} ${styles.detailButton}`}
            href={detailHref}
            title={`Read more about ${name}`}
            aria-label={`Read more about ${name}`}
          >
            <HiOutlineArrowsExpand
              className={styles.buttonIcon}
              aria-hidden="true"
            />
            <span>Details</span>
          </Link>
        )}

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
