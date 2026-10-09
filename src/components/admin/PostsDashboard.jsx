"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LuExternalLink, LuFileText, LuImage, LuLoaderCircle, LuPencil, LuPlus, LuSearch, LuTrash2 } from "react-icons/lu";
import { adminFetch } from "./adminApi";
import { useAdminUI } from "./AdminUI";
import styles from "./admin.module.css";

const TABS = [
  ["all", "All"],
  ["draft", "Drafts"],
  ["scheduled", "Scheduled"],
  ["published", "Published"],
];

const STATUS_CLASS = { published: styles.statusPublished, scheduled: styles.statusScheduled };

export function relativeTime(iso) {
  if (!iso) return "";
  const seconds = Math.round((Date.now() - Date.parse(iso)) / 1000);
  const abs = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]]) {
    if (abs >= size) return rtf.format(-Math.round(seconds / size), unit);
  }
  return "just now";
}

export const shortDate = (iso) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka" }) : "";

export default function PostsDashboard() {
  const router = useRouter();
  const { toast, confirm } = useAdminUI();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await adminFetch("/posts/"));
    } catch (error) {
      if (error.status !== 401) toast(error.message, { type: "error" });
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.items || []).filter(
      (item) => (tab === "all" || item.status === tab) && (!q || `${item.title} ${item.slug}`.toLowerCase().includes(q))
    );
  }, [data, tab, query]);

  const createPost = async () => {
    setCreating(true);
    try {
      const { post } = await adminFetch("/posts/", { method: "POST", body: {} });
      router.push(`/admin/posts/${post.id}/`);
    } catch (error) {
      toast(error.message, { type: "error" });
      setCreating(false);
    }
  };

  const remove = async (item) => {
    const ok = await confirm({
      title: `Delete "${item.title || "Untitled"}"?`,
      body: item.status === "draft" ? "The draft and its history are removed permanently." : "The post is taken offline and removed permanently. Its URL will return 404.",
      confirmLabel: "Delete post",
      danger: true,
    });
    if (!ok) return;
    try {
      await adminFetch(`/posts/${item.id}/`, { method: "DELETE" });
      toast("Post deleted");
      load();
    } catch (error) {
      toast(error.message, { type: "error" });
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Posts</h1>
          <p className={styles.pageSub}>Write, schedule and publish articles for the blog.</p>
        </div>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={createPost} disabled={creating}>
          {creating ? <LuLoaderCircle className={styles.spin} aria-hidden="true" /> : <LuPlus aria-hidden="true" />}
          New post
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="Filter posts">
          {TABS.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={styles.tab} onClick={() => setTab(id)}>
              {label}
              <span className={styles.tabCount}>{data ? data.counts[id] : "–"}</span>
            </button>
          ))}
        </div>
        <label className={styles.search}>
          <LuSearch aria-hidden="true" />
          <input className={styles.input} type="search" placeholder="Search posts" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search posts" />
        </label>
      </div>

      {!data ? (
        <ul className={styles.list} aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className={styles.skeleton} />
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">
            <LuFileText />
          </span>
          <h2>{data.counts.all ? "No posts match" : "Write your first post"}</h2>
          <p>{data.counts.all ? "Try another filter or search." : "Drafts are private until you publish them. Every post gets its SEO tags automatically."}</p>
          {data.counts.all ? null : (
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={createPost} disabled={creating}>
              <LuPlus aria-hidden="true" /> New post
            </button>
          )}
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.row}>
              <div className={styles.thumb}>
                {item.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverImage.src} alt="" loading="lazy" />
                ) : (
                  <span className={styles.thumbEmpty}>
                    <LuImage aria-hidden="true" />
                  </span>
                )}
              </div>
              <div className={styles.rowMain}>
                <Link href={`/admin/posts/${item.id}/`} className={`${styles.rowTitle} ${item.title ? "" : styles.rowTitleEmpty}`}>
                  {item.title || "Untitled"}
                </Link>
                <div className={styles.rowMeta}>
                  <span className={`${styles.status} ${STATUS_CLASS[item.status] || ""}`}>
                    {item.status === "draft" ? "Draft" : item.status === "scheduled" ? "Scheduled" : "Published"}
                  </span>
                  {item.hasUnpublishedChanges ? <span className={styles.statusChanged}>Unpublished changes</span> : null}
                  <span className={styles.mono}>/blog/{item.slug}/</span>
                  <span title={shortDate(item.updatedAt)}>Edited {relativeTime(item.updatedAt)}</span>
                  {item.publishedAt ? <span>{item.status === "scheduled" ? "Goes live" : "Published"} {shortDate(item.publishedAt)}</span> : null}
                </div>
              </div>
              <div className={styles.rowActions}>
                <Link href={`/admin/posts/${item.id}/`} className={styles.iconBtn} aria-label={`Edit ${item.title || "post"}`} title="Edit">
                  <LuPencil />
                </Link>
                {item.status === "published" ? (
                  <a href={`/blog/${item.slug}/`} target="_blank" rel="noopener noreferrer" className={styles.iconBtn} aria-label="View live post" title="View live">
                    <LuExternalLink />
                  </a>
                ) : null}
                <button type="button" className={styles.iconBtn} onClick={() => remove(item)} aria-label={`Delete ${item.title || "post"}`} title="Delete">
                  <LuTrash2 />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
