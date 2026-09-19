"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  HiOutlineX,
  HiOutlineExternalLink,
  HiOutlineCode,
  HiOutlineDownload,
} from "react-icons/hi";
import styles from "./ProjectModal.module.css";
import HarmonicChip from "../banner/HarmonicChip";

export default function ProjectModal({
  isOpen,
  onClose,
  project,
  imageUrl,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !project) return null;

  const { name, desc, lang, liveUrl, to, githubUrl, downloadUrl } = project;
  const technologies = Array.isArray(lang) ? lang : (lang || "").split(", ");
  const activeLiveUrl = liveUrl || (to && to !== "#" ? to : null);
  const primaryTech = technologies.find(Boolean)?.trim() || "Web App";

  return createPortal(
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
    >
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating close button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close project preview"
          type="button"
        >
          <HiOutlineX />
        </button>

        {/* Majority Space: Immersive Image Stage */}
        <div className={styles.imageStage}>
          <div className={styles.imageWrapper}>
            <Image
              src={imageUrl}
              alt={`${name} preview`}
              fill
              sizes="(max-width: 900px) 100vw, 70vw"
              className={styles.modalImage}
              unoptimized
              priority
            />
          </div>
        </div>

        {/* Details Sidebar */}
        <aside className={styles.detailsSidebar}>
          <div className={styles.sidebarHeader}>
            <span className={styles.badge}>{primaryTech}</span>
            <h2 id="modal-project-title" className={styles.projectTitle}>
              {name}
            </h2>
          </div>

          <div className={styles.descriptionSection}>
            <p className={styles.descriptionText}>{desc}</p>
          </div>

          <div className={styles.techSection}>
            <div className={styles.sectionLabel}>Technologies & Tools</div>
            <div className={styles.techPills}>
              {technologies.map((tech, i) => (
                <span key={i} className={styles.pill}>
                  <HarmonicChip text={tech.trim()} />
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actionGroup}>
            {activeLiveUrl && (
              <a
                href={activeLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryAction}
              >
                <HiOutlineExternalLink aria-hidden="true" />
                <span>Live Demo</span>
              </a>
            )}

            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryAction}
              >
                <HiOutlineCode aria-hidden="true" />
                <span>Source Code</span>
              </a>
            )}

            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryAction}
              >
                <HiOutlineDownload aria-hidden="true" />
                <span>Download</span>
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>,
    document.body
  );
}
