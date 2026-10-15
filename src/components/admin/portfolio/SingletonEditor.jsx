"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { LuCheck, LuImage, LuLoaderCircle, LuUpload, LuX } from "react-icons/lu";
import styles from "./portfolioDashboard.module.css";

export default function SingletonEditor({
  profileData = {},
  bannerData = {},
  onSaveProfile,
  onSaveBanner,
}) {
  const [profile, setProfile] = useState(profileData || {});
  const [banner, setBanner] = useState(bannerData || {});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("profile");

  useEffect(() => {
    setProfile(profileData || {});
  }, [profileData]);

  useEffect(() => {
    setBanner(bannerData || {});
  }, [bannerData]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleBannerChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social.")) {
      const key = name.split(".")[1];
      setBanner((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [key]: value },
      }));
    } else {
      setBanner((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const data = new FormData();
      data.append("image", file);
      data.append("collectionName", "profile");
      data.append("documentId", "profile");

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: data,
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Image upload failed");

      setProfile((prev) => ({
        ...prev,
        image: resData.image || resData.url || prev.image,
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const saveProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await onSaveProfile(profile);
    } finally {
      setSavingProfile(false);
    }
  };

  const saveBannerSubmit = async (e) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      await onSaveBanner(banner);
    } finally {
      setSavingBanner(false);
    }
  };

  return (
    <div className={styles.singletonContainer}>
      <div className={styles.subTabs}>
        <button
          type="button"
          className={`${styles.subTabBtn} ${activeSubTab === "profile" ? styles.subTabActive : ""}`}
          onClick={() => setActiveSubTab("profile")}
        >
          Profile & Bio Settings
        </button>
        <button
          type="button"
          className={`${styles.subTabBtn} ${activeSubTab === "banner" ? styles.subTabActive : ""}`}
          onClick={() => setActiveSubTab("banner")}
        >
          Hero Banner & Tagline
        </button>
      </div>

      {activeSubTab === "profile" && (
        <form onSubmit={saveProfileSubmit} className={styles.editorCard}>
          <div className={styles.editorHead}>
            <div>
              <h3 className={styles.editorTitle}>Personal Profile Information</h3>
              <p className={styles.editorSub}>Used across the About page, footer, structured metadata, and CV.</p>
            </div>
            <div className={styles.editorHeadActions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={() => setProfile(profileData || {})}
                disabled={savingProfile}
                title="Discard unsaved changes to profile"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={savingProfile}
              >
                {savingProfile ? <LuLoaderCircle className={styles.spin} /> : <LuCheck />}
                <span>Save Profile</span>
              </button>
            </div>
          </div>

          <div className={styles.imageUploadSection} style={{ marginBottom: "1.5rem" }}>
            <span className={styles.label}>Profile Picture / Headshot</span>
            <div className={styles.imageUploadRow}>
              {profile.image ? (
                <div className={styles.avatarPreview}>
                  <Image
                    src={profile.image}
                    alt={profile.name || "Avatar"}
                    width={80}
                    height={80}
                    className={styles.avatarImg}
                    unoptimized
                  />
                </div>
              ) : (
                <div className={styles.imagePlaceholder} style={{ width: 80, height: 80 }}>
                  <LuImage />
                </div>
              )}
              <label className={styles.uploadBtn}>
                {uploadingImage ? <LuLoaderCircle className={styles.spin} /> : <LuUpload />}
                <span>{uploadingImage ? "Uploading..." : "Upload New Headshot"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  disabled={uploadingImage}
                  hidden
                />
              </label>
              <input
                type="text"
                name="image"
                value={profile.image || ""}
                onChange={handleProfileChange}
                placeholder="or enter image path"
                className={styles.input}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.label}>Full Name *</span>
              <input
                type="text"
                name="name"
                value={profile.name || ""}
                onChange={handleProfileChange}
                className={styles.input}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Professional Title *</span>
              <input
                type="text"
                name="title"
                value={profile.title || ""}
                onChange={handleProfileChange}
                className={styles.input}
                required
              />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Bio / Executive Summary *</span>
            <textarea
              name="bio"
              value={profile.bio || ""}
              onChange={handleProfileChange}
              className={styles.textarea}
              rows={4}
              required
            />
          </label>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.label}>Email Address *</span>
              <input
                type="email"
                name="email"
                value={profile.email || ""}
                onChange={handleProfileChange}
                className={styles.input}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Phone Number</span>
              <input
                type="text"
                name="phone"
                value={profile.phone || ""}
                onChange={handleProfileChange}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.label}>Location *</span>
              <input
                type="text"
                name="location"
                value={profile.location || ""}
                onChange={handleProfileChange}
                className={styles.input}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Current Company / Affiliation</span>
              <input
                type="text"
                name="company"
                value={profile.company || ""}
                onChange={handleProfileChange}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.label}>GitHub Profile URL</span>
              <input
                type="url"
                name="github"
                value={profile.github || ""}
                onChange={handleProfileChange}
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>LinkedIn Profile URL</span>
              <input
                type="url"
                name="linkedin"
                value={profile.linkedin || ""}
                onChange={handleProfileChange}
                className={styles.input}
              />
            </label>
          </div>
        </form>
      )}

      {activeSubTab === "banner" && (
        <form onSubmit={saveBannerSubmit} className={styles.editorCard}>
          <div className={styles.editorHead}>
            <div>
              <h3 className={styles.editorTitle}>Hero Banner Configuration</h3>
              <p className={styles.editorSub}>Displayed on the prominent hero section of mahbub.dev.</p>
            </div>
            <div className={styles.editorHeadActions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={() => setBanner(bannerData || {})}
                disabled={savingBanner}
                title="Discard unsaved changes to banner"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={savingBanner}
              >
                {savingBanner ? <LuLoaderCircle className={styles.spin} /> : <LuCheck />}
                <span>Save Banner</span>
              </button>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.label}>Display Name *</span>
              <input
                type="text"
                name="name"
                value={banner.name || ""}
                onChange={handleBannerChange}
                className={styles.input}
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Job Title *</span>
              <input
                type="text"
                name="jobTitle"
                value={banner.jobTitle || ""}
                onChange={handleBannerChange}
                className={styles.input}
                required
              />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Hero Headline *</span>
            <textarea
              name="headline"
              value={banner.headline || ""}
              onChange={handleBannerChange}
              placeholder="e.g. I build maintainable web applications, backend APIs, and practical AI-enabled systems for real business workflows."
              className={styles.textarea}
              rows={2}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Hero Bio / Subtext *</span>
            <textarea
              name="bio"
              value={banner.bio || ""}
              onChange={handleBannerChange}
              className={styles.textarea}
              rows={3}
              required
            />
          </label>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.label}>Social Email</span>
              <input
                type="email"
                name="social.email"
                value={banner.socialLinks?.email || ""}
                onChange={handleBannerChange}
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>GitHub Handle / URL</span>
              <input
                type="text"
                name="social.github"
                value={banner.socialLinks?.github || ""}
                onChange={handleBannerChange}
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span className={styles.label}>LinkedIn Handle / URL</span>
              <input
                type="text"
                name="social.linkedin"
                value={banner.socialLinks?.linkedin || ""}
                onChange={handleBannerChange}
                className={styles.input}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Facebook Handle / URL</span>
              <input
                type="text"
                name="social.facebook"
                value={banner.socialLinks?.facebook || ""}
                onChange={handleBannerChange}
                className={styles.input}
              />
            </label>
          </div>
        </form>
      )}
    </div>
  );
}
