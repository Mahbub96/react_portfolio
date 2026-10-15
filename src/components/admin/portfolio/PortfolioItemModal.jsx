"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  LuCheck,
  LuExternalLink,
  LuImage,
  LuLoaderCircle,
  LuPlus,
  LuRotateCcw,
  LuTrash2,
  LuUpload,
  LuX,
} from "react-icons/lu";
import { SKILL_CATEGORIES } from "@/lib/portfolio/schemas";
import { SKILL_ICON_PRESETS } from "@/lib/portfolio/skillPresets";
import styles from "./portfolioDashboard.module.css";

// Technology presets for quick one-click addition to projects
const TECH_PRESETS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "MongoDB",
  "PostgreSQL",
  "TailwindCSS",
  "Docker",
  "Redis",
  "AWS",
];

/**
 * Returns a clean, completely empty form data object for any collection.
 * Ensures every input is controlled (no undefined values) and Add opens fresh.
 */
export function getEmptyFormData(collectionName) {
  const base = {
    published: true,
  };

  switch (collectionName) {
    case "Projects":
      return {
        ...base,
        name: "",
        desc: "",
        lang: "",
        src: "/assets/img/projects.png",
        githubUrl: "",
        liveUrl: "",
        downloadUrl: "",
        slug: "",
      };
    case "Skills":
      return {
        ...base,
        name: "",
        category: "Languages",
        icon: "SiJavascript",
        color: "var(--accent-primary)",
        src: "",
      };
    case "CoreStrengths":
      return {
        ...base,
        title: "",
        description: "",
        tech: "",
        icon: "server",
        accentColor: "var(--accent-primary)",
        glowBg: "var(--accent-softer)",
      };
    case "Experiences":
      return {
        ...base,
        name: "",
        company: "",
        companyUrl: "",
        time: "",
        startDate: "",
        endDate: "",
        current: false,
        how: "",
      };
    case "Educations":
      return {
        ...base,
        name: "",
        degName: "",
        Department: "",
        time: "",
        cgpa: "",
        group: "",
        Thesis: "",
      };
    case "Certifications":
      return {
        ...base,
        title: "",
        issuer: "",
        url: "",
        issueDate: "",
        description: "",
      };
    case "Achievements":
      return {
        ...base,
        title: "",
        organization: "",
        date: "",
        description: "",
      };
    default:
      return { ...base };
  }
}

/**
 * Pre-populates existing data for editing while guaranteeing all field keys exist.
 */
export function getPopulatedFormData(collectionName, initialData) {
  const empty = getEmptyFormData(collectionName);
  const populated = { ...empty, ...initialData };

  if (collectionName === "Projects") {
    populated.lang = Array.isArray(initialData?.lang)
      ? initialData.lang.join(", ")
      : initialData?.lang || "";
  }

  if (collectionName === "Experiences") {
    populated.current =
      Boolean(initialData?.current) ||
      initialData?.endDate?.toLowerCase() === "present" ||
      initialData?.time?.toLowerCase()?.includes("present");
  }

  return populated;
}

