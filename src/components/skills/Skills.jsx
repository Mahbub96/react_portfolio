import React, { useState } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import ThreeDots from "../ThreeDots";
import Skill from "./Skill";
import styles from "./skills.module.css";

function Skills() {
  const [modalShow, setModalShow] = useState(false);
  const { auth } = useDataContex();
  const { Skills } = useFirestore().data;

  return (
    <section id="skills" className={styles.skillsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>
            <span className={styles.sectionNumber}>02.</span>
            What I Do
          </h2>
          <div className={styles.headerLine}></div>
        </div>

        <div className={styles.skillsGrid}>
          {Skills &&
            Skills.data.map(({ name, src }) => (
              <div key={name} className={styles.skillCard}>
                <img src={src} alt={name} className={styles.skillIcon} />
                <h3 className={styles.skillName}>{name}</h3>
              </div>
            ))}

          {auth && (
            <div className={styles.addSkill} onClick={() => setModalShow(true)}>
              <div className={styles.addIcon}>+</div>
              <p>Add New Skill</p>
            </div>
          )}
        </div>
      </div>

      <ModalView
        name="Skills"
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </section>
  );
}

export default Skills;
