import React, { useState, useEffect, useRef } from "react";
import styles from "./about.module.css";
import { motion } from "framer-motion";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";

function About() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { auth } = useDataContex();
  const { updateDocument, data, loading } = useFirestore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState("/assets/img/profile.png");
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const loadProfileImage = async () => {
      setIsImageLoading(true);
      try {
        const profileData = data.profile;
        if (profileData?.image) {
          setProfileImage(profileData.image);
        }
      } catch (error) {
        console.error("Error loading profile image:", error);
      } finally {
        setIsImageLoading(false);
      }
    };

    loadProfileImage();
  }, [data.profile]);

  const technicalSkills = {
    "Languages & Frameworks": [
      "JavaScript (ES6+)",
      "TypeScript",
      "PHP",
      "Python",
      "React.js",
      "Node.js",
      "Laravel",
      "CodeIgniter",
    ],
    "Database & Cloud": [
      "MySQL",
      "MongoDB",
      "PostgreSQL",
      "AWS",
      "Docker",
      "Firebase",
    ],
    "Development Tools": [
      "Git",
      "VS Code",
      "Jira",
      "Postman",
      "Linux/Unix",
      "CI/CD",
    ],
    "Specialized Skills": [
      "RESTful APIs",
      "VoIP Solutions",
      "System Architecture",
      "Deep Learning",
      "Agile/Scrum",
      "TDD",
    ],
  };

  const handleImageClick = () => {
    if (auth) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    try {
      setIsUploading(true);

      // Create a FileReader to read the file
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result;
        if (base64String) {
          await updateDocument("portfolio_data", "profile", {
            image: base64String,
          });
          setProfileImage(base64String);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
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
              I'm a Software Engineer at{" "}
              <a
                href="https://brotecs.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Brotecs Technologies Ltd
              </a>
              , where I specialize in developing scalable web applications and
              enterprise-level VoIP solutions. With a strong foundation in both
              frontend and backend development, I focus on creating efficient,
              maintainable, and high-performance software solutions.
            </p>

            <div
              className={`${styles.expandableContent} ${
                !showDetails ? styles.contentCollapsed : ""
              }`}
            >
              <p>
                In my current role, I've successfully implemented microservices
                architecture for VoIP systems, improving scalability and
                reducing deployment time by 40%. I've also led the development
                of RESTful APIs that handle 100K+ daily requests, and
                contributed to reducing system downtime by 60% through
                implementing robust error handling and monitoring solutions.
              </p>

              <p>
                My approach to software development emphasizes clean code
                principles, test-driven development, and continuous integration
                practices. I'm particularly passionate about system
                architecture, performance optimization, and implementing
                DevSecOps best practices.
              </p>

              <div className={styles.skillsSection}>
                <h3>Technical Expertise</h3>
                <div className={styles.skillsGrid}>
                  {Object.entries(technicalSkills).map(([category, skills]) => (
                    <div key={category} className={styles.skillCategory}>
                      <h4>{category}</h4>
                      <ul className={styles.skillsList}>
                        {skills.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.achievements}>
                <h3>Key Achievements</h3>
                <ul className={styles.achievementsList}>
                  <li>
                    Reduced API response time by 35% through implementing
                    caching strategies and query optimization
                  </li>
                  <li>
                    Developed and maintained CI/CD pipelines that decreased
                    deployment time from hours to minutes
                  </li>
                  <li>
                    Implemented automated testing procedures that increased code
                    coverage to 80%
                  </li>
                  <li>
                    Led a team of 3 developers in successfully delivering a
                    mission-critical VoIP project
                  </li>
                </ul>
              </div>
            </div>

            <button
              className={styles.seeMoreButton}
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <>
                  Show Less <i className="fa fa-chevron-up"></i>
                </>
              ) : (
                <>
                  See More <i className="fa fa-chevron-down"></i>
                </>
              )}
            </button>

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
            <div
              className={`${styles.imageWrapper} ${
                auth ? styles.editable : ""
              }`}
              onClick={handleImageClick}
              role={auth ? "button" : "presentation"}
              title={auth ? "Click to change profile picture" : ""}
            >
              {isImageLoading || loading ? (
                <div className={styles.profileSkeleton}></div>
              ) : (
                <img
                  src={profileImage || "/default-profile.png"}
                  alt="Mahbub Alam"
                  className={styles.profileImage}
                />
              )}
              {auth && (
                <div className={styles.imageOverlay}>
                  {isUploading ? (
                    <div className={styles.uploadingSpinner}>
                      <i className="fa fa-spinner fa-spin"></i>
                    </div>
                  ) : (
                    <i className="fa fa-camera"></i>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.hiddenInput}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default About;
