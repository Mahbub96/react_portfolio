import React, { useState, useEffect } from "react";
import styles from "./about.module.css";
import { motion } from "framer-motion";

function About() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const skills = {
    "Backend Development": [
      "PHP",
      "Laravel",
      "CodeIgniter",
      "Node.js",
      "Python",
    ],
    "Frontend Development": [
      "React.js",
      "JavaScript (ES6+)",
      "Tailwind CSS",
      "Material-UI",
      "Bootstrap",
    ],
    "Cloud & DevOps": ["AWS", "Docker", "Git", "CI/CD", "Linux"],
    "Other Technologies": [
      "ASTPP",
      "VoIP Solutions",
      "RESTful APIs",
      "Deep Learning",
    ],
  };

  return (
    <section id="about" className={styles.aboutSection}>
      <div className="container">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>
            <span className={styles.sectionNumber}>01.</span>
            About Me
          </h2>
          <div className={styles.headerLine}></div>
        </motion.div>

        <div className={styles.aboutContent}>
          <motion.div
            className={`${styles.aboutText} ${
              !isExpanded && isMobile ? styles.collapsed : ""
            }`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={styles.location}>
              <span>📍</span> Dhaka, Bangladesh
            </div>

            <p>
              As a Junior Software Engineer at{" "}
              <a
                href="https://brotecs.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Brotecs Technologies Ltd
              </a>
              , I specialize in backend development of web applications and
              cloud-based VoIP solutions. My expertise lies in crafting robust
              and scalable applications using modern technologies and best
              practices.
            </p>

            <div className={styles.expandableContent}>
              <p>
                My technical journey encompasses working with PHP frameworks
                like Laravel and CodeIgniter, while also diving deep into modern
                JavaScript ecosystems including Node.js and React. I'm
                particularly passionate about creating efficient backend
                architectures and implementing clean, maintainable code.
              </p>

              <p>
                Beyond web development, I've ventured into Python-based deep
                learning applications and am actively exploring cloud
                technologies and DevSecOps practices. I believe in continuous
                learning and staying ahead of technological advancements.
              </p>

              <div className={styles.skillsSection}>
                <h3>Technical Expertise</h3>
                <div className={styles.skillsGrid}>
                  {Object.entries(skills).map(([category, categorySkills]) => (
                    <div key={category} className={styles.skillCategory}>
                      <h4>{category}</h4>
                      <ul className={styles.skillsList}>
                        {categorySkills.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isMobile && (
              <button
                className={styles.expandButton}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show Less" : "Read More"}
              </button>
            )}
          </motion.div>

          <motion.div
            className={styles.aboutImage}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className={styles.imageWrapper}>
              <img src="/assets/img/profile.png" alt="Mahbub Alam" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default About;
