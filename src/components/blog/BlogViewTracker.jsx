"use client";

import { useEffect, useState } from "react";
import { LuEye } from "react-icons/lu";
import styles from "@/app/blog/blog.module.css";

export function formatViews(num) {
  const count = typeof num === "number" && !isNaN(num) ? num : 0;
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return count.toLocaleString();
}

export default function BlogViewTracker({ slug, initialViews = 0 }) {
  const [views, setViews] = useState(initialViews || 0);

  useEffect(() => {
    if (!slug) return;

    const storageKey = `blog_view_${slug}`;
    const hasViewed = typeof window !== "undefined" && sessionStorage.getItem(storageKey);

    const recordOrFetch = async () => {
      try {
        if (!hasViewed) {
          // First view in this session: record the visit
          sessionStorage.setItem(storageKey, "1");
          const res = await fetch("/api/blog/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          });
          const data = await res.json();
          if (data?.success && typeof data?.views === "number") {
            setViews(data.views);
          }
        } else {
          // Already counted this session: get latest views
          const res = await fetch(`/api/blog/views?slug=${encodeURIComponent(slug)}`);
          const data = await res.json();
          if (data?.success && typeof data?.views === "number") {
            setViews(data.views);
          }
        }
      } catch (err) {
        // Fallback to initial views on network errors
      }
    };

    recordOrFetch();
  }, [slug]);

  return (
    <span className={styles.viewBadge} title={`${views.toLocaleString()} total views`}>
      <LuEye className={styles.viewIcon} aria-hidden="true" />
      <span>
        {formatViews(views)} {views === 1 ? "view" : "views"}
      </span>
    </span>
  );
}
