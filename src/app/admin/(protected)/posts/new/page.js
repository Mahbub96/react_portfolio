"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuArrowLeft, LuLoaderCircle } from "react-icons/lu";
import { adminFetch } from "@/components/admin/adminApi";
import admin from "@/components/admin/admin.module.css";

export default function NewPostPage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    adminFetch("/posts/", { method: "POST", body: {} })
      .then(({ post }) => {
        if (active && post?.id) {
          router.replace(`/admin/posts/${post.id}/`);
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not create draft");
      });
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--background-primary)" }}>
      <div style={{ textAlign: "center", display: "grid", gap: "1rem", placeItems: "center" }}>
        {error ? (
          <div>
            <p style={{ color: "var(--accent-error)", marginBottom: "1rem" }}>{error}</p>
            <button
              type="button"
              className={`${admin.btn} ${admin.btnPrimary}`}
              onClick={() => router.push("/admin/posts/")}
            >
              <LuArrowLeft /> Back to Posts
            </button>
          </div>
        ) : (
          <>
            <LuLoaderCircle className={admin.spin} style={{ fontSize: "2.2rem", color: "var(--accent-primary)" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0 }}>Creating new draft…</p>
          </>
        )}
      </div>
    </div>
  );
}
