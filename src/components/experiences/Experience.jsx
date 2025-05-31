import React, { useState } from "react";
import { motion } from "framer-motion";
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
      let start = exp.startDate || exp.time?.split("-")[0] || exp.time;
      let end = exp.endDate || exp.time?.split("-")[1] || exp.time;
      // Clean up
      if (start) start = new Date(start.trim());
      if (end) {
        if (typeof end === "string" && end.toLowerCase().includes("present")) {
          end = new Date();
        } else {
          end = new Date(end.trim());
        }
      } else {
        end = new Date();
      }
      if (!minStart || (start && start < minStart)) minStart = start;
      if (!maxEnd || (end && end > maxEnd)) maxEnd = end;
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
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>
            <span className={styles.sectionNumber}>03.</span> Where I've Worked
          </h2>
          <div className={styles.headerLine}></div>
          {/* Show total experience */}
          {Experiences && Experiences.data.length > 0 && (
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
        </motion.div>

        <div className={styles.timelineContainer}>
          <div className={styles.verticalLine}></div>
          {Experiences ? (
            Experiences.data.map((experience, index) => (
              <motion.div
                key={experience.id || `experience-${index}`}
                className={`${styles.timelineItem} ${
                  index % 2 === 0 ? styles.left : styles.right
                }`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
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
              </motion.div>
            ))
          ) : (
            <div className={styles.loading}>
              <ThreeDots />
            </div>
          )}

          {auth && (
            <motion.button
              className={styles.addExperience}
              onClick={() => {
                setSelectedExperience(null);
                setModalShow(true);
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.addIcon}>+</div>
              <p>Add New Experience</p>
            </motion.button>
          )}
        </div>
      </div>

      <ModalView
        name="Experiences"
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          setSelectedExperience(null);
        }}
        initialData={selectedExperience}
        title={selectedExperience ? "Edit Experience" : "Add Experience"}
        onSuccess={() => {
          setModalShow(false);
          setSelectedExperience(null);
        }}
      />
    </section>
  );
}

export default Experience;
