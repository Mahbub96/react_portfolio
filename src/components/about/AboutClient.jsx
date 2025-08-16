"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import usePortfolioData from "../../hooks/usePortfolioData";
import styles from "./about.module.css";

// Memoized default technical skills
const DEFAULT_TECHNICAL_SKILLS = {
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
  "Database & Cloud": ["MySQL", "MongoDB", "PostgreSQL", "AWS", "Docker"],
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

// File validation constants
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Memoized AboutClient component for performance optimization
const AboutClient = memo(function AboutClient({ profile, technicalSkills }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const { auth } = useDataContex();
  const { updateDocument } = usePortfolioData();
  const fileInputRef = useRef(null);

  // Memoized profile image state
  const [profileImage, setProfileImage] = useState("/assets/img/profile.png");

  // Extract name from profile data
  const name = profile?.name || "Mahbub Alam";

  // Use provided technical skills or fallback to defaults
  const skillsToDisplay = technicalSkills || DEFAULT_TECHNICAL_SKILLS;

  // Memoized file validation
  const validateFile = useCallback((file) => {
    if (!file) {
      throw new Error("No file selected");
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error("Please select a valid image file (JPG, PNG, GIF, WebP)");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Image size should be less than 2MB");
    }

    return true;
  }, []);

  // Memoized image upload handler
  const handleImageChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setUploadError(null);
        validateFile(file);
        setIsUploading(true);

        // Create a FileReader to read the file
        const reader = new FileReader();

        reader.onload = async (event) => {
          try {
            const base64String = event.target?.result;
            if (base64String) {
              await updateDocument("portfolio_data", "profile", {
                image: base64String,
              });
              setProfileImage(base64String);
            }
          } catch (error) {
            console.error("Error updating document:", error);
            setUploadError("Failed to update profile. Please try again.");
          }
        };

        reader.onerror = () => {
          setUploadError("Failed to read file. Please try again.");
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error("File validation error:", error);
        setUploadError(error.message);
      } finally {
        setIsUploading(false);
      }
    },
    [updateDocument, validateFile]
  );

  // Memoized image click handler
  const handleImageClick = useCallback(() => {
    if (auth && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [auth, isUploading]);

  // Memoized keyboard handlers
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setShowDetails(!showDetails);
      }
    },
    [showDetails]
  );

  const handleImageKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleImageClick();
      }
    },
    [handleImageClick]
  );

  // Memoized image error handler
  const handleImageError = useCallback(() => {
    setProfileImage("/assets/img/profile.png");
  }, []);

  // Update profile image when profile prop changes
  useEffect(() => {
    if (profile?.image) {
      setProfileImage(profile.image);
    }
  }, [profile]);

  // Clear file input after upload
  useEffect(() => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [isUploading]);

  return (
    <>
      {/* Expandable Technical Skills Section */}
      <div className="container">
        <section
          className={styles.expandableSection}
          aria-labelledby="skills-heading"
        >
          <div
            className={`${styles.expandableContent} ${
              showDetails ? styles.expanded : styles.collapsed
            }`}
            aria-hidden={!showDetails}
            aria-expanded={showDetails}
            id="skills-content"
          >
            <div className={styles.skillsSection}>
              <h3 id="skills-heading">Technical Expertise</h3>
              <div
                className={styles.skillsGrid}
                role="list"
                aria-label="Technical skills organized by category"
              >
                {Object.entries(skillsToDisplay).map(
                  ([category, skills], index) => (
                    <div
                      key={category}
                      className={styles.skillCategory}
                      role="listitem"
                      aria-label={`${category} skills`}
                      style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                    >
                      <h4>{category}</h4>
                      <ul role="list" aria-label={`${category} skills list`}>
                        {skills.map((skill) => (
                          <li key={skill} role="listitem">
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <button
            className={styles.expandButton}
            onClick={() => setShowDetails(!showDetails)}
            onKeyDown={handleKeyPress}
            aria-expanded={showDetails}
            aria-controls="skills-content"
            aria-label={
              showDetails ? "Hide technical skills" : "Show technical skills"
            }
            type="button"
          >
            <span className={styles.buttonText}>
              {showDetails ? "Show Less" : "Show More"}
            </span>
            <span className={styles.buttonIcon} aria-hidden="true">
              {showDetails ? "−" : "+"}
            </span>
          </button>
        </section>
      </div>

      {/* Admin image upload functionality */}
      {auth && (
        <div className="container">
          <div className={styles.adminSection}>
            <h4 className={styles.adminTitle}>Profile Image Management</h4>

            {/* Error message display */}
            {uploadError && (
              <div className={styles.errorMessage} role="alert">
                <span className={styles.errorIcon} aria-hidden="true">
                  ⚠️
                </span>
                {uploadError}
              </div>
            )}

            <div
              className={`${styles.profileImage} ${styles.adminImage} ${
                isUploading ? styles.loading : ""
              }`}
              onClick={handleImageClick}
              onKeyDown={handleImageKeyDown}
              role="button"
              tabIndex={0}
              aria-label="Click to upload new profile image"
              aria-disabled={isUploading}
              style={{ cursor: isUploading ? "not-allowed" : "pointer" }}
            >
              <img
                src={profileImage}
                alt={`${name} - Current profile image`}
                onError={handleImageError}
                className={styles.adminProfileImg}
              />

              {isUploading && (
                <div className={styles.uploadingOverlay} aria-live="polite">
                  <span className={styles.uploadingText}>Uploading...</span>
                  <div
                    className={styles.uploadingSpinner}
                    aria-hidden="true"
                  ></div>
                </div>
              )}

              {!isUploading && (
                <div className={styles.uploadOverlay}>
                  <span className={styles.uploadText}>
                    Click to upload new image
                  </span>
                  <span className={styles.uploadHint}>
                    Supports: JPG, PNG, GIF, WebP (Max: 2MB)
                  </span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              aria-label="File input for profile image upload"
              disabled={isUploading}
            />

            <p className={styles.uploadInstructions}>
              Click on the image above to upload a new profile picture.
              Supported formats: JPG, PNG, GIF, WebP. Maximum file size: 2MB.
            </p>
          </div>
        </div>
      )}
    </>
  );
});

// Add display name for debugging
AboutClient.displayName = "AboutClient";

export default AboutClient;
