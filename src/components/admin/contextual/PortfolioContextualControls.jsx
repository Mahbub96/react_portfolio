"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuEye, LuEyeOff, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import { useDataContext } from "@/contexts/useAllContext";
import PortfolioItemModal from "../portfolio/PortfolioItemModal";
import styles from "./contextual.module.css";

/**
 * On-card admin action toolbar (Edit, Toggle Visibility, Delete).
 * Only renders when an administrator is authenticated.
 */
export function AdminCardOverlay({ collectionName, item, onEdit }) {
  const { auth } = useDataContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!auth) return null;

  const isPublished = item.published !== false;

  const handleToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/portfolio/${collectionName}/${item.id}/visibility`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published: !isPublished }),
        }
      );
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Visibility toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const title = item.name || item.title || "this item";
    if (
      typeof window !== "undefined" &&
      window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)
    ) {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/portfolio/${collectionName}/${item.id}`,
          {
            method: "DELETE",
          }
        );
        if (res.ok) {
          router.refresh();
        }
      } catch (err) {
        console.error("Delete error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      {!isPublished && <span className={styles.hiddenBadge}>Hidden</span>}
      <div className={styles.actionsOverlay} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={`${styles.actionBtn} ${!isPublished ? styles.actionBtnActive : ""}`}
          onClick={handleToggle}
          disabled={loading}
          title={isPublished ? "Hide from public portfolio" : "Publish to public portfolio"}
          aria-label={isPublished ? "Hide from public" : "Publish to public"}
        >
          {isPublished ? <LuEye /> : <LuEyeOff />}
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onEdit(item);
          }}
          disabled={loading}
          title="Edit Record"
          aria-label="Edit record"
        >
          <LuPencil />
        </button>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
          onClick={handleDelete}
          disabled={loading}
          title="Delete Record"
          aria-label="Delete record"
        >
          <LuTrash2 />
        </button>
      </div>
    </>
  );
}

/**
 * On-site "+ Add [Item]" card or button.
 * Only renders when an administrator is authenticated.
 */
export function AdminAddCard({ collectionName, label, onAdd, isTimeline = false }) {
  const { auth } = useDataContext();

  if (!auth) return null;

  if (isTimeline) {
    return (
      <button
        type="button"
        className={styles.timelineAddBtn}
        onClick={onAdd}
        title={`Add new ${label}`}
      >
        <LuPlus />
        <span>+ Add {label}</span>
      </button>
    );
  }

  return (
    <div
      className={styles.addCard}
      onClick={onAdd}
      role="button"
      tabIndex={0}
      aria-label={`Add new ${label}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAdd();
        }
      }}
    >
      <div className={styles.addIcon}>
        <LuPlus />
      </div>
      <span className={styles.addLabel}>+ Add {label}</span>
    </div>
  );
}

/**
 * Wrapper providing stateful modal editing and adding for on-site sections.
 */
export function useSectionAdmin(collectionName) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const router = useRouter();

  const openAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    const isEditing = Boolean(payload.id && editingItem?.id);
    const url = isEditing
      ? `/api/admin/portfolio/${collectionName}/${payload.id}`
      : `/api/admin/portfolio/${collectionName}`;
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to save item");
    }

    router.refresh();
  };

  const ModalComponent = (
    <PortfolioItemModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      onSave={handleSave}
      collectionName={collectionName}
      initialData={editingItem}
    />
  );

  return {
    openAdd,
    openEdit,
    ModalComponent,
  };
}
