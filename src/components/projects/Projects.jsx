import React, { useState, useEffect } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import ThreeDots from "../ThreeDots";
import Project from "./Project";
import styles from "./projects.module.css";
import { motion } from "framer-motion";

function Projects() {
  const [modalShow, setModalShow] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const { auth } = useDataContex();
  const { projectsData, Skills } = useFirestore().data;
  const [selectedProject, setSelectedProject] = useState(null);
  const { deleteDocument } = useFirestore();

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

  const handleEdit = (project) => {
    setSelectedProject(project);
    setModalShow(true);
  };

  const handleDelete = async (project) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDocument("Projects", project.id);
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  return (
    <section id="projects" className={styles.projectsSection}>
      <div className="container">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>
            <span className={styles.sectionNumber}>05.</span> Some Things I've
            Built
          </h2>
          <div className={styles.headerLine}></div>
        </motion.div>

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
                <motion.div
                  key={id}
                  className={styles.projectCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  {auth && (
                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.actionButton} ${styles.editButton}`}
                        onClick={() =>
                          handleEdit({ id, name, src, desc, lang, to })
                        }
                        title="Edit Project"
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={() =>
                          handleDelete({ id, name, src, desc, lang, to })
                        }
                        title="Delete Project"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  )}
                  <div className={styles.projectImage}>
                    <img src={src} alt={name} />
                  </div>
                  <div className={styles.projectContent}>
                    <h3>{name}</h3>
                    <p>{desc}</p>
                    <div className={styles.techStack}>
                      {lang.map((tech, i) => (
                        <span key={i} className={styles.techTag}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            )
          ) : (
            <div className={styles.loading}>
              <ThreeDots />
            </div>
          )}

          {projectsData && auth && (
            <motion.div
              className={`${styles.projectCard} ${styles.addCard}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              onClick={() => {
                setSelectedProject(null);
                setModalShow(true);
              }}
            >
              <div className={styles.addContent}>
                <i className="fa fa-plus"></i>
                <p>Add New Project</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <ModalView
        name="projectsData"
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          setSelectedProject(null);
        }}
        initialData={selectedProject}
        title={selectedProject ? "Edit Project" : "Add Project"}
      />
    </section>
  );
}

export default Projects;
