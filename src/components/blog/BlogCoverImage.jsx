"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { HiOutlineArrowsExpand, HiOutlineX } from "react-icons/hi";
import BlogImage from "./BlogImage";
import styles from "./blogCoverImage.module.css";

export default function BlogCoverImage({ image, eager = false, title = "", className = "" }) {
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

  if (!image?.src) return null;

  const caption = image.caption || image.alt || title || "";

  return (
    <>
      <div
        className={`${styles.coverFrame} ${className || ""}`}
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`View full image: ${caption || "Cover Image"}`}
        title="Click to expand image"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <BlogImage image={image} eager={eager} sizes="(min-width: 860px) 480px, 100vw" />
        <div className={styles.zoomHint} aria-hidden="true">
          <HiOutlineArrowsExpand />
        </div>
      </div>

      {mounted &&
        isOpen &&
        createPortal(
          <div
            className={styles.modalBackdrop}
            onClick={() => setIsOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={caption || "Expanded image view"}
          >
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close image modal"
                type="button"
              >
                <HiOutlineX />
              </button>

              <div className={styles.imageStage}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={caption}
                  className={styles.modalImage}
                />
              </div>

              {caption ? (
                <div className={styles.captionBar}>
                  <p className={styles.captionText}>{caption}</p>
                </div>
              ) : null}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
