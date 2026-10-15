"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  LuArrowDown,
  LuArrowUp,
  LuBookOpen,
  LuBriefcase,
  LuCode,
  LuEye,
  LuEyeOff,
  LuFolderGit2,
  LuGraduationCap,
  LuLayers,
  LuLoaderCircle,
  LuPencil,
  LuPlus,
  LuSearch,
  LuSparkles,
  LuTrash2,
  LuUser,
} from "react-icons/lu";
import { useAdminUI } from "../AdminUI";
import PortfolioItemModal from "./PortfolioItemModal";
import SingletonEditor from "./SingletonEditor";
import styles from "./portfolioDashboard.module.css";

const TABS = [
  { key: "Projects", label: "Projects", icon: LuFolderGit2 },
  { key: "Skills", label: "Skills", icon: LuCode },
  { key: "CoreStrengths", label: "Core Strengths", icon: LuSparkles },
  { key: "Experiences", label: "Experience", icon: LuBriefcase },
  { key: "Educations", label: "Education", icon: LuGraduationCap },
  { key: "Certifications", label: "Certifications", icon: LuBookOpen },
  { key: "Achievements", label: "Achievements", icon: LuLayers },
  { key: "Profile", label: "Profile & Banner", icon: LuUser },
];

export default function PortfolioDashboard() {
  const { toast, confirm } = useAdminUI();
  const [activeTab, setActiveTab] = useState("Projects");
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState({
    isOpen: false,
    collectionName: "Projects",
    initialData: null,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/portfolio", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load portfolio collections");
      const json = await res.json();
      setCollections(json.collections || {});
    } catch (err) {
      toast(err.message || "Failed to load data", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentItems = useMemo(() => {
    if (activeTab === "Profile") return [];
    const raw = collections[activeTab]?.data || [];
    if (!Array.isArray(raw)) return [];

    const q = searchQuery.trim().toLowerCase();
    return raw.filter((item) => {
      // Status filter
      if (statusFilter === "published" && item.published === false) return false;
      if (statusFilter === "hidden" && item.published !== false) return false;

      // Text query
      if (!q) return true;
      const haystack = `${item.name || ""} ${item.title || ""} ${item.desc || ""} ${item.description || ""} ${item.company || ""} ${item.degName || ""} ${item.category || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [collections, activeTab, searchQuery, statusFilter]);

  // Visibility toggle
  const handleToggleVisibility = async (item) => {
    const newStatus = item.published === false;
    try {
      const res = await fetch(
        `/api/admin/portfolio/${activeTab}/${item.id}/visibility`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to toggle visibility");
      toast(newStatus ? "Item is now visible" : "Item is now hidden");
      loadData();
    } catch (err) {
      toast(err.message, { type: "error" });
    }
  };

  // Reordering: move item up or down
  const handleMove = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentItems.length) return;

    const fullList = [...(collections[activeTab]?.data || [])];
    const itemA = currentItems[index];
    const itemB = currentItems[targetIndex];

    const idxA = fullList.findIndex((i) => i.id === itemA.id);
    const idxB = fullList.findIndex((i) => i.id === itemB.id);

    if (idxA === -1 || idxB === -1) return;

    // Swap in full list
    const temp = fullList[idxA];
    fullList[idxA] = fullList[idxB];
    fullList[idxB] = temp;

    const orderedIds = fullList.map((i) => i.id);

    try {
      const res = await fetch(`/api/admin/portfolio/${activeTab}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) throw new Error("Failed to save new order");
      toast("Order updated");
      loadData();
    } catch (err) {
      toast(err.message, { type: "error" });
    }
  };

  // Deletion
  const handleDelete = async (item) => {
    const itemName = item.name || item.title || "this record";
    const ok = await confirm({
      title: `Delete "${itemName}"?`,
      body: `This record will be permanently deleted from ${activeTab}. This cannot be undone.`,
      confirmLabel: "Delete Record",
      danger: true,
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/portfolio/${activeTab}/${item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete record");
      toast("Record deleted successfully");
      loadData();
    } catch (err) {
      toast(err.message, { type: "error" });
    }
  };

  // Save from modal (create or update)
  const handleSaveItem = async (payload) => {
    const isEditing = Boolean(payload.id && modalState.initialData?.id);
    const url = isEditing
      ? `/api/admin/portfolio/${modalState.collectionName}/${payload.id}`
      : `/api/admin/portfolio/${modalState.collectionName}`;
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to save item");
    }

    toast(isEditing ? "Record updated successfully" : "Record created successfully");
    loadData();
  };

  // Save singleton
  const handleSaveSingleton = async (section, payload) => {
    try {
      const res = await fetch(`/api/admin/portfolio/singleton/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to update ${section}`);
      toast(`${section} updated successfully`);
      loadData();
    } catch (err) {
      toast(err.message, { type: "error" });
    }
  };

  return (
    <main className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Portfolio Content Management</h1>
          <p className={styles.subtitle}>
            Create, edit, hide/show, reorder and delete content across mahbub.dev in real-time.
          </p>
        </div>
        {activeTab !== "Profile" && (
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() =>
              setModalState({
                isOpen: true,
                collectionName: activeTab,
                initialData: null,
              })
            }
          >
            <LuPlus aria-hidden="true" />
            <span>Add {activeTab.slice(0, -1)}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <nav className={styles.tabs} aria-label="Portfolio sections">
        {TABS.map(({ key, label, icon: TabIcon }) => {
          const count = Array.isArray(collections[key]?.data)
            ? collections[key].data.length
            : null;
          return (
            <button
              key={key}
              type="button"
              className={`${styles.tabBtn} ${activeTab === key ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab(key);
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              <TabIcon aria-hidden="true" />
              <span>{label}</span>
              {count !== null && <span className={styles.badgeCount}>{count}</span>}
            </button>
          );
        })}
      </nav>

      {/* Profile & Banner Singleton Editor */}
      {activeTab === "Profile" ? (
        <SingletonEditor
          profileData={collections.profile?.data}
          bannerData={collections.Banner?.data}
          onSaveProfile={(data) => handleSaveSingleton("profile", data)}
          onSaveBanner={(data) => handleSaveSingleton("Banner", data)}
        />
      ) : (
        <>
          {/* Controls Bar */}
          <div className={styles.controlsBar}>
            <div className={styles.searchBox}>
              <LuSearch className={styles.searchIcon} aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.statusFilter}
                aria-label="Filter by visibility"
              >
                <option value="all">All Items</option>
                <option value="published">Published Only</option>
                <option value="hidden">Hidden Only</option>
              </select>
            </div>
          </div>

          {/* Items List */}
          {loading ? (
            <div className={styles.emptyState}>
              <LuLoaderCircle className={`${styles.emptyIcon} ${styles.spin}`} />
              <p className={styles.emptyTitle}>Loading {activeTab}...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📁</div>
              <h2 className={styles.emptyTitle}>No items found in {activeTab}</h2>
              <p className={styles.emptyDesc}>
                {searchQuery
                  ? "No records matched your search query."
                  : `Get started by adding the first item to ${activeTab}.`}
              </p>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() =>
                  setModalState({
                    isOpen: true,
                    collectionName: activeTab,
                    initialData: null,
                  })
                }
              >
                <LuPlus />
                <span>Add {activeTab.slice(0, -1)}</span>
              </button>
            </div>
          ) : (
            <div className={styles.itemList} role="list">
              {currentItems.map((item, index) => {
                const isPublished = item.published !== false;
                const title = item.name || item.title || "Untitled";
                const subtitle =
                  item.desc ||
                  item.description ||
                  item.company ||
                  item.degName ||
                  item.issuer ||
                  item.tech ||
                  "";

                return (
                  <article
                    key={item.id}
                    className={`${styles.itemCard} ${!isPublished ? styles.itemCardHidden : ""}`}
                    role="listitem"
                  >
                    {/* Reorder Buttons */}
                    <div className={styles.reorderHandle} aria-label="Reorder">
                      <button
                        type="button"
                        className={styles.orderBtn}
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        title="Move Up"
                        aria-label="Move item up"
                      >
                        <LuArrowUp />
                      </button>
                      <button
                        type="button"
                        className={styles.orderBtn}
                        onClick={() => handleMove(index, "down")}
                        disabled={index === currentItems.length - 1}
                        title="Move Down"
                        aria-label="Move item down"
                      >
                        <LuArrowDown />
                      </button>
                    </div>

                    {/* Thumbnail if image is present */}
                    {item.src && (
                      <div className={styles.itemThumbnail}>
                        <Image
                          src={item.src}
                          alt={title}
                          width={56}
                          height={56}
                          unoptimized
                        />
                      </div>
                    )}

                    {/* Item Information */}
                    <div className={styles.itemInfo}>
                      <div className={styles.itemTitleRow}>
                        <h2 className={styles.itemTitle}>{title}</h2>
                        <span
                          className={`${styles.statusPill} ${
                            isPublished ? styles.statusPublished : styles.statusHidden
                          }`}
                        >
                          {isPublished ? "Published" : "Hidden"}
                        </span>
                        {item.category && (
                          <span className={styles.metaTag}>{item.category}</span>
                        )}
                        {item.time && (
                          <span className={styles.metaTag}>{item.time}</span>
                        )}
                      </div>

                      {subtitle && <p className={styles.itemSubtitle}>{subtitle}</p>}

                      {/* Project Tech Tags */}
                      {Array.isArray(item.lang) && item.lang.length > 0 && (
                        <div className={styles.itemMeta}>
                          {item.lang.slice(0, 5).map((tech) => (
                            <span key={tech} className={styles.metaTag}>
                              {tech}
                            </span>
                          ))}
                          {item.lang.length > 5 && (
                            <span className={styles.metaTag}>+{item.lang.length - 5}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className={styles.itemActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => handleToggleVisibility(item)}
                        title={isPublished ? "Hide from public portfolio" : "Publish to portfolio"}
                        aria-label={isPublished ? "Hide from public" : "Publish to public"}
                      >
                        {isPublished ? <LuEye /> : <LuEyeOff />}
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() =>
                          setModalState({
                            isOpen: true,
                            collectionName: activeTab,
                            initialData: item,
                          })
                        }
                        title="Edit Record"
                        aria-label="Edit record"
                      >
                        <LuPencil />
                      </button>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        onClick={() => handleDelete(item)}
                        title="Delete Record"
                        aria-label="Delete record"
                      >
                        <LuTrash2 />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Editor Modal */}
      <PortfolioItemModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveItem}
        collectionName={modalState.collectionName}
        initialData={modalState.initialData}
      />
    </main>
  );
}
