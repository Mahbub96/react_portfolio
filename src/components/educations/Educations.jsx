import React, { useState } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import ThreeDots from "../ThreeDots";
import styles from "./education.module.css";

function Educations() {
  const [modalShow, setModalShow] = useState(false);
  const { auth } = useDataContex();
  const { Education } = useFirestore().data;

  return (
    <section id="education" className={styles.educationSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>
            <span className={styles.sectionNumber}>04.</span>
            Education & Learning
          </h2>
          <div className={styles.headerLine}></div>
        </div>

        <div className={styles.educationGrid}>
          {Education ? (
            Object.entries(Education.data).map(
              ([
                key,
                { name, time, degName, Department, cgpa, group, Thesis },
              ]) => (
                <div key={key} className={styles.educationCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.date}>{time}</span>
                    <h3 className={styles.institution}>{name}</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <h4 className={styles.degree}>{degName}</h4>
                    <div className={styles.details}>
                      <div className={styles.detail}>
                        <span className={styles.label}>CGPA:</span>
                        <span className={styles.value}>{cgpa}</span>
                      </div>
                      <div className={styles.detail}>
                        <span className={styles.label}>Department:</span>
                        <span className={styles.value}>{Department}</span>
                      </div>
                      <div className={styles.detail}>
                        <span className={styles.label}>Group:</span>
                        <span className={styles.value}>{group}</span>
                      </div>
                      <div className={styles.detail}>
                        <span className={styles.label}>Thesis:</span>
                        <span className={styles.value}>{Thesis}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )
          ) : (
            <div className={styles.loading}>
              <ThreeDots />
            </div>
          )}

          {Education && auth && (
            <div
              className={styles.addEducation}
              onClick={() => setModalShow(true)}
            >
              <div className={styles.addIcon}>+</div>
              <p>Add New Education</p>
            </div>
          )}
        </div>
      </div>

      <ModalView
        name="Education"
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </section>
  );
}

export default Educations;
