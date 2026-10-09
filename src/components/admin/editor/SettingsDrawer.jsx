"use client";

import { useEffect, useMemo, useState } from "react";
import { LuCircleAlert, LuCircleCheck, LuTrash2, LuTriangleAlert, LuX } from "react-icons/lu";
import { slugify } from "@/lib/seo/slug.mjs";
import { adminFetch } from "../adminApi";
import admin from "../admin.module.css";
import styles from "./editor.module.css";

const SITE = "mahbub.dev";
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function walk(node, visit) {
  if (!node) return;
  visit(node);
  (node.content || []).forEach((child) => walk(child, visit));
}

/** Client-side mirror of the publish checks (lib/blog/validate.mjs) plus advice. */
export function seoChecklist(fields, words) {
  const items = [];
  const add = (level, text) => items.push({ level, text });
  const description = (fields.metaDescription || fields.excerpt || "").trim();
  const searchTitle = (fields.metaTitle || fields.title || "").trim();

  add(fields.title?.trim() ? "ok" : "error", fields.title?.trim() ? "Title set" : "Add a title");
  add(SLUG_RE.test(fields.slug || "") ? "ok" : "error", SLUG_RE.test(fields.slug || "") ? "Clean URL" : "Fix the URL slug");
  if (!description) add("error", "Add an excerpt or meta description");
  else if (description.length > 160) add("error", `Meta description is ${description.length}/160 characters`);
  else if (description.length < 70) add("warn", "Meta description is short (aim for 120–160)");
  else add("ok", `Meta description ${description.length}/160`);
  add(searchTitle.length <= 60 ? "ok" : "warn", searchTitle.length <= 60 ? "Search title fits" : `Search title is ${searchTitle.length} characters (about 60 show)`);

  let images = 0;
  let missingAlt = 0;
  let headings = 0;
  let skipped = false;
  let previous = 1;
  let internalLinks = 0;
  walk(fields.contentJson, (node) => {
    if (node.type === "figure") {
      images += 1;
      if (!node.attrs?.alt?.trim()) missingAlt += 1;
    }
    if (node.type === "gallery") {
      for (const image of node.attrs?.images || []) {
        images += 1;
        if (!image.alt?.trim()) missingAlt += 1;
      }
    }
    if (node.type === "heading") {
      headings += 1;
      const level = node.attrs?.level || 2;
      if (level > previous + 1) skipped = true;
      previous = level;
    }
    for (const mark of node.marks || []) {
      const href = mark.type === "link" ? mark.attrs?.href || "" : "";
      if (href.startsWith("/") || href.includes(`//${SITE}`)) internalLinks += 1;
    }
  });

  if (!fields.coverImage) add("warn", "No cover image (social cards use the site default)");
  else add(fields.coverImage.alt?.trim() ? "ok" : "error", fields.coverImage.alt?.trim() ? "Cover image has alt text" : "Cover image needs alt text");
  if (images) add(missingAlt ? "error" : "ok", missingAlt ? `${missingAlt} image${missingAlt > 1 ? "s" : ""} missing alt text` : `All ${images} images have alt text`);
  if (words > 300 && !headings) add("warn", "Break the post into sections with headings");
  if (skipped) add("warn", "A heading skips a level (e.g. H2 to H4)");
  add(words >= 300 ? "ok" : "warn", words >= 300 ? `${words} words` : `${words} words (300+ ranks better)`);
  add(internalLinks ? "ok" : "warn", internalLinks ? `${internalLinks} internal link${internalLinks > 1 ? "s" : ""}` : "Link to another page on the site");
  return items;
}

function Counter({ value, limit, warnAt }) {
  const length = (value || "").length;
  const cls = length > limit ? admin.counterError : warnAt && length > warnAt ? admin.counterWarn : "";
  return <span className={`${admin.counter} ${cls}`}>{length}/{limit}</span>;
}

