import React, { useState, useEffect } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import ThreeDots from "../ThreeDots";
import Project from "./Project";
import styles from "./projects.module.css";

function Projects() {
  const [modalShow, setModalShow] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const { auth } = useDataContex();
  const { projectsData, Skills } = useFirestore().data;

  useEffect(() => {
    setFilteredItems(projectsData?.data);
  }, [projectsData]);

  const filterProjectsData = (name) => {
    setActiveFilter(name);
    if (name === "All") {
      setFilteredItems(projectsData?.data);
    } else {
      setFilteredItems(
        projectsData?.data.filter((item) => item.lang.includes(name))
      );
    }
  };

  return (
    <section id="projects" className={styles.projectsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>
            <span className={styles.sectionNumber}>05.</span>
            Some Things I've Built
          </h2>
          <div className={styles.headerLine}></div>
        </div>

        <div className={styles.filterContainer}>
          <button
            className={`${styles.filterButton} ${
              activeFilter === "All" ? styles.active : ""
            }`}
            onClick={() => filterProjectsData("All")}
          >
            All
          </button>
          {Skills &&
            Skills.data.map(({ id, name }) => (
              <button
                key={id}
                className={`${styles.filterButton} ${
                  activeFilter === name ? styles.active : ""
                }`}
                onClick={() => filterProjectsData(name)}
              >
                {name}
              </button>
            ))}
        </div>

        <div className={styles.projectsGrid}>
          {filteredItems ? (
            Object.entries(filteredItems).map(
              ([, { id, name, src, desc, lang, to }]) => (
                <Project
                  key={id}
                  title={name}
                  imgSrc={src}
                  altTxt={name}
                  desc={desc}
                  lang={lang}
                  to={to}
                />
              )
            )
          ) : (
            <div className={styles.loading}>
              <ThreeDots />
            </div>
          )}

          {projectsData && auth && (
            <div
              className={styles.addProject}
              onClick={() => setModalShow(true)}
            >
              <div className={styles.addIcon}>+</div>
              <p>Add New Project</p>
            </div>
          )}
        </div>
      </div>

      <ModalView
        name="projectsData"
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </section>
  );
}

export default Projects;
