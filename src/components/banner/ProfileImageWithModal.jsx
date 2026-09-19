"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { HiOutlineX, HiOutlineArrowsExpand } from "react-icons/hi";
import { FaEnvelope, FaGithub, FaLinkedin } from "react-icons/fa";
import modalStyles from "../projects/ProjectModal.module.css";
import bannerStyles from "./banner.module.css";
import HarmonicChip from "./HarmonicChip";

export default function ProfileImageWithModal({
  profileImage,
  name,
  jobTitle,
  bio,
  socialLinks = {},
  capabilities = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const defaultCapabilities = [
    "Full-Stack Development",
    "Backend Architecture",
    "Applied AI & ML",
    "Next.js / React",
    "Python / FastAPI",
    "Node.js / NestJS",
    "Docker & Cloud",
    "PostgreSQL & MongoDB",
  ];

  const pills = capabilities.length > 0 ? capabilities : defaultCapabilities;
  const imageSrc = profileImage || "/assets/img/profile.png";

  return (
    <>
      {/* Interactive Profile Picture in Hero Card */}
      <div
        className={bannerStyles.profileImageContainer}
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`View full profile photo and bio of ${name}`}
        title="Click to view profile details"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <Image
          className={bannerStyles.profileImage}
          src={imageSrc}
          alt={`${name} - ${jobTitle}`}
          width={220}
          height={220}
          priority
        />
        <div className={bannerStyles.profileGlow} aria-hidden="true" />
        <div className={bannerStyles.zoomHint} aria-hidden="true">
          <HiOutlineArrowsExpand />
        </div>
      </div>

      {/* Profile Modal (Portal to body, styled with ProjectModal theme) */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            className={modalStyles.modalBackdrop}
            onClick={() => setIsOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
          >
            <div
              className={modalStyles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Floating close button */}
              <button
                className={modalStyles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close profile modal"
                type="button"
              >
                <HiOutlineX />
              </button>

              {/* Majority Space: High-Resolution Photo Stage */}
              <div className={modalStyles.imageStage}>
                <div className={modalStyles.imageWrapper}>
                  <Image
                    src={imageSrc}
                    alt={`${name} full portrait`}
                    fill
                    sizes="(max-width: 900px) 100vw, 70vw"
                    className={modalStyles.modalImage}
                    unoptimized
                    priority
                  />
                </div>
              </div>

              {/* Details Sidebar */}
              <aside className={modalStyles.detailsSidebar}>
                <div className={modalStyles.sidebarHeader}>
                  <span className={modalStyles.badge}>Software Engineer</span>
                  <h2 id="profile-modal-title" className={modalStyles.projectTitle}>
                    {name}
                  </h2>
                  <p
                    style={{
                      color: "var(--accent-primary, #64ffda)",
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "0.86rem",
                      marginTop: "6px",
                      lineHeight: "1.4",
                    }}
                  >
                    {jobTitle}
                  </p>
                </div>

                <div className={modalStyles.descriptionSection}>
                  <p className={modalStyles.descriptionText}>{bio}</p>
                </div>

                <div className={modalStyles.techSection}>
                  <div className={modalStyles.sectionLabel}>
                    Core Focus & Capabilities
                  </div>
                  <div className={modalStyles.techPills}>
                    {pills.map((skill, i) => (
                      <span key={i} className={modalStyles.pill}>
                        <HarmonicChip text={skill} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className={modalStyles.actionGroup}>
                  <a
                    href="#contact"
                    onClick={() => setIsOpen(false)}
                    className={modalStyles.primaryAction}
                  >
                    <FaEnvelope aria-hidden="true" />
                    <span>Get In Touch</span>
                  </a>

                  {socialLinks.github && (
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={modalStyles.secondaryAction}
                    >
                      <FaGithub aria-hidden="true" />
                      <span>GitHub Profile</span>
                    </a>
                  )}

                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={modalStyles.secondaryAction}
                    >
                      <FaLinkedin aria-hidden="true" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                </div>
              </aside>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
