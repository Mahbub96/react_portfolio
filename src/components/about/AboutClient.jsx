"use client";
import React, { useState, useEffect, useRef } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import usePortfolioData from "../../hooks/usePortfolioData";
import styles from "./about.module.css";

function AboutClient({ profile }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { auth } = useDataContex();
  const { updateDocument } = usePortfolioData();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState("/assets/img/profile.png");

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

  useEffect(() => {
    if (profile?.image) {
      setProfileImage(profile.image);
    }
  }, [profile]);

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
    <>
      {/* Expandable Technical Skills Section */}
      <div className="container">
        <div className={styles.expandableSection}>
          <div
            className={`${styles.expandableContent} ${
              showDetails ? styles.expanded : styles.collapsed
            }`}
          >
            <div className={styles.skillsSection}>
              <h3>Technical Expertise</h3>
              <div className={styles.skillsGrid}>
                {Object.entries(technicalSkills).map(([category, skills]) => (
                  <div key={category} className={styles.skillCategory}>
                    <h4>{category}</h4>
                    <ul>
                      {skills.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            className={styles.expandButton}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Show Less" : "Show More"}
          </button>
        </div>
      </div>

      {/* Admin image upload functionality */}
      {auth && (
        <>
          <div
            className={`${styles.profileImage} ${
              isUploading ? styles.loading : ""
            }`}
            onClick={handleImageClick}
            style={{ cursor: "pointer" }}
          >
            <img
              src={profileImage}
              alt="Mahbub Alam"
              onError={() => {
                setProfileImage("/assets/img/profile.png");
              }}
            />
            {isUploading && (
              <div className={styles.uploadingOverlay}>
                <span>Uploading...</span>
              </div>
            )}
            <div className={styles.uploadOverlay}>
              <span>Click to upload new image</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </>
      )}
    </>
  );
}

export default AboutClient;
