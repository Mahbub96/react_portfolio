"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LuArrowLeft,
  LuCalendarClock,
  LuChevronDown,
  LuCloudOff,
  LuEye,
  LuLoaderCircle,
  LuSettings2,
} from "react-icons/lu";
import { slugify } from "@/lib/seo/slug.mjs";
import { adminFetch } from "../adminApi";
import { useAdminUI } from "../AdminUI";
import { shortDate } from "../PostsDashboard";
import BlockEditor from "./BlockEditor";
import CoverImage from "./CoverImage";
import SettingsDrawer, { seoChecklist } from "./SettingsDrawer";
import AiAssist from "./ai/AiAssist";
import { AiProvider } from "./ai/AiContext";
import { clearBackup, readBackup, useAutosave } from "./useAutosave";
import admin from "../admin.module.css";
import styles from "./editor.module.css";

const FIELDS = ["title", "slug", "excerpt", "metaTitle", "metaDescription", "canonicalUrl", "coverImage", "tags", "bodyFont", "contentJson"];
const pick = (post) => Object.fromEntries(FIELDS.map((key) => [key, post[key] ?? (key === "tags" ? [] : key === "canonicalUrl" || key === "coverImage" ? null : "")]));

/** datetime-local value in the browser's timezone. */
const toLocalInput = (date) => {
  const d = new Date(date);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function autosize(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export default function EditorScreen({ id }) {
  const router = useRouter();
  const { toast, confirm } = useAdminUI();
  const [post, setPost] = useState(null);
  const [fields, setFields] = useState(null);
  const [words, setWords] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [issues, setIssues] = useState(null);
  const [backup, setBackup] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const fieldsRef = useRef(null);
  const autoSlug = useRef(false);
  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const excerptRef = useRef(null);

  const onSaved = useCallback((result) => {
    // The server may have adjusted an auto-generated slug (e.g. "-2").
    if (result.slug && fieldsRef.current && result.slug !== fieldsRef.current.slug) {
      fieldsRef.current = { ...fieldsRef.current, slug: result.slug };
      setFields(fieldsRef.current);
    }
    setPost((p) => ({
      ...p,
      version: result.version,
      updatedAt: result.updatedAt,
      slug: result.slug,
      previousSlugs: result.previousSlugs,
      hasUnpublishedChanges: p.status !== "draft",
    }));
  }, []);

  const onSaveError = useCallback(
    (error, keys) => {
      if (error.body?.details?.field === "slug" || keys.includes("slug")) {
        toast(error.message, { type: "error" });
      } else {
        toast(`Could not save: ${error.message}`, { type: "error" });
      }
    },
    [toast]
  );

  const autoSlugBody = useCallback((keys) => (keys.includes("slug") && autoSlug.current ? { autoSlug: true } : {}), []);
  const autosave = useAutosave({ id, version: post?.version, onSaved, onError: onSaveError, extraBody: autoSlugBody });
  const { change, flush } = autosave;

  // Load the post (and offer a newer local backup if one exists).
  useEffect(() => {
    let cancelled = false;
    adminFetch(`/posts/${id}/`)
      .then(({ post: loaded }) => {
        if (cancelled) return;
        const initial = pick(loaded);
        setPost(loaded);
        setFields(initial);
        fieldsRef.current = initial;
        // The URL follows the title until the post is published or the slug is edited by hand.
        autoSlug.current =
          loaded.status === "draft" && (!loaded.title || loaded.slug === slugify(loaded.title) || /^(untitled|post-)/.test(loaded.slug));
        const saved = readBackup(id);
        if (saved?.fields && saved.at > Date.parse(loaded.updatedAt) + 1000 && JSON.stringify(saved.fields) !== JSON.stringify(initial)) {
          setBackup(saved);
        } else if (saved) {
          clearBackup(id);
        }
      })
      .catch((error) => !cancelled && error.status !== 401 && setLoadError(error.message));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const update = useCallback(
    (patch, { manualSlug = false } = {}) => {
      const next = { ...fieldsRef.current, ...patch };
      const changed = { ...patch };
      if (manualSlug) autoSlug.current = false;
      if (patch.title !== undefined && autoSlug.current) {
        const slug = slugify(patch.title);
        if (slug && slug !== next.slug) {
          next.slug = slug;
          changed.slug = slug;
        }
      }
      fieldsRef.current = next;
      setFields(next);
      change(changed, next);
    },
    [change]
  );

  useEffect(() => {
    autosize(titleRef.current);
    autosize(excerptRef.current);
  }, [fields?.title, fields?.excerpt]);

  // Cmd/Ctrl+S saves immediately.
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        flush();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flush]);

  const restoreBackup = () => {
    const restored = backup.fields;
    editorRef.current?.editor?.commands.setContent(restored.contentJson, { emitUpdate: false });
    update(restored);
    setBackup(null);
  };

  const preview = async () => {
    const tab = window.open("about:blank", "_blank");
    await flush();
    if (tab) tab.location.href = `/admin/preview/${id}/`;
  };

  const publish = async ({ publishedAt } = {}) => {
    setBusy(true);
    setIssues(null);
    try {
      if (!(await flush())) {
        toast("Save your changes first (see the status in the top bar).", { type: "error" });
        return;
      }
      const result = await adminFetch(`/posts/${id}/publish/`, { method: "POST", body: publishedAt ? { publishedAt } : {} });
      setPost(result.post);
      setPublishOpen(false);
      if (result.warnings?.length) setIssues({ errors: [], warnings: result.warnings });
      const verb = result.post.status === "scheduled" ? `Scheduled for ${shortDate(result.post.publishedAt)}` : post.status === "draft" ? "Published" : "Updated";
      toast(verb, result.post.status === "published" ? { href: `/blog/${result.post.slug}/`, linkLabel: "View post" } : {});
    } catch (error) {
      if (error.status === 422 && error.body?.details?.errors) {
        setIssues(error.body.details);
        setPublishOpen(false);
      } else if (error.status !== 401) {
        toast(error.message, { type: "error" });
      }
    } finally {
      setBusy(false);
    }
  };

  const unpublish = async () => {
    const ok = await confirm({
      title: "Unpublish this post?",
      body: "It goes back to draft and its URL returns 404 until you publish again. Search engines are notified.",
      confirmLabel: "Unpublish",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      const result = await adminFetch(`/posts/${id}/unpublish/`, { method: "POST" });
      setPost(result.post);
      setPublishOpen(false);
      toast("Unpublished; the post is a draft again");
    } catch (error) {
      if (error.status !== 401) toast(error.message, { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const ok = await confirm({ title: "Delete this post?", body: "This cannot be undone.", confirmLabel: "Delete post", danger: true });
    if (!ok) return;
    try {
      await adminFetch(`/posts/${id}/`, { method: "DELETE" });
      clearBackup(id);
      toast("Post deleted");
      router.replace("/admin/posts/");
    } catch (error) {
      if (error.status !== 401) toast(error.message, { type: "error" });
    }
  };

  // Every field the AI may use as context, by name.
  const aiContext = useCallback(() => {
    const f = fieldsRef.current || {};
    return {
      fields: {
        title: f.title || "",
        excerpt: f.excerpt || "",
        slug: f.slug || "",
        tags: f.tags || [],
        metaTitle: f.metaTitle || "",
        metaDescription: f.metaDescription || "",
        coverAlt: f.coverImage?.alt || "",
        coverCaption: f.coverImage?.caption || "",
        contentJson: f.contentJson || undefined,
      },
    };
  }, []);

  if (loadError) {
    return (
      <main className={admin.main}>
        <div className={`${admin.notice} ${admin.noticeError}`}>
          {loadError} <Link href="/admin/posts/">Back to posts</Link>
        </div>
      </main>
    );
  }

  if (!post || !fields) {
    return (
      <div className={styles.screen}>
        <div className={styles.bar} />
        <p className={styles.editorLoading} style={{ marginTop: "3rem" }}>
          Loading…
        </p>
      </div>
    );
  }

  const { status, savedAt } = autosave;
  // Publish errors stay listed only while the live checklist still fails.
  const blocking = issues?.errors?.length ? seoChecklist(fields, words).filter((item) => item.level === "error") : [];
  const showErrors = issues?.errors?.length > 0 && blocking.length > 0;
  const isLive = post.status !== "draft";
  const statusText = {
    saving: "Saving…",
    dirty: "Unsaved changes",
    offline: "Offline: changes are kept on this device",
    error: "Not saved",
    conflict: "Changed in another tab",
    saved: savedAt ? `Saved ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Saved",
  }[status];
  const postState =
    post.status === "draft" ? "Draft" : post.status === "scheduled" ? `Scheduled · ${shortDate(post.publishedAt)}` : post.hasUnpublishedChanges ? "Published · unpublished changes" : "Published";

  return (
    <AiProvider getContext={aiContext}>
    <div className={styles.screen}>
      <header className={styles.bar}>
        <Link href="/admin/posts/" className={admin.iconBtn} aria-label="Back to posts" title="Back to posts">
          <LuArrowLeft />
        </Link>
        <div className={styles.barStatus} aria-live="polite">
          {status === "saving" ? (
            <LuLoaderCircle className={styles.spin} aria-hidden="true" />
          ) : status === "offline" ? (
            <LuCloudOff aria-hidden="true" />
          ) : (
            <span className={`${styles.statusDot} ${status === "dirty" ? styles.statusDotDirty : ""} ${["error", "conflict"].includes(status) ? styles.statusDotError : ""}`} />
          )}
          <span>{postState}</span>
          <span className={styles.hideNarrow}>· {statusText}</span>
        </div>
        <div className={styles.barEnd}>
          <span className={styles.words}>{words} words · {Math.max(1, Math.round(words / 220))} min</span>
          <button type="button" className={`${admin.btn} ${admin.btnGhost} ${admin.btnSmall}`} onClick={preview}>
            <LuEye aria-hidden="true" /> <span className={styles.hideNarrow}>Preview</span>
          </button>
          <button type="button" className={`${admin.iconBtn} ${drawer ? admin.iconBtnActive : ""}`} onClick={() => setDrawer((d) => !d)} aria-label="Post settings" aria-expanded={drawer} title="Post settings">
            <LuSettings2 />
          </button>
          <div className={styles.publishWrap}>
            <button type="button" className={`${admin.btn} ${admin.btnPrimary} ${admin.btnSmall}`} onClick={() => { setScheduleAt(post.publishedAt ? toLocalInput(post.publishedAt) : ""); setPublishOpen((o) => !o); }} aria-expanded={publishOpen} disabled={busy}>
              {busy ? <LuLoaderCircle className={styles.spin} aria-hidden="true" /> : null}
              {isLive ? "Update" : "Publish"} <LuChevronDown aria-hidden="true" />
            </button>
            {publishOpen ? (
              <div className={styles.popover} role="dialog" aria-label="Publish options">
                <h3>{isLive ? "Update the live post" : "Ready to publish?"}</h3>
                <p>
                  {isLive
                    ? "Readers will see your latest changes. The publish date stays the same unless you change it below."
                    : `It goes live at /blog/${fields.slug}/ with its SEO tags, and search engines are notified.`}
                </p>
                <button type="button" className={`${admin.btn} ${admin.btnPrimary}`} onClick={() => publish()} disabled={busy}>
                  {isLive ? "Update now" : "Publish now"}
                </button>
                <label className={admin.field}>
                  <span className={admin.label}>
                    <LuCalendarClock aria-hidden="true" /> {isLive ? "Change publish date" : "Or schedule for"}
                  </span>
                  <input className={admin.input} type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
                </label>
                <button type="button" className={admin.btn} disabled={!scheduleAt || busy} onClick={() => publish({ publishedAt: new Date(scheduleAt).toISOString() })}>
                  {new Date(scheduleAt) > new Date() ? "Schedule" : "Publish with this date"}
                </button>
                {isLive ? (
                  <button type="button" className={`${admin.btn} ${admin.btnDanger}`} onClick={unpublish} disabled={busy}>
                    Unpublish
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {backup || status === "conflict" || showErrors || issues?.warnings?.length ? (
        <div className={styles.notices}>
          {backup ? (
            <div className={`${admin.notice} ${admin.noticeInfo}`}>
              <span>Unsaved changes from {new Date(backup.at).toLocaleString()} were found on this device.</span>
              <button type="button" className={`${admin.btn} ${admin.btnSmall}`} onClick={restoreBackup}>Restore</button>
              <button type="button" className={`${admin.btn} ${admin.btnGhost} ${admin.btnSmall}`} onClick={() => { clearBackup(id); setBackup(null); }}>Discard</button>
            </div>
          ) : null}
          {status === "conflict" ? (
            <div className={`${admin.notice} ${admin.noticeError}`}>
              <span>This post was saved from another tab or device. Your changes here are kept on this device.</span>
              <button type="button" className={`${admin.btn} ${admin.btnSmall}`} onClick={() => window.location.reload()}>Reload latest</button>
            </div>
          ) : null}
          {showErrors ? (
            <div className={`${admin.notice} ${admin.noticeError}`} role="alert">
              <div>
                <strong>Fix these before publishing:</strong>
                <ul className={styles.issueList}>{blocking.map((e) => <li key={e.text}>{e.text}</li>)}</ul>
              </div>
              <button type="button" className={`${admin.btn} ${admin.btnSmall}`} onClick={() => setDrawer(true)}>Open settings</button>
            </div>
          ) : null}
          {issues?.warnings?.length && !issues?.errors?.length ? (
            <div className={admin.notice}>
              <div>
                <strong>Published. Suggestions:</strong>
                <ul className={styles.issueList}>{issues.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
              </div>
              <button type="button" className={`${admin.btn} ${admin.btnGhost} ${admin.btnSmall}`} onClick={() => setIssues(null)}>Dismiss</button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={styles.workspace}>
        <main className={styles.document}>
          <CoverImage value={fields.coverImage} onChange={(coverImage) => update({ coverImage })} />
          <div className={styles.docHead}>
            <div className={styles.fieldRow}>
              <textarea
                ref={titleRef}
                className={styles.title}
                rows={1}
                value={fields.title}
                placeholder="Post title"
                maxLength={200}
                aria-label="Title"
                onChange={(e) => update({ title: e.target.value.replace(/\n/g, " ") })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    excerptRef.current?.focus();
                  }
                }}
              />
              <AiAssist target="title" label="title" onAccept={(title) => update({ title })} />
            </div>
            <div className={styles.fieldRow}>
              <textarea
                ref={excerptRef}
                className={styles.excerptInline}
                rows={1}
                value={fields.excerpt}
                placeholder="Short summary (shown under the title and in search results)"
                maxLength={300}
                aria-label="Excerpt"
                onChange={(e) => update({ excerpt: e.target.value.replace(/\n/g, " ") })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    editorRef.current?.focusStart();
                  }
                }}
              />
              <AiAssist target="excerpt" label="excerpt" onAccept={(excerpt) => update({ excerpt })} />
            </div>
          </div>
          <BlockEditor
            ref={editorRef}
            content={fields.contentJson}
            bodyFont={fields.bodyFont}
            onChange={(contentJson) => update({ contentJson })}
            onStats={({ words: count }) => setWords(count)}
          />
        </main>
        {drawer ? (
          <SettingsDrawer id={id} fields={fields} update={update} post={post} words={words} onClose={() => setDrawer(false)} onDelete={remove} />
        ) : null}
      </div>
    </div>
    </AiProvider>
  );
}
