"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LuEye, LuEyeOff, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import { useDataContext } from "@/contexts/useAllContext";
import PortfolioItemModal from "../portfolio/PortfolioItemModal";
import styles from "./contextual.module.css";

const SectionAdminContext = createContext(null);

export function useSectionAdminContext() {
  return useContext(SectionAdminContext);
}

/**
 * Shared section-level administrator provider.
 * Guarantees a single modal per section where:
 * - "Add" opens the modal with clean, empty data.
 * - "Edit" opens the SAME modal populated with the clicked item's existing data.
 */
export function SectionAdminProvider({ collectionName, children }) {
  const { auth } = useDataContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const router = useRouter();

  const openAdd = useCallback(() => {
    setEditingItem(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((item) => {
    setEditingItem(item);
    setModalOpen(true);
  }, []);

  const close = useCallback(() => {
    setModalOpen(false);
    setEditingItem(null);
  }, []);

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

    close();
    router.refresh();
  };

  return (
    <SectionAdminContext.Provider
      value={{
        collectionName,
        openAdd,
        openEdit,
        close,
      }}
    >
      {children}
      {auth && (
        <PortfolioItemModal
          isOpen={modalOpen}
          onClose={close}
          onSave={handleSave}
          collectionName={collectionName}
          initialData={editingItem}
        />
      )}
    </SectionAdminContext.Provider>
  );
}

/**
 * On-card admin action toolbar (Edit, Toggle Visibility, Delete).
 * Only renders when an administrator is authenticated.
 */
export function AdminCardOverlay({ collectionName, item, onEdit }) {
  const { auth } = useDataContext();
  const sectionCtx = useSectionAdminContext();
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

    const title = item.name || item.title || item.degName || "this item";
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

  const handleEditClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onEdit) {
      onEdit(item);
    } else if (sectionCtx && sectionCtx.openEdit) {
      sectionCtx.openEdit(item);
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
          onClick={handleEditClick}
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
  const sectionCtx = useSectionAdminContext();

  if (!auth) return null;

  const handleAddClick = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (onAdd) {
      onAdd();
    } else if (sectionCtx && sectionCtx.openAdd) {
      sectionCtx.openAdd();
    }
  };

  if (isTimeline) {
    return (
      <button
        type="button"
        className={styles.timelineAddBtn}
        onClick={handleAddClick}
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
      onClick={handleAddClick}
      role="button"
      tabIndex={0}
      aria-label={`Add new ${label}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleAddClick(e);
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
 * Hook providing access to openAdd and openEdit.
 * If used inside SectionAdminProvider, binds to the shared modal.
 * Otherwise creates a standalone modal instance.
 */
export function useSectionAdmin(collectionName) {
  const context = useContext(SectionAdminContext);
  if (context && context.collectionName === collectionName) {
    return {
      openAdd: context.openAdd,
      openEdit: context.openEdit,
      ModalComponent: null, // modal rendered once at SectionAdminProvider
    };
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const router = useRouter();

  const openAdd = useCallback(() => {
    setEditingItem(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((item) => {
    setEditingItem(item);
    setModalOpen(true);
  }, []);

  const close = useCallback(() => {
    setModalOpen(false);
    setEditingItem(null);
  }, []);

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

    close();
    router.refresh();
  };

  const ModalComponent = (
    <PortfolioItemModal
      isOpen={modalOpen}
      onClose={close}
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
