"use client";

import { LuPencil, LuPlus } from "react-icons/lu";
import { useDataContext } from "@/contexts/useAllContext";
import styles from "./ownerBar.module.css";

/**
 * Shortcuts into the blog admin, shown only to the signed-in owner. Renders
 * nothing on the server and for visitors (auth is only known after the
 * client checks the session), so it never affects indexed HTML.
 */
export default function OwnerBar({ slug }) {
  const { auth, isLoaded } = useDataContext();
  if (!isLoaded || !auth) return null;
  return (
    <div className={styles.bar} role="toolbar" aria-label="Blog admin shortcuts">
      {slug ? (
        <a href={`/admin/edit/${slug}/`} className={styles.action}>
          <LuPencil aria-hidden="true" /> Edit this post
        </a>
      ) : null}
      <a href="/admin/posts/new/" className={`${styles.action} ${styles.primary}`}>
        <LuPlus aria-hidden="true" /> New post
      </a>
      <a href="/admin/posts/" className={styles.action}>
        All posts
      </a>
    </div>
  );
}
