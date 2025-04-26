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

  // const calculateExperience = (startDate) => {
  //   const start = new Date(startDate);
  //   const today = new Date();
  //   let years = today.getFullYear() - start.getFullYear();
  //   let months = today.getMonth() - start.getMonth();
  //   if (months < 0) {
  //     years--;
  //     months += 12;
  //   }
  //   return `${years} year${years !== 1 ? "s" : ""} ${months} month${
  //     months !== 1 ? "s" : ""
  //   }`;
  // };

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
      />
    </section>
  );
}

export default Experience;
