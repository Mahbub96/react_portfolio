import React from "react";
import styles from "./projects.module.css";

function Project({ imgSrc, title, desc, altTxt, lang, to }) {
  // Convert lang to string and handle cases where it might be undefined/null
  const technologies = typeof lang === "string" ? lang.split(",") : [];

  return (
    <div className={styles.projectCard}>
      <div className={styles.projectImage}>
        <img src={imgSrc} alt={altTxt} />
      </div>
      <div className={styles.projectContent}>
        <h3 className={styles.projectTitle}>{title}</h3>
        <p className={styles.projectDesc}>{desc}</p>
        <div className={styles.projectTech}>
          {technologies.map((tech, index) => (
            <span key={index} className={styles.techTag}>
              {tech.trim()}
            </span>
          ))}
        </div>
        <a
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.projectLink}
        >
          View Project
          <i className="fa fa-external-link"></i>
        </a>
      </div>
    </div>
  );
}

export default Project;
