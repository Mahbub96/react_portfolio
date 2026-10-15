"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { LuCheck, LuImage, LuLoaderCircle, LuUpload, LuX } from "react-icons/lu";
import { SKILL_CATEGORIES } from "@/lib/portfolio/schemas";
import styles from "./portfolioDashboard.module.css";

export default function PortfolioItemModal({
  isOpen,
  onClose,
  onSave,
  collectionName,
  initialData = null,
}) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        lang: Array.isArray(initialData.lang)
          ? initialData.lang.join(", ")
          : initialData.lang || "",
      });
    } else {
      // Defaults based on collection
      setFormData({
        published: true,
        category: collectionName === "Skills" ? "Languages" : undefined,
        icon: collectionName === "CoreStrengths" ? "server" : undefined,
        src: collectionName === "Projects" ? "/assets/img/projects.png" : undefined,
      });
    }
    setError("");
    setIsSubmitting(false);
  }, [initialData, collectionName, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      const data = new FormData();
      data.append("image", file);
      data.append("collectionName", collectionName);
      data.append("documentId", initialData?.id || "temp");

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: data,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to upload image");
      }

      setFormData((prev) => ({
        ...prev,
        src: resData.image || resData.url || prev.src,
      }));
    } catch (err) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = { ...formData };

      // Normalize technologies array for projects
      if (collectionName === "Projects" && typeof payload.lang === "string") {
        payload.lang = payload.lang
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save record");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={styles.modalBackdrop}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modalCard} role="dialog" aria-modal="true">
        <header className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              {isEditing ? `Edit ${collectionName.slice(0, -1)}` : `Add to ${collectionName}`}
            </h2>
            <p className={styles.modalSubtitle}>Fill in the fields below. Changes persist to MongoDB.</p>
          </div>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <LuX />
          </button>
        </header>

        {error && (
          <div className={styles.alertError} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {/* PROJECTS FORM */}
          {collectionName === "Projects" && (
            <>
              <label className={styles.field}>
                <span className={styles.label}>Project Name *</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="e.g. LinkLens — Enterprise Link Intelligence"
                  className={styles.input}
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Description *</span>
                <textarea
                  name="desc"
                  value={formData.desc || ""}
                  onChange={handleChange}
                  placeholder="Describe the architecture, problems solved, and highlights..."
                  className={styles.textarea}
                  rows={4}
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Technologies (comma-separated)</span>
                <input
                  type="text"
                  name="lang"
                  value={formData.lang || ""}
                  onChange={handleChange}
                  placeholder="Next.js, TypeScript, PostgreSQL, Redis, Docker"
                  className={styles.input}
                />
              </label>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>GitHub URL</span>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl || ""}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                    className={styles.input}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Live Demo URL</span>
                  <input
                    type="url"
                    name="liveUrl"
                    value={formData.liveUrl || ""}
                    onChange={handleChange}
                    placeholder="https://..."
                    className={styles.input}
                  />
                </label>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Slug Override (optional)</span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug || ""}
                    onChange={handleChange}
                    placeholder="leave blank to auto-generate"
                    className={styles.input}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Download URL</span>
                  <input
                    type="url"
                    name="downloadUrl"
                    value={formData.downloadUrl || ""}
                    onChange={handleChange}
                    placeholder="https://..."
                    className={styles.input}
                  />
                </label>
              </div>

              <div className={styles.imageUploadSection}>
                <span className={styles.label}>Project Preview Image</span>
                <div className={styles.imageUploadRow}>
                  {formData.src ? (
                    <div className={styles.imagePreviewThumb}>
                      <Image
                        src={formData.src}
                        alt="Preview"
                        width={120}
                        height={68}
                        className={styles.previewImg}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <LuImage />
                    </div>
                  )}
                  <label className={styles.uploadBtn}>
                    {uploadingImage ? (
                      <LuLoaderCircle className={styles.spin} />
                    ) : (
                      <LuUpload />
                    )}
                    <span>{uploadingImage ? "Uploading..." : "Upload New Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      hidden
                    />
                  </label>
                  <input
                    type="text"
                    name="src"
                    value={formData.src || ""}
                    onChange={handleChange}
                    placeholder="or paste image URL"
                    className={styles.input}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </>
          )}

          {/* SKILLS FORM */}
          {collectionName === "Skills" && (
            <>
              <label className={styles.field}>
                <span className={styles.label}>Skill Name *</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="e.g. Next.js, Python, PostgreSQL"
                  className={styles.input}
                  required
                />
              </label>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Category *</span>
                  <select
                    name="category"
                    value={formData.category || "Languages"}
                    onChange={handleChange}
                    className={styles.select}
                    required
                  >
                    {SKILL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Icon Identifier</span>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon || ""}
                    onChange={handleChange}
                    placeholder="e.g. SiJavascript, SiReact"
                    className={styles.input}
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Color (Hex or CSS token)</span>
                <input
                  type="text"
                  name="color"
                  value={formData.color || ""}
                  onChange={handleChange}
                  placeholder="e.g. var(--accent-primary)"
                  className={styles.input}
                />
              </label>
            </>
          )}

          {/* CORE STRENGTHS FORM */}
          {collectionName === "CoreStrengths" && (
            <>
              <label className={styles.field}>
                <span className={styles.label}>Card Title *</span>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  placeholder="e.g. Backend & APIs"
                  className={styles.input}
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Description *</span>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Description of core focus area..."
                  className={styles.textarea}
                  rows={3}
                  required
                />
              </label>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Technologies Summary *</span>
                  <input
                    type="text"
                    name="tech"
                    value={formData.tech || ""}
                    onChange={handleChange}
                    placeholder="Node.js · NestJS · Express"
                    className={styles.input}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Icon (server, window, brain, code)</span>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon || "code"}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </label>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Accent Color</span>
                  <input
                    type="text"
                    name="accentColor"
                    value={formData.accentColor || ""}
                    onChange={handleChange}
                    placeholder="e.g. var(--accent-primary)"
                    className={styles.input}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Glow Background</span>
                  <input
                    type="text"
                    name="glowBg"
                    value={formData.glowBg || ""}
                    onChange={handleChange}
                    placeholder="e.g. var(--accent-softer)"
                    className={styles.input}
                  />
                </label>
              </div>
            </>
          )}

          {/* EXPERIENCES FORM */}
          {collectionName === "Experiences" && (
            <>
              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Job Title / Role *</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    placeholder="e.g. Junior Software Engineer II"
                    className={styles.input}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Company Name *</span>
                  <input
                    type="text"
                    name="company"
                    value={formData.company || ""}
                    onChange={handleChange}
                    placeholder="Brotecs Technologies Ltd."
                    className={styles.input}
                    required
                  />
                </label>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Company Website URL</span>
                  <input
                    type="url"
                    name="companyUrl"
                    value={formData.companyUrl || ""}
                    onChange={handleChange}
                    placeholder="https://brotecs.com"
                    className={styles.input}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Display Period *</span>
                  <input
                    type="text"
                    name="time"
                    value={formData.time || ""}
                    onChange={handleChange}
                    placeholder="e.g. March 2024 - Present"
                    className={styles.input}
                    required
                  />
                </label>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Start Date (YYYY-MM)</span>
                  <input
                    type="text"
                    name="startDate"
                    value={formData.startDate || ""}
                    onChange={handleChange}
                    placeholder="2024-03"
                    className={styles.input}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>End Date (YYYY-MM or Present)</span>
                  <input
                    type="text"
                    name="endDate"
                    value={formData.endDate || ""}
                    onChange={handleChange}
                    placeholder="Present"
                    className={styles.input}
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Responsibilities & Impact *</span>
                <textarea
                  name="how"
                  value={formData.how || ""}
                  onChange={handleChange}
                  placeholder="Detail systems built, APIs implemented, team collaboration..."
                  className={styles.textarea}
                  rows={4}
                  required
                />
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="current"
                  checked={Boolean(formData.current)}
                  onChange={handleChange}
                />
                <span>Current Position</span>
              </label>
            </>
          )}

          {/* EDUCATIONS FORM */}
          {collectionName === "Educations" && (
            <>
              <label className={styles.field}>
                <span className={styles.label}>Institution Name *</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="e.g. Stamford University Bangladesh"
                  className={styles.input}
                  required
                />
              </label>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Degree *</span>
                  <input
                    type="text"
                    name="degName"
                    value={formData.degName || ""}
                    onChange={handleChange}
                    placeholder="e.g. Bachelor of Science"
                    className={styles.input}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Department / Major</span>
                  <input
                    type="text"
                    name="Department"
                    value={formData.Department || ""}
                    onChange={handleChange}
                    placeholder="Computer Science and Engineering"
                    className={styles.input}
                  />
                </label>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Period (Years) *</span>
                  <input
                    type="text"
                    name="time"
                    value={formData.time || ""}
                    onChange={handleChange}
                    placeholder="2019 - 2022"
                    className={styles.input}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>CGPA / Grade</span>
                  <input
                    type="text"
                    name="cgpa"
                    value={formData.cgpa || ""}
                    onChange={handleChange}
                    placeholder="3.70 out of 4.00"
                    className={styles.input}
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Thesis / Final Project (optional)</span>
                <input
                  type="text"
                  name="Thesis"
                  value={formData.Thesis || ""}
                  onChange={handleChange}
                  placeholder="Speech Emotion Recognition Using Deep Learning"
                  className={styles.input}
                />
              </label>
            </>
          )}

          {/* CERTIFICATIONS FORM */}
          {collectionName === "Certifications" && (
            <>
              <label className={styles.field}>
                <span className={styles.label}>Certification Title *</span>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  placeholder="e.g. React (Basic) Certification"
                  className={styles.input}
                  required
                />
              </label>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Issuer / Platform *</span>
                  <input
                    type="text"
                    name="issuer"
                    value={formData.issuer || ""}
                    onChange={handleChange}
                    placeholder="HackerRank, Coursera, AWS"
                    className={styles.input}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Certificate URL</span>
                  <input
                    type="url"
                    name="url"
                    value={formData.url || ""}
                    onChange={handleChange}
                    placeholder="https://..."
                    className={styles.input}
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Description / Details</span>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Skills demonstrated or certificate description..."
                  className={styles.textarea}
                  rows={3}
                />
              </label>
            </>
          )}

          {/* ACHIEVEMENTS FORM */}
          {collectionName === "Achievements" && (
            <>
              <label className={styles.field}>
                <span className={styles.label}>Achievement Title *</span>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  placeholder="e.g. University Technical Program Coordinator"
                  className={styles.input}
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Organization / Context</span>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization || ""}
                  onChange={handleChange}
                  placeholder="e.g. Stamford Computer Society"
                  className={styles.input}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Description *</span>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Details of leadership, awards, or achievements..."
                  className={styles.textarea}
                  rows={3}
                  required
                />
              </label>
            </>
          )}

          {/* Common Visibility Setting */}
          <div className={styles.visibilityToggleBox}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="published"
                checked={formData.published !== false}
                onChange={handleChange}
              />
              <span className={styles.checkboxText}>
                <strong>Visible to Public:</strong> When unchecked, this item is hidden from the public portfolio, search engines, and generated resumes.
              </span>
            </label>
          </div>

          <footer className={styles.modalFooter}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LuLoaderCircle className={styles.spin} />
              ) : (
                <LuCheck />
              )}
              <span>{isEditing ? "Save Changes" : "Create Item"}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
