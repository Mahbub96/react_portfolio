"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./skills.module.css";
import { resolveSkillIcon } from "./skillsRegistry";
import { useDataContext } from "@/contexts/useAllContext";
import { useSectionAdminContext } from "@/components/admin/contextual/PortfolioContextualControls";
import { LuEye, LuEyeOff, LuPencil, LuTrash2 } from "react-icons/lu";

export default function TechnologyChip({ skill }) {
  const name = skill?.name || "Skill";
  const category = skill?.category || "";
  const { Icon, color } = resolveSkillIcon(skill);
  const { auth } = useDataContext();
  const sectionCtx = useSectionAdminContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isPublished = skill.published !== false;

  const handleEdit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (sectionCtx?.openEdit) {
      sectionCtx.openEdit(skill);
    }
  };

  const handleToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!skill?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/portfolio/Skills/${skill.id}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !isPublished }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to toggle skill visibility:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!skill?.id) return;
    if (
      typeof window !== "undefined" &&
      window.confirm(`Are you sure you want to remove "${name}" from Skills? This cannot be undone.`)
    ) {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/portfolio/Skills/${skill.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          router.refresh();
        }
      } catch (err) {
        console.error("Failed to delete skill:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className={`${styles.techChip} ${!isPublished ? styles.techChipHidden : ""}`}
      role="listitem"
      tabIndex={0}
      aria-label={`${name} skill`}
    >
      {/* Floating Hover Card / Tooltip revealing full card details (logged-in admin only) */}
      {auth && (
        <div className={styles.chipHoverView} role="tooltip" aria-hidden="true">
          {Icon && (
            <span
              className={styles.hoverViewIcon}
              style={{ "--brand-color": color || "currentColor" }}
            >
              <Icon />
            </span>
          )}
          <div className={styles.hoverViewContent}>
            <span className={styles.hoverViewName}>{name}</span>
            <div className={styles.hoverViewMeta}>
              {category && <span className={styles.hoverViewCategory}>{category}</span>}
              <span
                className={
                  isPublished
                    ? styles.hoverBadgePublic
                    : styles.hoverBadgeHidden
                }
              >
                {isPublished ? "Visible" : "Hidden"}
              </span>
            </div>
          </div>
        </div>
      )}

      {Icon && (
        <span
          className={styles.chipIconWrapper}
          style={{ "--brand-color": color || "currentColor" }}
          aria-hidden="true"
        >
          <Icon className={styles.chipIcon} />
        </span>
      )}
      <span className={styles.chipName}>{name}</span>
      {!isPublished && (
        <span className={styles.hiddenChipTag}>
          (Hidden)
        </span>
      )}
      {auth && (
        <div
          className={styles.chipAdminActions}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleToggle}
            disabled={loading}
            className={`${styles.chipAdminBtn} ${!isPublished ? styles.chipAdminBtnActive : ""}`}
            title={isPublished ? "Hide from public" : "Publish to public"}
            aria-label={isPublished ? "Hide from public" : "Publish to public"}
          >
            {isPublished ? <LuEye /> : <LuEyeOff />}
          </button>
          <button
            type="button"
            onClick={handleEdit}
            disabled={loading}
            className={styles.chipAdminBtn}
            title={`Edit ${name}`}
            aria-label={`Edit ${name}`}
          >
            <LuPencil />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className={`${styles.chipAdminBtn} ${styles.chipAdminBtnDanger}`}
            title={`Delete ${name}`}
            aria-label={`Delete ${name}`}
          >
            <LuTrash2 />
          </button>
        </div>
      )}
    </div>
  );
}
