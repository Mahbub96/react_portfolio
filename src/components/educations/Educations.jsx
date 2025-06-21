"use client";
import React, { useState } from "react";
import styles from "./educations.module.css";
import { useDataContex } from "../../contexts/useAllContext";
import ModalView from "../ModalView";
import ThreeDots from "../ThreeDots";

function Educations({ data }) {
  const [modalShow, setModalShow] = useState(false);
  const { auth } = useDataContex();
  const [selectedEducation, setSelectedEducation] = useState(null);

  // Use server data for rendering
  const education = data?.data || [];

  const handleEdit = (education) => {
    setSelectedEducation(education);
    setModalShow(true);
  };

  const handleDelete = async (education) => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Are you sure you want to delete this education?")
    ) {
      try {
        // TODO: Implement delete via API endpoint
        console.log("Delete education:", education.id);
      } catch (error) {
        console.error("Error deleting education:", error);
      }
    }
  };

  return (
    <section id="education" className={styles.educationSection}>
      <div className="container">
        <div className={`${styles.sectionHeader} ${styles.animateIn}`}>
          <h2>
            <span className={styles.sectionNumber}>04.</span> Education
          </h2>
          <div className={styles.headerLine}></div>
        </div>

        <div className={styles.timelineContainer}>
          <div className={styles.verticalLine}></div>
          {education.length > 0 ? (
            education.map((education, index) => (
              <div
                key={education.id}
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
                        onClick={() => handleEdit(education)}
                        title="Edit Education"
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() => handleDelete(education)}
                        title="Delete Education"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  )}
                  <div className={styles.timelineDot}></div>
                  <span className={styles.date}>{education.time}</span>
                  <h3 className={styles.title}>{education.name}</h3>
                  <p className={styles.degree}>{education.degName}</p>
                  <p className={styles.department}>{education.Department}</p>
                  <p className={styles.cgpa}>CGPA: {education.cgpa}</p>
                  {education.Thesis && (
                    <p className={styles.thesis}>Thesis: {education.Thesis}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.loading}>
              <ThreeDots />
            </div>
          )}

          {auth && (
            <div className={`${styles.addEducation} ${styles.animateIn}`}>
              <button
                onClick={() => {
                  setSelectedEducation(null);
                  setModalShow(true);
                }}
              >
                <div className={styles.addIcon}>+</div>
                <p>Add New Education</p>
              </button>
            </div>
          )}
        </div>
      </div>

      <ModalView
        show={modalShow}
        onHide={() => setModalShow(false)}
        title="Education"
        data={selectedEducation}
        collectionName="Education"
      />
    </section>
  );
}

export default Educations;
