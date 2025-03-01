import { useState } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import ThreeDots from "../ThreeDots";
import styles from "./experience.module.css";

function Experience() {
  const [modalShow, setModalShow] = useState(false);
  const { auth } = useDataContex();
  const { Experiences } = useFirestore().data;

  const calculateExperience = (startDate) => {
    const start = new Date(startDate);
    const today = new Date();
    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} year${years !== 1 ? "s" : ""} ${months} month${
      months !== 1 ? "s" : ""
    }`;
  };

  return (
    <section id="experience" className={styles.experienceSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>
            <span className={styles.sectionNumber}>03.</span>
            Where I've Worked
          </h2>
          <div className={styles.headerLine}></div>
        </div>

        <div className={styles.totalExperience}>
          {calculateExperience("2023-09-15")}
        </div>

        <div className={styles.timelineContainer}>
          {Experiences ? (
            Object.entries(Experiences.data).map(
              ([key, { name, time, how }]) => (
                <div
                  key={key}
                  className={`${styles.timelineItem} ${
                    parseInt(key) % 2 === 0 ? styles.right : styles.left
                  }`}
                >
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineDot}></div>
                    <span className={styles.date}>{time}</span>
                    <h3 className={styles.title}>{name}</h3>
                    <p className={styles.description}>{how}</p>
                  </div>
                </div>
              )
            )
          ) : (
            <div className={styles.loading}>
              <ThreeDots />
            </div>
          )}

          {Experiences && auth && (
            <div
              className={styles.addExperience}
              onClick={() => setModalShow(true)}
            >
              <div className={styles.addIcon}>+</div>
              <p>Add New Experience</p>
            </div>
          )}
        </div>
      </div>

      <ModalView
        name="Experiences"
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </section>
  );
}

export default Experience;
