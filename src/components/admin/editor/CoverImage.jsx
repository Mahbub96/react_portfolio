"use client";

import { useRef, useState } from "react";
import { LuImagePlus, LuLoaderCircle, LuRefreshCw, LuTrash2 } from "react-icons/lu";
import { useAdminUI } from "../AdminUI";
import { ACCEPTED_TYPES, uploadImage } from "./imagePipeline";
import AiAssist from "./ai/AiAssist";
import admin from "../admin.module.css";
import styles from "./editor.module.css";

/** Feature image: shown at the top of the post and used for the social card. */
export default function CoverImage({ value, onChange }) {
  const { toast } = useAdminUI();
  const fileRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [dragging, setDragging] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    setProgress(0);
    try {
      const media = await uploadImage(file, { withOg: true, onProgress: setProgress });
      onChange({ ...media, alt: value?.alt || "", caption: value?.caption || "" });
    } catch (error) {
      if (error.status !== 401) toast(error.message, { type: "error" });
    }
    setProgress(null);
  };

  const picker = (
    <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
  );

  if (!value?.src) {
    return (
      <div className={styles.cover}>
        <button
          type="button"
          className={`${styles.coverDrop} ${dragging ? styles.coverDropActive : ""}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files?.[0]); }}
          disabled={progress !== null}
        >
          {progress !== null ? <LuLoaderCircle className={styles.spin} aria-hidden="true" /> : <LuImagePlus aria-hidden="true" />}
          {progress !== null ? `Uploading cover… ${progress}%` : "Add a cover image"}
        </button>
        {picker}
      </div>
    );
  }

  return (
    <div className={styles.cover}>
      <div className={styles.coverMedia}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value.src} alt={value.alt} width={value.width} height={value.height} />
        <div className={styles.coverActions}>
          <button type="button" className={`${admin.btn} ${admin.btnSmall}`} onClick={() => fileRef.current?.click()}>
            <LuRefreshCw aria-hidden="true" /> Replace
          </button>
          <button type="button" className={`${admin.btn} ${admin.btnSmall}`} onClick={() => onChange(null)} aria-label="Remove cover image">
            <LuTrash2 aria-hidden="true" />
          </button>
        </div>
        {progress !== null ? (
          <div className={styles.uploading}>
            <LuLoaderCircle className={styles.spin} aria-hidden="true" /> Uploading… {progress}%
          </div>
        ) : null}
      </div>
      <div className={styles.coverFields}>
        <div className={styles.altWithAi}>
          <input
            className={`${admin.input} ${!value.alt ? admin.inputError : ""}`}
            value={value.alt || ""}
            maxLength={300}
            placeholder="Alt text (required)"
            aria-label="Cover image alt text"
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
          />
          <AiAssist target="coverAlt" label="cover alt text" align="start" onAccept={(alt) => onChange({ ...value, alt })} />
        </div>
        <input
          className={admin.input}
          value={value.caption || ""}
          maxLength={500}
          placeholder="Caption (optional)"
          aria-label="Cover image caption"
          onChange={(e) => onChange({ ...value, caption: e.target.value })}
        />
      </div>
      {picker}
    </div>
  );
}
