import React, { useState } from "react";
import { motion } from "framer-motion";
import styles from "./educations.module.css";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import ThreeDots from "../ThreeDots";

function Educations() {
  const [modalShow, setModalShow] = useState(false);
  const { auth } = useDataContex();
  const { Education } = useFirestore().data;
  const [selectedEducation, setSelectedEducation] = useState(null);
  const { deleteDocument } = useFirestore();

  const handleEdit = (education) => {
    setSelectedEducation(education);
    setModalShow(true);
  };

  const handleDelete = async (education) => {
    if (window.confirm("Are you sure you want to delete this education?")) {
      try {
        await deleteDocument("Education", education.id);
      } catch (error) {
        console.error("Error deleting education:", error);
      }
    }
  };

  return (
    <section id="education" className={styles.educationSection}>
      <div className="container">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>
            <span className={styles.sectionNumber}>04.</span> Education
          </h2>
          <div className={styles.headerLine}></div>
        </motion.div>

        <div className={styles.timelineContainer}>
          <div className={styles.verticalLine}></div>
          {Education ? (
            Education.data.map((education, index) => (
              <motion.div
                key={education.id}
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
              </motion.div>
            ))
          ) : (
            <div className={styles.loading}>
              <ThreeDots />
            </div>
          )}

          {auth && (
            <motion.button
              className={styles.addEducation}
              onClick={() => {
                setSelectedEducation(null);
                setModalShow(true);
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className={styles.addIcon}>+</div>
              <p>Add New Education</p>
            </motion.button>
          )}
        </div>
      </div>

      <ModalView
        name="Education"
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          setSelectedEducation(null);
        }}
        initialData={selectedEducation}
        title={selectedEducation ? "Edit Education" : "Add Education"}
        onSuccess={() => {
          setModalShow(false);
          setSelectedEducation(null);
        }}
      />
    </section>
  );
}

export default Educations;
