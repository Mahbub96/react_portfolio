import React, { useState } from "react";
import { motion } from "framer-motion";
import styles from "./skills.module.css";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import ThreeDots from "../ThreeDots";
import Skill from "./Skill";

function Skills() {
  const [modalShow, setModalShow] = useState(false);
  const { auth } = useDataContex();
  const { Skills } = useFirestore().data;
  const [selectedSkill, setSelectedSkill] = useState(null);
  const { deleteDocument } = useFirestore();

  const handleEdit = (skill) => {
    setSelectedSkill(skill);
    setModalShow(true);
  };

  const handleDelete = async (skill) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      try {
        await deleteDocument("Skills", skill.id);
      } catch (error) {
        console.error("Error deleting skill:", error);
      }
    }
  };

  return (
    <section id="skills" className={styles.skillsSection}>
      <div className="container">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>
            <span className={styles.sectionNumber}>02.</span> Skills &
            Technologies
          </h2>
          <div className={styles.headerLine}></div>
        </motion.div>

        <div className={styles.skillsGrid}>
          {Skills ? (
            Skills.data.map((skill, index) => (
              <motion.div
                key={skill.id}
                className={styles.skillCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {auth && (
                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.actionButton} ${styles.editButton}`}
                      onClick={() => handleEdit(skill)}
                      title="Edit Skill"
                    >
                      <i className="fa fa-edit"></i>
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDelete(skill)}
                      title="Delete Skill"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                )}
                <div className={styles.skillIcon}>
                  <img src={skill.src} alt={skill.name} />
                </div>
                <h3>{skill.name}</h3>
              </motion.div>
            ))
          ) : (
            <div className={styles.loading}>
              <ThreeDots />
            </div>
          )}

          {auth && (
            <motion.div
              className={`${styles.skillCard} ${styles.addCard}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              onClick={() => {
                setSelectedSkill(null);
                setModalShow(true);
              }}
            >
              <div className={styles.addContent}>
                <i className="fa fa-plus"></i>
                <p>Add New Skill</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <ModalView
        name="Skills"
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          setSelectedSkill(null);
        }}
        initialData={selectedSkill}
        title={selectedSkill ? "Edit Skill" : "Add Skill"}
      />
    </section>
  );
}

export default Skills;