export default function PortfolioItemModal({
  isOpen,
  onClose,
  onSave,
  collectionName,
  initialData = null,
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState(() =>
    isEditing
      ? getPopulatedFormData(collectionName, initialData)
      : getEmptyFormData(collectionName)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  // Sync state cleanly whenever initialData, collectionName, or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && initialData.id) {
        setFormData(getPopulatedFormData(collectionName, initialData));
      } else {
        setFormData(getEmptyFormData(collectionName));
      }
      setError("");
      setIsSubmitting(false);
    }
  }, [initialData, collectionName, isOpen]);

  // Derived user-friendly entity label
  const entityLabel = useMemo(() => {
    switch (collectionName) {
      case "Experiences":
        return "Experience";
      case "Educations":
        return "Education";
      case "CoreStrengths":
        return "Core Strength";
      default:
        return collectionName.slice(0, -1);
    }
  }, [collectionName]);

  const modalTitle = useMemo(() => {
    if (!isEditing) return `Add ${entityLabel}`;
    const name =
      initialData?.name || initialData?.title || initialData?.degName || "";
    return name ? `Edit ${entityLabel}: ${name}` : `Edit ${entityLabel}`;
  }, [isEditing, entityLabel, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Helper for quick technology tag insertion
  const handleAddTechTag = (tag) => {
    setFormData((prev) => {
      const current = prev.lang || "";
      const tags = current
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
      return { ...prev, lang: tags.join(", ") };
    });
  };

  // Helper for Experience "Current Position" checkbox toggle
  const handleCurrentPositionToggle = (e) => {
    const isCurrent = e.target.checked;
    setFormData((prev) => {
      const updated = {
        ...prev,
        current: isCurrent,
        endDate: isCurrent ? "Present" : prev.endDate === "Present" ? "" : prev.endDate,
      };
      if (isCurrent && prev.startDate) {
        updated.time = `${prev.startDate} - Present`;
      }
      return updated;
    });
  };

  // Helper for Experience date auto-formatting to "time"
  const handleAutoFormatExperienceTime = () => {
    const start = formData.startDate || "";
    const end = formData.current ? "Present" : formData.endDate || "";
    if (start && end) {
      setFormData((prev) => ({
        ...prev,
        time: `${start} - ${end}`,
      }));
    }
  };

  // Helper for Experience bullet point template insertion
  const handleInsertBulletPoints = () => {
    setFormData((prev) => ({
      ...prev,
      how:
        (prev.how ? prev.how + "\n" : "") +
        "• Architected and developed scalable features...\n• Improved query response times and system performance...\n• Collaborated cross-functionally across engineering and product teams...",
    }));
  };

  // Image uploader handler
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

  const handleDeleteFromModal = async () => {
    if (!initialData?.id) return;
    const title =
      formData.name || formData.title || formData.degName || "this record";
    if (
      typeof window !== "undefined" &&
      window.confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)
    ) {
      setIsSubmitting(true);
      setError("");
      try {
        const res = await fetch(
          `/api/admin/portfolio/${collectionName}/${initialData.id}`,
          {
            method: "DELETE",
          }
        );
        if (!res.ok) {
          const resData = await res.json().catch(() => ({}));
          throw new Error(resData.error || "Failed to delete record");
        }
        onClose();
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } catch (err) {
        setError(err.message || "Failed to delete record");
        setIsSubmitting(false);
      }
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
            <h2 className={styles.modalTitle}>{modalTitle}</h2>
            <p className={styles.modalSubtitle}>
              {isEditing
                ? "Update the fields below. Existing values are pre-filled."
                : "Fill in the fields below. Changes will be saved directly to MongoDB."}
            </p>
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
          {/* ==================== PROJECTS FORM ==================== */}
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

              <div className={styles.field}>
                <span className={styles.label}>
                  Technologies Used (comma-separated)
                </span>
                <input
                  type="text"
                  name="lang"
                  value={formData.lang || ""}
                  onChange={handleChange}
                  placeholder="Next.js, TypeScript, PostgreSQL, Redis, Docker"
                  className={styles.input}
                />
                <div className={styles.quickChipsRow}>
                  <span className={styles.quickChipLabel}>Quick Add:</span>
                  {TECH_PRESETS.map((tech) => (
                    <button
                      key={tech}
                      type="button"
                      className={styles.quickChip}
                      onClick={() => handleAddTechTag(tech)}
                    >
                      <LuPlus style={{ marginRight: 2 }} /> {tech}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <div className={styles.fieldActions}>
                    <span className={styles.label}>GitHub Repository URL</span>
                    {formData.githubUrl && (
                      <a
                        href={formData.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.inlineHelperBtn}
                      >
                        <LuExternalLink /> Test
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl || ""}
                    onChange={handleChange}
                    placeholder="https://github.com/Mahbub96/..."
                    className={styles.input}
                  />
                </label>

                <label className={styles.field}>
                  <div className={styles.fieldActions}>
                    <span className={styles.label}>Live Demo URL</span>
                    {formData.liveUrl && (
                      <a
                        href={formData.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.inlineHelperBtn}
                      >
                        <LuExternalLink /> Test
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    name="liveUrl"
                    value={formData.liveUrl || ""}
                    onChange={handleChange}
                    placeholder="https://linklens.app"
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
                    placeholder="e.g. linklens (leave blank to auto-generate)"
                    className={styles.input}
                  />
                  <span className={styles.helperText}>
                    Detail route will resolve to /projects/
                    {formData.slug || "auto-generated-slug"}/
                  </span>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Download URL (optional)</span>
                  <input
                    type="url"
                    name="downloadUrl"
                    value={formData.downloadUrl || ""}
                    onChange={handleChange}
                    placeholder="https://... (APK, ZIP, or installer link)"
                    className={styles.input}
                  />
                </label>
              </div>

              <div className={styles.imageUploadSection}>
                <div className={styles.fieldActions}>
                  <span className={styles.label}>Project Preview Image</span>
                  {formData.src && formData.src !== "/assets/img/projects.png" && (
                    <button
                      type="button"
                      className={styles.inlineHelperBtn}
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          src: "/assets/img/projects.png",
                        }))
                      }
                    >
                      <LuRotateCcw /> Reset to Default
                    </button>
                  )}
                </div>
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
                    <span>
                      {uploadingImage ? "Uploading..." : "Upload New Image"}
                    </span>
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
                    placeholder="/assets/img/projects.png or image URL"
                    className={styles.input}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </>
          )}

          {/* ==================== SKILLS FORM ==================== */}
          {collectionName === "Skills" && (
            <>
              <label className={styles.field}>
                <span className={styles.label}>Skill Name *</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="e.g. Next.js, Python, PostgreSQL, Docker"
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
                    placeholder="e.g. SiJavascript, SiReact, SiPython"
                    className={styles.input}
                  />
                </label>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Quick Icon Presets:</span>
                <div className={styles.quickChipsRow}>
                  {SKILL_ICON_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      className={styles.quickChip}
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          name: p.name || preset.name,
                          icon: preset.icon,
                          color: preset.color,
                        }))
                      }
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>
                    Brand Color (Hex or CSS token)
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-secondary)",
                        background: formData.color || "var(--accent-primary)",
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      name="color"
                      value={formData.color || ""}
                      onChange={handleChange}
                      placeholder="var(--accent-primary) or color value"
                      className={styles.input}
                      style={{ flex: 1 }}
                    />
                  </div>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Logo Image URL (optional)</span>
                  <input
                    type="text"
                    name="src"
                    value={formData.src || ""}
                    onChange={handleChange}
                    placeholder="/assets/img/skills/python.png"
                    className={styles.input}
                  />
                </label>
              </div>
            </>
          )}

          {/* ==================== CORE STRENGTHS FORM ==================== */}
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
                  placeholder="Building reliable backend services, APIs, and maintainable architectures..."
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
                    placeholder="Node.js · NestJS · Express · MongoDB"
                    className={styles.input}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>
                    Icon Symbol (server, window, brain, code)
                  </span>
                  <select
                    name="icon"
                    value={formData.icon || "server"}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="server">server (Backend / Cloud)</option>
                    <option value="window">window (Frontend / UI)</option>
                    <option value="brain">brain (AI / Machine Learning)</option>
                    <option value="code">code (Full-Stack / Software)</option>
                  </select>
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
                    placeholder="var(--accent-primary) or color value"
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
                    placeholder="var(--accent-softer) or glow value"
                    className={styles.input}
                  />
                </label>
              </div>
            </>
          )}

          {/* ==================== EXPERIENCES FORM ==================== */}
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
                  <div className={styles.fieldActions}>
                    <span className={styles.label}>Display Period *</span>
                    <button
                      type="button"
                      className={styles.inlineHelperBtn}
                      onClick={handleAutoFormatExperienceTime}
                    >
                      Auto-fill from dates
                    </button>
                  </div>
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
                  <span className={styles.label}>
                    End Date (YYYY-MM or Present)
                  </span>
                  <input
                    type="text"
                    name="endDate"
                    value={formData.endDate || ""}
                    onChange={handleChange}
                    placeholder="Present"
                    disabled={Boolean(formData.current)}
                    className={styles.input}
                  />
                </label>
              </div>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="current"
                  checked={Boolean(formData.current)}
                  onChange={handleCurrentPositionToggle}
                />
                <span>Current Position (Still working here)</span>
              </label>

              <div className={styles.field}>
                <div className={styles.fieldActions}>
                  <span className={styles.label}>
                    Key Responsibilities, Architecture & Impact *
                  </span>
                  <button
                    type="button"
                    className={styles.inlineHelperBtn}
                    onClick={handleInsertBulletPoints}
                  >
                    + Insert Bullet Template
                  </button>
                </div>
                <textarea
                  name="how"
                  value={formData.how || ""}
                  onChange={handleChange}
                  placeholder="• Architected scalable web services and RESTful APIs...\n• Fixed critical production bugs and reduced latency by 30%...\n• Mentored engineering interns on best practices and testing..."
                  className={styles.textarea}
                  rows={5}
                  required
                />
              </div>
            </>
          )}

          {/* ==================== EDUCATIONS FORM ==================== */}
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
                  <span className={styles.label}>Degree / Qualification *</span>
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

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Group (optional)</span>
                  <input
                    type="text"
                    name="group"
                    value={formData.group || ""}
                    onChange={handleChange}
                    placeholder="Science"
                    className={styles.input}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>
                    Thesis / Final Project (optional)
                  </span>
                  <input
                    type="text"
                    name="Thesis"
                    value={formData.Thesis || ""}
                    onChange={handleChange}
                    placeholder="Speech Emotion Recognition Using Deep Learning"
                    className={styles.input}
                  />
                </label>
              </div>
            </>
          )}

          {/* ==================== CERTIFICATIONS FORM ==================== */}
          {collectionName === "Certifications" && (
            <>
              <label className={styles.field}>
                <span className={styles.label}>Certification Title *</span>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  placeholder="e.g. React (Basic) Certification, AWS Certified Cloud Practitioner"
                  className={styles.input}
                  required
                />
              </label>

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Issuer / Authority *</span>
                  <input
                    type="text"
                    name="issuer"
                    value={formData.issuer || ""}
                    onChange={handleChange}
                    placeholder="HackerRank, Coursera, Amazon Web Services"
                    className={styles.input}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Issue Date / Year</span>
                  <input
                    type="text"
                    name="issueDate"
                    value={formData.issueDate || ""}
                    onChange={handleChange}
                    placeholder="e.g. 2024 or October 2023"
                    className={styles.input}
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>
                  Credential Verification URL
                </span>
                <input
                  type="url"
                  name="url"
                  value={formData.url || ""}
                  onChange={handleChange}
                  placeholder="https://www.hackerrank.com/certificates/..."
                  className={styles.input}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Description / Details</span>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Skills validated, topics covered, or honors..."
                  className={styles.textarea}
                  rows={3}
                />
              </label>
            </>
          )}

          {/* ==================== ACHIEVEMENTS FORM ==================== */}
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

              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Organization / Event</span>
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
                  <span className={styles.label}>Date / Year</span>
                  <input
                    type="text"
                    name="date"
                    value={formData.date || ""}
                    onChange={handleChange}
                    placeholder="e.g. 2023"
                    className={styles.input}
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Description & Impact *</span>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Details of leadership, awards, contributions, or achievements..."
                  className={styles.textarea}
                  rows={4}
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
                <strong>Visible to Public:</strong> When unchecked, this item is
                hidden from the public portfolio, search engines, and generated
                resumes, but stays visible to you as an admin.
              </span>
            </label>
          </div>

          <footer className={styles.modalFooter}>
            {isEditing && (
              <button
                type="button"
                className={styles.btnDanger}
                onClick={handleDeleteFromModal}
                disabled={isSubmitting}
                title={`Delete this ${entityLabel}`}
              >
                <LuTrash2 />
                <span>Delete {entityLabel}</span>
              </button>
            )}
            <div className={styles.modalFooterActions}>
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
                <span>{isEditing ? "Save Changes" : `Create ${entityLabel}`}</span>
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
