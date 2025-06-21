"use client";
import React, { useState } from "react";
import styles from "./experience.module.css";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import ThreeDots from "../ThreeDots";

function Experience() {
  const [modalShow, setModalShow] = useState(false);
  const { auth } = useDataContex();
  const { Experiences } = useFirestore().data;
  const [selectedExperience, setSelectedExperience] = useState(null);
  const { deleteDocument } = useFirestore();

  // Helper to get total experience in years and months or decimal years
  const getTotalExperienceDisplay = () => {
    if (!Experiences || !Experiences.data || Experiences.data.length === 0)
      return null;
    // Find the earliest start and latest end (or today if any are present)
    let minStart = null;
    let maxEnd = null;
    Experiences.data.forEach((exp) => {
      // Parse start
      let startRaw = exp.startDate || exp.time?.split("-")[0] || exp.time;
      let endRaw = exp.endDate || exp.time?.split("-")[1] || exp.time;
      // Helper to parse YYYY-MM or YYYY/MM or YYYY
      function parseDate(str) {
        if (!str) return null;
        str = str.trim();
        if (/present/i.test(str)) return new Date();
        // Try YYYY-MM or YYYY/MM
        let match = str.match(/^(\d{4})[-/](\d{1,2})$/);
        if (match) {
          // Month is 0-based in JS Date
          return new Date(Number(match[1]), Number(match[2]) - 1);
        }
        // Try YYYY
        match = str.match(/^(\d{4})$/);
        if (match) {
          return new Date(Number(match[1]), 0);
        }
        // Fallback to Date constructor
        let d = new Date(str);
        if (!isNaN(d)) return d;
        return null;
      }
      let start = parseDate(startRaw);
      let end = parseDate(endRaw);
      if (!end) end = new Date();
      // Debug log for Safari troubleshooting
      console.log("Experience date debug:", { startRaw, endRaw, start, end });
      // Only use valid dates
      if (
        start instanceof Date &&
        !isNaN(start) &&
        end instanceof Date &&
        !isNaN(end)
      ) {
        if (!minStart || start < minStart) minStart = start;
        if (!maxEnd || end > maxEnd) maxEnd = end;
      }
    });
    if (!minStart || !maxEnd) return null;
    let years = maxEnd.getFullYear() - minStart.getFullYear();
    let months = maxEnd.getMonth() - minStart.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    const decimalYears = (years + months / 12).toFixed(1);
    const fullText = `${years} year${years !== 1 ? "s" : ""} ${months} month${
      months !== 1 ? "s" : ""
    }`;
    return {
      decimal: `${decimalYears} year${decimalYears !== "1.0" ? "s" : ""}`,
      full: fullText,
    };
  };

  const handleEdit = (experience) => {
    setSelectedExperience(experience);
    setModalShow(true);
  };

  const handleDelete = async (experience) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      try {
        await deleteDocument("Experiences", experience.id);
      } catch (error) {
        console.error("Error deleting experience:", error);
      }
    }
  };

  return (
    <section id="experience" className={styles.experienceSection}>
      <div className="container">
        <div className={`${styles.sectionHeader} ${styles.animateIn}`}>
          <h2>
            <span className={styles.sectionNumber}>03.</span> Where I've Worked
          </h2>
          <div className={styles.headerLine}></div>
          {/* Show total experience */}
          {Experiences &&
            Experiences.data.length > 0 &&
            getTotalExperienceDisplay() && (
              <div
                className="w-full max-w-full text-center break-words px-6 py-3 rounded-md font-bold text-base mt-4 mb-4 shadow-sm border-0 inline-block sm:text-base sm:px-4 sm:py-2 sm:mt-2 sm:mb-2 bg-white/90 dark:bg-neutral-900/90"
                style={{
                  color: styles.date ? undefined : "var(--heading_color)",
                  transition: "background 0.3s, color 0.3s",
                }}
              >
                {/* Only show one format at a time based on screen size */}
                <span className={styles.showOnMobile}>
                  <span className={styles.date}>
                    {getTotalExperienceDisplay()?.decimal}
                  </span>
                </span>
                <span className={styles.showOnDesktop}>
                  <span className={styles.date}>
                    Total Experience: {getTotalExperienceDisplay()?.full}
                  </span>
                </span>
              </div>
            )}
        </div>

        <div className={styles.timelineContainer}>
          <div className={styles.verticalLine}></div>
          {Experiences ? (
            Experiences.data.map((experience, index) => (
              <div
                key={experience.id || `experience-${index}`}
                className={`${styles.timelineItem} ${
                  index % 2 === 0 ? styles.left : styles.right
                } ${styles.animateInTimeline}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={styles.timelineContent}>
                  {auth && (
                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.actionButton} ${styles.editButton}`}
                        onClick={() => handleEdit(experience)}
                        title="Edit Experience"
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleDelete(experience)}
                        title="Delete Experience"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  )}
                  <div className={styles.timelineDot}></div>
                  <span className={styles.date}>{experience.time}</span>
                  <h3 className={styles.title}>{experience.name}</h3>
                  <p className={styles.description}>{experience.how}</p>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.loading}>
              <ThreeDots />
            </div>
          )}

          {auth && (
            <div className={`${styles.addExperience} ${styles.animateIn}`}>
              <button
                onClick={() => {
                  setSelectedExperience(null);
                  setModalShow(true);
                }}
              >
                <div className={styles.addIcon}>+</div>
                <p>Add New Experience</p>
              </button>
            </div>
          )}
        </div>
      </div>

      <ModalView
        show={modalShow}
        onHide={() => setModalShow(false)}
        title="Experience"
        data={selectedExperience}
        collectionName="Experiences"
      />
    </section>
  );
}

export default Experience;