function TagsInput({ value, onChange }) {
  const [draft, setDraft] = useState("");
  const [known, setKnown] = useState([]);
  useEffect(() => {
    adminFetch("/tags/").then((r) => setKnown(r.tags)).catch(() => {});
  }, []);
  const add = (raw) => {
    const tag = raw.trim().replace(/,$/, "").slice(0, 40);
    if (tag && !value.some((t) => t.toLowerCase() === tag.toLowerCase()) && value.length < 10) onChange([...value, tag]);
    setDraft("");
  };
  return (
    <div className={styles.chips}>
      {value.map((tag) => (
        <span key={tag} className={styles.chip}>
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
            <LuX />
          </button>
        </span>
      ))}
      <input
        className={styles.chipInput}
        list="known-tags"
        value={draft}
        placeholder={value.length ? "" : "Add topics…"}
        onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => draft && add(draft)}
        aria-label="Tags"
      />
      <datalist id="known-tags">
        {known.filter((t) => !value.includes(t)).map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </div>
  );
}

export default function SettingsDrawer({ id, fields, update, post, words, onClose, onDelete }) {
  const [slugInput, setSlugInput] = useState(fields.slug);
  const [slugState, setSlugState] = useState(null); // null | "checking" | "ok" | "taken" | "invalid"

  useEffect(() => setSlugInput(fields.slug), [fields.slug]);

  // Live availability check while typing a slug.
  useEffect(() => {
    if (slugInput === fields.slug) {
      setSlugState(null);
      return undefined;
    }
    if (!SLUG_RE.test(slugInput) || slugInput.length > 80) {
      setSlugState("invalid");
      return undefined;
    }
    setSlugState("checking");
    const timer = setTimeout(async () => {
      try {
        const r = await adminFetch(`/slug-check/?slug=${encodeURIComponent(slugInput)}&id=${id}`);
        setSlugState(r.available ? "ok" : r.reason === "taken" ? "taken" : "invalid");
        if (r.available) update({ slug: slugInput }, { manualSlug: true });
      } catch {
        setSlugState(null);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [slugInput, fields.slug, id, update]);

  const checklist = useMemo(() => seoChecklist(fields, words), [fields, words]);
  const searchTitle = fields.metaTitle || fields.title || "Untitled";
  const description = fields.metaDescription || fields.excerpt || "Add an excerpt or meta description to control this text.";
  const socialImage = fields.coverImage?.ogSrc || fields.coverImage?.src;

  return (
    <aside className={styles.drawer} aria-label="Post settings">
      <div className={styles.drawerHead}>
        <h2>Post settings</h2>
        <button type="button" className={admin.iconBtn} onClick={onClose} aria-label="Close settings">
          <LuX />
        </button>
      </div>

      <div className={admin.field}>
        <div className={admin.labelRow}>
          <label className={admin.label} htmlFor="slug">URL</label>
        </div>
        <input
          id="slug"
          className={`${admin.input} ${admin.mono} ${slugState === "invalid" || slugState === "taken" ? admin.inputError : ""}`}
          value={slugInput}
          onChange={(e) => setSlugInput(slugify(e.target.value.replace(/\s+/g, "-")) || e.target.value.toLowerCase())}
          spellCheck={false}
        />
        <span className={styles.urlPreview}>{SITE}/blog/{slugInput}/</span>
        {slugState === "taken" ? <span className={`${admin.hint} ${admin.hintError}`}>Another post uses this URL.</span> : null}
        {slugState === "invalid" ? <span className={`${admin.hint} ${admin.hintError}`}>Use lowercase letters, numbers and hyphens.</span> : null}
        {slugState === "ok" ? <span className={`${admin.hint} ${admin.hintOk}`}>Available</span> : null}
        {post.status !== "draft" ? <span className={admin.hint}>Changing a published URL keeps the old one redirecting here.</span> : null}
      </div>

      <div className={admin.field}>
        <div className={admin.labelRow}>
          <label className={admin.label} htmlFor="excerpt">Excerpt</label>
          <Counter value={fields.excerpt} limit={300} />
        </div>
        <textarea id="excerpt" className={admin.textarea} value={fields.excerpt} maxLength={300} onChange={(e) => update({ excerpt: e.target.value })} placeholder="One or two sentences shown under the title and on post cards." />
      </div>

      <div className={admin.field}>
        <span className={admin.label}>Tags</span>
        <TagsInput value={fields.tags} onChange={(tags) => update({ tags })} />
        <span className={admin.hint}>Up to 10. The first tag appears in the breadcrumb.</span>
      </div>

      <div className={admin.field}>
        <span className={admin.label}>Body font</span>
        <div className={admin.segment} role="group" aria-label="Body font">
          {[["sans", "Sans"], ["serif", "Serif"]].map(([value, label]) => (
            <button key={value} type="button" aria-pressed={fields.bodyFont === value} onClick={() => update({ bodyFont: value })}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <section className={styles.section}>
        <p className={styles.sectionTitle}>Search engines</p>
        <div className={admin.field}>
          <div className={admin.labelRow}>
            <label className={admin.label} htmlFor="metaTitle">Search title</label>
            <Counter value={fields.metaTitle || fields.title} limit={70} warnAt={60} />
          </div>
          <input id="metaTitle" className={admin.input} value={fields.metaTitle} maxLength={140} placeholder={fields.title || "Defaults to the title"} onChange={(e) => update({ metaTitle: e.target.value })} />
        </div>
        <div className={admin.field}>
          <div className={admin.labelRow}>
            <label className={admin.label} htmlFor="metaDescription">Meta description</label>
            <Counter value={fields.metaDescription || fields.excerpt} limit={160} warnAt={155} />
          </div>
          <textarea id="metaDescription" className={admin.textarea} value={fields.metaDescription} maxLength={320} placeholder={fields.excerpt || "Defaults to the excerpt"} onChange={(e) => update({ metaDescription: e.target.value })} />
        </div>
        <div className={styles.serp} aria-label="Google result preview">
          <div className={styles.serpSite}>
            <span className={styles.serpFavicon}>MA</span>
            <span>
              {SITE} › blog › {fields.slug}
            </span>
          </div>
          <span className={styles.serpTitle}>{searchTitle.length > 60 ? `${searchTitle.slice(0, 58)}…` : searchTitle} — Mahbub Alam</span>
          <span className={styles.serpDesc}>{description.length > 160 ? `${description.slice(0, 157)}…` : description}</span>
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionTitle}>Social card</p>
        <div className={styles.social}>
          {socialImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={socialImage} alt="" />
          ) : (
            <span className={styles.socialEmpty}>Add a cover image for a custom card</span>
          )}
          <div className={styles.socialBody}>
            <small>{SITE}</small>
            <strong>{searchTitle}</strong>
            <span>{description}</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionTitle}>SEO checklist</p>
        <ul className={styles.checklist}>
          {checklist.map((item) => (
            <li key={item.text} className={`${styles.check} ${item.level === "ok" ? styles.checkOk : item.level === "warn" ? styles.checkWarn : styles.checkError}`}>
              {item.level === "ok" ? <LuCircleCheck aria-label="OK" /> : item.level === "warn" ? <LuTriangleAlert aria-label="Advice" /> : <LuCircleAlert aria-label="Required" />}
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
        <span className={admin.hint}>Red items block publishing. Structured data, sitemap, RSS and the canonical tag are added automatically.</span>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionTitle}>Advanced</p>
        <div className={admin.field}>
          <label className={admin.label} htmlFor="canonical">Canonical URL</label>
          <input id="canonical" className={admin.input} value={fields.canonicalUrl || ""} placeholder={`https://${SITE}/blog/${fields.slug}/`} onChange={(e) => update({ canonicalUrl: e.target.value.trim() || null })} />
          <span className={admin.hint}>Only for posts first published elsewhere. Leave empty otherwise.</span>
        </div>
        <button type="button" className={`${admin.btn} ${admin.btnDanger}`} onClick={onDelete}>
          <LuTrash2 aria-hidden="true" /> Delete post
        </button>
      </section>
    </aside>
  );
}
