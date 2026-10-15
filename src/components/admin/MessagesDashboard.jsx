"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LuTriangleAlert,
  LuCircleCheck,
  LuClock,
  LuDatabase,
  LuInbox,
  LuMail,
  LuRefreshCw,
  LuSearch,
  LuSend,
  LuTrash2,
  LuX,
  LuExternalLink,
} from "react-icons/lu";
import { useAdminUI } from "./AdminUI";
import styles from "./messages.module.css";
import adminStyles from "./admin.module.css";

const TABS = [
  { id: "all", label: "All Inquiries" },
  { id: "saved_locally", label: "Saved Locally" },
  { id: "sent", label: "Delivered" },
  { id: "failed", label: "Failed" },
];

function relativeTime(iso) {
  if (!iso) return "";
  const seconds = Math.round((Date.now() - Date.parse(iso)) / 1000);
  const abs = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ]) {
    if (abs >= size) return rtf.format(-Math.round(seconds / size), unit);
  }
  return "just now";
}

function formatFullDate(iso) {
  if (!iso) return "N/A";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Dhaka",
    });
  } catch {
    return iso;
  }
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (name[0] || "?").toUpperCase();
}

export default function MessagesDashboard() {
  const { toast, confirm } = useAdminUI();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ items: [], stats: { total: 0, saved_locally: 0, sent: 0, failed: 0 } });
  const [selectedMessage, setSelectedMessage] = useState(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab !== "all") params.set("status", tab);
      if (query.trim()) params.set("q", query.trim());

      const res = await fetch(`/api/admin/messages/?${params.toString()}`, {
        cache: "no-store",
      });

      if (res.status === 401) {
        window.location.assign("/admin/login/?next=/admin/messages/");
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to load messages (status ${res.status})`);
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      toast(err.message || "Could not fetch messages", { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [tab, query, toast]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedMessage) {
        setSelectedMessage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMessage]);

  const handleDelete = async (msg) => {
    const confirmed = await confirm({
      title: `Delete inquiry from ${msg.name}?`,
      body: `This inquiry regarding "${msg.subject}" will be permanently removed from the database.`,
      confirmLabel: "Delete Inquiry",
      danger: true,
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/messages/${msg.id}/`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete message");
      }

      toast("Inquiry deleted successfully");
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage(null);
      }
      loadMessages();
    } catch (err) {
      toast(err.message || "Failed to delete message", { type: "error" });
    }
  };

  const stats = data?.stats || { total: 0, saved_locally: 0, sent: 0, failed: 0 };
  const items = data?.items || [];

  return (
    <main className={adminStyles.main}>
      <div className={adminStyles.pageHead}>
        <div>
          <h1 className={adminStyles.pageTitle}>Inquiries & Messages</h1>
          <p className={adminStyles.pageSub}>
            Investigate, review and manage contact form submissions stored in the database.
          </p>
        </div>
        <button
          type="button"
          className={`${adminStyles.btn} ${adminStyles.btnGhost}`}
          onClick={loadMessages}
          disabled={loading}
          title="Refresh Messages"
        >
          <LuRefreshCw className={loading ? adminStyles.spin : ""} aria-hidden="true" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top Stat Overview Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <LuInbox aria-hidden="true" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total Inquiries</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
            <LuDatabase aria-hidden="true" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.saved_locally}</span>
            <span className={styles.statLabel}>Saved Locally (DB Only)</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
            <LuCircleCheck aria-hidden="true" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.sent}</span>
            <span className={styles.statLabel}>Delivered via Email</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconError}`}>
            <LuTriangleAlert aria-hidden="true" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.failed}</span>
            <span className={styles.statLabel}>Delivery Failed</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.tabs} role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span>{t.label}</span>
              {t.id !== "all" && stats[t.id] !== undefined && (
                <span className={styles.tabCount}>{stats[t.id]}</span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.searchWrapper}>
          <LuSearch className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search by name, email, subject..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Messages List */}
      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <LuInbox className={styles.emptyIcon} aria-hidden="true" />
          <h2 className={styles.emptyTitle}>No inquiries found</h2>
          <p className={styles.emptyText}>
            {query
              ? `No messages match your search "${query}".`
              : "When visitors submit the Contact Us form, inquiries will appear here."}
          </p>
        </div>
      ) : (
        <div className={styles.messageList}>
          {items.map((msg) => (
            <article
              key={msg.id}
              className={styles.messageCard}
              onClick={() => setSelectedMessage(msg)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedMessage(msg);
                }
              }}
            >
              <div className={styles.avatar} aria-hidden="true">
                {getInitials(msg.name)}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.senderName}>{msg.name}</span>
                  <span className={styles.senderEmail}>&lt;{msg.email}&gt;</span>
                </div>
                <div className={styles.cardSubject}>{msg.subject}</div>
                <div className={styles.cardSnippet}>{msg.message}</div>
              </div>

              <div className={styles.cardEnd}>
                <span className={styles.time}>{relativeTime(msg.createdAt)}</span>
                <span
                  className={`${styles.badge} ${
                    msg.status === "sent"
                      ? styles.badgeSent
                      : msg.status === "failed"
                      ? styles.badgeFailed
                      : styles.badgeSavedLocally
                  }`}
                >
                  {msg.status === "sent" ? (
                    <>
                      <LuCircleCheck aria-hidden="true" /> Delivered
                    </>
                  ) : msg.status === "failed" ? (
                    <>
                      <LuTriangleAlert aria-hidden="true" /> Failed
                    </>
                  ) : (
                    <>
                      <LuDatabase aria-hidden="true" /> Saved Locally
                    </>
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Forensic Inspection Drawer / Modal */}
      {selectedMessage && (
        <div
          className={styles.drawerOverlay}
          onClick={() => setSelectedMessage(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <header className={styles.drawerHeader}>
              <h2 id="drawer-title" className={styles.drawerTitle}>
                Inquiry Investigation
              </h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setSelectedMessage(null)}
                aria-label="Close details"
              >
                <LuX />
              </button>
            </header>

            <div className={styles.drawerBody}>
              {/* Sender & Metadata Overview */}
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Sender Name</span>
                  <span className={styles.metaValue}>{selectedMessage.name}</span>
                </div>

                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Sender Email</span>
                  <span className={styles.metaValue}>{selectedMessage.email}</span>
                </div>

                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Received At (Asia/Dhaka)</span>
                  <span className={styles.metaValue}>{formatFullDate(selectedMessage.createdAt)}</span>
                </div>

                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Client IP Address</span>
                  <span className={styles.metaValue}>{selectedMessage.ip || "unknown"}</span>
                </div>

                <div className={styles.metaItem} style={{ gridColumn: "1 / -1" }}>
                  <span className={styles.metaLabel}>User Agent (Browser / Device)</span>
                  <span className={styles.metaValue} style={{ fontSize: "0.8rem" }}>
                    {selectedMessage.userAgent || "unknown"}
                  </span>
                </div>

                <div className={styles.metaItem} style={{ gridColumn: "1 / -1" }}>
                  <span className={styles.metaLabel}>Delivery Status</span>
                  <span
                    className={`${styles.badge} ${
                      selectedMessage.status === "sent"
                        ? styles.badgeSent
                        : selectedMessage.status === "failed"
                        ? styles.badgeFailed
                        : styles.badgeSavedLocally
                    }`}
                    style={{ alignSelf: "flex-start", marginTop: "0.25rem" }}
                  >
                    {selectedMessage.status === "sent"
                      ? "Delivered via SMTP"
                      : selectedMessage.status === "failed"
                      ? "SMTP Delivery Failed"
                      : "Saved in MongoDB (Dev / SMTP Unconfigured)"}
                  </span>
                </div>
              </div>

              {/* Subject & Message Content */}
              <div className={styles.messageSection}>
                <span className={styles.sectionHeading}>Subject</span>
                <h3 className={styles.subjectTitle}>{selectedMessage.subject}</h3>

                <span className={styles.sectionHeading}>Message Body</span>
                <div className={styles.messageContent}>{selectedMessage.message}</div>
              </div>

              {/* Diagnostic error box if SMTP failed */}
              {selectedMessage.emailError && (
                <div className={styles.diagnosticsBox}>
                  <div className={styles.diagnosticsTitle}>
                    <LuTriangleAlert style={{ verticalAlign: "middle", marginRight: "0.35rem" }} />
                    Email Gateway Diagnostic Log
                  </div>
                  <div className={styles.diagnosticsContent}>{selectedMessage.emailError}</div>
                </div>
              )}
            </div>

            <footer className={styles.drawerFooter}>
              <button
                type="button"
                className={`${styles.actionButton} ${styles.btnDanger}`}
                onClick={() => handleDelete(selectedMessage)}
              >
                <LuTrash2 aria-hidden="true" />
                <span>Delete Inquiry</span>
              </button>

              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setSelectedMessage(null)}
              >
                <LuX aria-hidden="true" />
                <span>Cancel</span>
              </button>

              <a
                href={`mailto:${selectedMessage.email}?subject=Re:%20${encodeURIComponent(
                  selectedMessage.subject
                )}`}
                className={`${styles.actionButton} ${styles.btnPrimary}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LuSend aria-hidden="true" />
                <span>Reply via Email</span>
              </a>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
