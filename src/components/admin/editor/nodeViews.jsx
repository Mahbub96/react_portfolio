"use client";

import { useRef, useState } from "react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { LuImagePlus, LuLoaderCircle, LuPlay, LuRefreshCw, LuTrash2, LuTriangleAlert, LuX } from "react-icons/lu";
import { CODE_LANGUAGES } from "@/lib/blog/codeLanguages.mjs";
import { useAdminUI } from "../AdminUI";
import { ACCEPTED_TYPES, uploadImage } from "./imagePipeline";
import styles from "./editor.module.css";

const LAYOUTS = [
  ["inline", "Inline"],
  ["wide", "Wide"],
  ["full", "Full"],
  ["float-left", "Left"],
  ["float-right", "Right"],
];

const srcSetOf = (image) =>
  (image.variants || []).length > 1
    ? [...image.variants].sort((a, b) => a.width - b.width).map((v) => `${v.src} ${v.width}w`).join(", ")
    : undefined;

function useUpload() {
  const { toast } = useAdminUI();
  const [progress, setProgress] = useState(null);
  const run = async (file, options) => {
    setProgress(0);
    try {
      return await uploadImage(file, { ...options, onProgress: setProgress });
    } catch (error) {
      if (error.status !== 401) toast(error.message, { type: "error" });
      return null;
    } finally {
      setProgress(null);
    }
  };
  return [progress, run];
}

function Uploading({ progress }) {
  return progress === null ? null : (
    <div className={styles.uploading} contentEditable={false}>
      <LuLoaderCircle className={styles.spin} aria-hidden="true" />
      <span>Uploading… {progress}%</span>
    </div>
  );
}

/* Image ------------------------------------------------------------------------ */

export function FigureView({ node, updateAttributes, deleteNode, selected }) {
  const { src, alt, caption, layout, width, height } = node.attrs;
  const [editingAlt, setEditingAlt] = useState(false);
  const [progress, upload] = useUpload();
  const fileRef = useRef(null);

  const replace = async (file) => {
    const media = await upload(file);
    if (media) updateAttributes({ ...media });
  };

  return (
    <NodeViewWrapper className={`${styles.node} ${selected ? styles.selected : ""}`} data-drag-handle>
      <div className={styles.media}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} srcSet={srcSetOf(node.attrs)} sizes="(min-width: 1100px) 1040px, 100vw" alt={alt} width={width || undefined} height={height || undefined} draggable={false} />
        <Uploading progress={progress} />
        {!alt ? (
          <button type="button" className={styles.altBadge} contentEditable={false} onClick={() => setEditingAlt(true)}>
            <LuTriangleAlert aria-hidden="true" /> Alt text missing
          </button>
        ) : null}
        {selected ? (
          <div className={styles.nodeToolbar} contentEditable={false}>
            <div className={styles.toolbarGroup} role="group" aria-label="Image layout">
              {LAYOUTS.map(([value, label]) => (
                <button key={value} type="button" aria-pressed={layout === value} onClick={() => updateAttributes({ layout: value })}>
                  {label}
                </button>
              ))}
            </div>
            <span className={styles.toolbarDivider} />
            <button type="button" aria-pressed={editingAlt} onClick={() => setEditingAlt((v) => !v)} title="Alternative text">
              Alt
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} title="Replace image" aria-label="Replace image">
              <LuRefreshCw />
            </button>
            <button type="button" onClick={deleteNode} title="Remove image" aria-label="Remove image">
              <LuTrash2 />
            </button>
          </div>
        ) : null}
      </div>
      {editingAlt || !alt ? (
        <label className={styles.altRow} contentEditable={false}>
          <span>Alt text</span>
          <input
            className={!alt ? styles.inputMissing : undefined}
            value={alt}
            placeholder="Describe the image for screen readers and search engines"
            onChange={(e) => updateAttributes({ alt: e.target.value })}
            maxLength={300}
          />
        </label>
      ) : null}
      <input
        className={styles.caption}
        contentEditable={false}
        value={caption}
        placeholder="Add a caption (optional)"
        onChange={(e) => updateAttributes({ caption: e.target.value })}
        maxLength={500}
        aria-label="Caption"
      />
      <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} hidden onChange={(e) => e.target.files?.[0] && replace(e.target.files[0])} />
    </NodeViewWrapper>
  );
}

/* Gallery ------------------------------------------------------------------------ */

