"use client";

import React, { useState } from "react";
import { FaFileDownload } from "react-icons/fa";
import styles from "./banner.module.css";

export default function DownloadResumeButton({
  fileName = "Resume.pdf",
  resumeMode = "dynamic",
}) {
  const [loading, setLoading] = useState(false);
  const isStatic = resumeMode === "static";
  const loadingLabel = isStatic ? "Downloading..." : "Generating...";

  const handleDownload = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch("/api/resume/", { method: "GET" });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Resume API returned ${response.status}`);
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const downloadName = match?.[1] || fileName;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.log("Failed to download resume:", error);
      alert(error.message || "Failed to download resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={styles.ctaButton}
      disabled={loading}
      aria-busy={loading}
    >
      <FaFileDownload />
      <span>{loading ? loadingLabel : "Download Resume"}</span>
    </button>
  );
}
