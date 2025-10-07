"use client";

import React, { useState, useRef, useCallback } from "react";
import { TypeAnimation } from "react-type-animation";
import {
  FaMapMarkerAlt,
  FaCode,
  FaEnvelope,
  FaGithub,
  FaFacebook,
  FaLinkedin,
  FaCamera,
} from "react-icons/fa";
import { useDataContext } from "../../contexts/useAllContext";
import styles from "./banner.module.css";

function Banner({ data }) {
  const bannerData = data?.data || {};
  const { auth, profileImage } = useDataContext();

  // Profile image management state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [seoData, setSeoData] = useState({
    altText: "",
    title: "",
    description: "",
    keywords: "",
    caption: "",
  });

  const fileInputRef = useRef(null);

  // Default values if no data from database
  const roles = bannerData.roles || [
    "Full Stack Developer",
    1500,
    "Mobile App Developer",
    1500,
    "ML Engineer",
    1500,
    "Data Scientist",
    1500,
    "DevSecOps Engineer",
    1500,
  ];

  const name = bannerData.name || "Mahbub Alam";
  const location = bannerData.location || "Dhaka, Bangladesh";
  const bio =
    bannerData.bio ||
    "As a Junior Software Engineer at Brotecs Technologies Ltd., I specialize in the backend development of web applications and cloud-based VoIP calling solutions. I have hands-on experience with PHP frameworks like CodeIgniter and Laravel, and have also worked with modern JavaScript frameworks such as Node.js and React. Additionally, I am familiar with ASTPP and various UI frameworks including Tailwind, MaterialUI, and Bootstrap.\n\nMy background extends into Python, particularly for deep learning applications, and I am continually exploring new technologies in cloud and DevSecOps to expand my skill set. I am committed to ongoing learning, believing it is key to personal and professional growth.";
  const socialLinks = bannerData.socialLinks || {
    email: "support@mahbub.dev",
    github: "https://github.com/mahbub96",
    facebook: "https://fb.me/MahbubCSE96",
    linkedin: "https://www.linkedin.com/in/md-mahbub-alam-6b751821b",
  };

  // Profile image click handler
  const handleProfileImageClick = useCallback(() => {
    if (auth) {
      setShowUploadModal(true);
    }
  }, [auth]);

  // File selection handler
  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Basic validation
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select an image file");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        setUploadError("Image size should be less than 2MB");
        return;
      }

      setSelectedFile(file);
      setUploadError(null);

      // Auto-fill SEO data based on file
      setSeoData({
        altText: `${name} - Full Stack Developer Professional Headshot`,
        title: `${name} - Full Stack Developer Portfolio`,
        description: `Professional headshot of ${name}, a Full Stack Developer based in ${location}`,
        keywords: `${name}, Full Stack Developer, Web Developer, React Developer, Node.js Developer, ${location}`,
        caption: `${name} - Full Stack Developer Professional Headshot`,
      });
    },
    [name, location]
  );

  // Upload handler
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("collectionName", "profile");
      formData.append("documentId", "profile");
      formData.append("seoData", JSON.stringify(seoData));

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const result = await response.json();

      if (result.success && result.image) {
        // Close modal and reset state
        setShowUploadModal(false);
        setSelectedFile(null);
        setSeoData({
          altText: "",
          title: "",
          description: "",
          keywords: "",
          caption: "",
        });
        setUploadError(null);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, seoData]);

  // Cancel upload
  const handleCancel = useCallback(() => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadError(null);
    setSeoData({
      altText: "",
      title: "",
      description: "",
      keywords: "",
      caption: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <section className={styles.banner_section}>
      <div className={styles.tech_background}></div>
      <div className={styles.banner_container}>
        <div className={styles.profile_section}>
          <div
            className={styles.profile_image_container}
            onClick={handleProfileImageClick}
            style={{ cursor: auth ? "pointer" : "default" }}
            title={auth ? "Click to change profile picture" : ""}
          >
            <div
              className={styles.profile_image}
              style={{
                backgroundImage: `url('${
                  profileImage || "/assets/img/profile.png"
                }')`,
              }}
              aria-label={`Profile photo of ${name}`}
            />
            <div className={styles.profile_glow}></div>

            {/* Camera icon overlay for admins */}
            {auth && (
              <div className={styles.camera_overlay}>
                <FaCamera />
              </div>
            )}
          </div>
          <h1 className={styles.name}>
            {name}
            <span className={styles.cursor}>_</span>
          </h1>
        </div>

        <div className={styles.content_section}>
          <div className={styles.type_animation_container}>
            <TypeAnimation
              sequence={roles}
              speed={40}
              repeat={Infinity}
              deletionSpeed={60}
              className={styles.animated_text}
            />
          </div>

          <div className={styles.location_container}>
            <FaMapMarkerAlt />
            <span>{location}</span>
          </div>

          <div className={styles.bio_container}>
            {bio.split("\n").map((line, index) => (
              <p key={index} className={styles.bio_text}>
                {line}
              </p>
            ))}
          </div>

          <button className={styles.cta_button}>
            <FaCode />
            <span>Get in Touch</span>
          </button>
        </div>

        <div className={styles.social_links}>
          <a
            href={`mailto:${socialLinks.email}`}
            target="_blank"
            title="Email me"
            rel="noopener noreferrer"
            className={styles.social_link}
          >
            <FaEnvelope />
          </a>
          <a
            href={socialLinks.github}
            target="_blank"
            title="GitHub Profile"
            rel="noopener noreferrer"
            className={styles.social_link}
          >
            <FaGithub />
          </a>
          <a
            href={socialLinks.facebook}
            target="_blank"
            title="Facebook Profile"
            rel="noopener noreferrer"
            className={styles.social_link}
          >
            <FaFacebook />
          </a>
          <a
            href={socialLinks.linkedin}
            target="_blank"
            title="LinkedIn Profile"
            rel="noopener noreferrer"
            className={styles.social_link}
          >
            <FaLinkedin />
          </a>
        </div>
      </div>

      {/* Profile Image Upload Modal */}
      {showUploadModal && (
        <div className={styles.modal_overlay} onClick={handleCancel}>
          <div
            className={styles.modal_content}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modal_header}>
              <h3>Update Profile Picture</h3>
              <button
                className={styles.close_button}
                onClick={handleCancel}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className={styles.modal_body}>
              {/* File Selection */}
              <div className={styles.file_section}>
                <label className={styles.file_label}>
                  <span className={styles.file_button}>Choose Image</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                </label>
                {selectedFile && (
                  <div className={styles.file_info}>
                    <span>Selected: {selectedFile.name}</span>
                    <span>
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>

              {/* SEO Metadata Fields */}
              {selectedFile && (
                <div className={styles.seo_section}>
                  <h4>SEO & Image Metadata</h4>

                  <div className={styles.seo_field}>
                    <label htmlFor="altText">Alt Text *</label>
                    <input
                      id="altText"
                      type="text"
                      value={seoData.altText}
                      onChange={(e) =>
                        setSeoData((prev) => ({
                          ...prev,
                          altText: e.target.value,
                        }))
                      }
                      placeholder="Descriptive alt text for accessibility and SEO"
                      required
                    />
                  </div>

                  <div className={styles.seo_field}>
                    <label htmlFor="title">Image Title</label>
                    <input
                      id="title"
                      type="text"
                      value={seoData.title}
                      onChange={(e) =>
                        setSeoData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Title for the image"
                    />
                  </div>

                  <div className={styles.seo_field}>
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={seoData.description}
                      onChange={(e) =>
                        setSeoData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Detailed description of the image"
                      rows="3"
                    />
                  </div>

                  <div className={styles.seo_field}>
                    <label htmlFor="keywords">Keywords</label>
                    <input
                      id="keywords"
                      type="text"
                      value={seoData.keywords}
                      onChange={(e) =>
                        setSeoData((prev) => ({
                          ...prev,
                          keywords: e.target.value,
                        }))
                      }
                      placeholder="Comma-separated keywords for SEO"
                    />
                  </div>

                  <div className={styles.seo_field}>
                    <label htmlFor="caption">Caption</label>
                    <input
                      id="caption"
                      type="text"
                      value={seoData.caption}
                      onChange={(e) =>
                        setSeoData((prev) => ({
                          ...prev,
                          caption: e.target.value,
                        }))
                      }
                      placeholder="Caption text for the image"
                    />
                  </div>
                </div>
              )}

              {/* Error Display */}
              {uploadError && (
                <div className={styles.error_message}>{uploadError}</div>
              )}
            </div>

            {/* Modal Footer with Action Buttons */}
            <div className={styles.modal_footer}>
              <button
                className={styles.cancel_button_modal}
                onClick={handleCancel}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                className={styles.upload_button}
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload & Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Banner;