export function GalleryView({ node, updateAttributes, deleteNode, selected }) {
  const { images = [], columns, caption } = node.attrs;
  const [progress, upload] = useUpload();
  const fileRef = useRef(null);

  const add = async (files) => {
    let next = [...images];
    for (const file of [...files].slice(0, 9 - next.length)) {
      const media = await upload(file);
      if (media) {
        next = [...next, { ...media, alt: "" }];
        updateAttributes({ images: next });
      }
    }
  };
  const update = (index, patch) => updateAttributes({ images: images.map((img, i) => (i === index ? { ...img, ...patch } : img)) });
  const remove = (index) => updateAttributes({ images: images.filter((_, i) => i !== index) });

  return (
    <NodeViewWrapper className={`${styles.node} ${selected ? styles.selected : ""}`} data-drag-handle>
      {selected ? (
        <div className={`${styles.nodeToolbar} ${styles.nodeToolbarStatic}`} contentEditable={false}>
          <div className={styles.toolbarGroup} role="group" aria-label="Columns">
            {[2, 3].map((n) => (
              <button key={n} type="button" aria-pressed={columns === n} onClick={() => updateAttributes({ columns: n })}>
                {n} columns
              </button>
            ))}
          </div>
          <span className={styles.toolbarDivider} />
          <button type="button" onClick={deleteNode} title="Remove gallery" aria-label="Remove gallery">
            <LuTrash2 />
          </button>
        </div>
      ) : null}
      <div className="gallery-grid" contentEditable={false}>
        {images.map((image, index) => (
          <div key={`${image.src}-${index}`} className={`gallery-item ${styles.galleryItem}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} srcSet={srcSetOf(image)} sizes="340px" alt={image.alt} draggable={false} />
            <button type="button" className={styles.galleryRemove} onClick={() => remove(index)} aria-label="Remove image">
              <LuX />
            </button>
            <input
              className={`${styles.galleryAlt} ${!image.alt ? styles.inputMissing : ""}`}
              value={image.alt || ""}
              placeholder="Alt text (required)"
              onChange={(e) => update(index, { alt: e.target.value })}
              maxLength={300}
            />
          </div>
        ))}
        {images.length < 9 ? (
          <button type="button" className={styles.galleryAdd} onClick={() => fileRef.current?.click()}>
            <LuImagePlus aria-hidden="true" />
            <span>{images.length ? "Add images" : "Add 2–9 images"}</span>
          </button>
        ) : null}
      </div>
      <Uploading progress={progress} />
      <input
        className={styles.caption}
        contentEditable={false}
        value={caption}
        placeholder="Add a caption (optional)"
        onChange={(e) => updateAttributes({ caption: e.target.value })}
        aria-label="Gallery caption"
      />
      <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} multiple hidden onChange={(e) => e.target.files?.length && add(e.target.files)} />
    </NodeViewWrapper>
  );
}

/* Callout --------------------------------------------------------------------------- */

const CALLOUTS = [
  ["info", "Info"],
  ["success", "Tip"],
  ["warning", "Warning"],
  ["note", "Note"],
];

export function CalloutView({ node, updateAttributes }) {
  return (
    <NodeViewWrapper className={styles.calloutWrap}>
      <div className={styles.calloutPicker} contentEditable={false} role="group" aria-label="Callout style">
        {CALLOUTS.map(([value, label]) => (
          <button key={value} type="button" aria-pressed={node.attrs.variant === value} onClick={() => updateAttributes({ variant: value })}>
            {label}
          </button>
        ))}
      </div>
      <NodeViewContent className={styles.calloutContent} />
    </NodeViewWrapper>
  );
}

/* YouTube ---------------------------------------------------------------------------- */

export function YouTubeView({ node, deleteNode, selected }) {
  const { videoId, title, thumbSrc } = node.attrs;
  return (
    <NodeViewWrapper className={`${styles.node} ${selected ? styles.selected : ""}`} data-drag-handle>
      <div className="embed-link" contentEditable={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {thumbSrc ? <img src={thumbSrc} alt="" draggable={false} /> : null}
        <span className="embed-play" aria-hidden="true" />
        <span className="embed-title">
          <LuPlay aria-hidden="true" /> {title || `YouTube video ${videoId}`}
        </span>
      </div>
      {selected ? (
        <div className={styles.nodeToolbar} contentEditable={false}>
          <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">
            Open on YouTube
          </a>
          <span className={styles.toolbarDivider} />
          <button type="button" onClick={deleteNode} aria-label="Remove video" title="Remove video">
            <LuTrash2 />
          </button>
        </div>
      ) : null}
    </NodeViewWrapper>
  );
}

/* Code -------------------------------------------------------------------------------- */

export function CodeBlockView({ node, updateAttributes }) {
  return (
    <NodeViewWrapper className={styles.codeWrap}>
      <select
        className={styles.langSelect}
        contentEditable={false}
        value={node.attrs.language || "plaintext"}
        onChange={(e) => updateAttributes({ language: e.target.value })}
        aria-label="Code language"
      >
        {CODE_LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.label}
          </option>
        ))}
      </select>
      <NodeViewContent as="code" />
    </NodeViewWrapper>
  );
}
