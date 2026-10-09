"use client";

import { useState } from "react";
import { LuLoaderCircle, LuLock } from "react-icons/lu";
import { useDataContext } from "@/contexts/useAllContext";
import styles from "./admin.module.css";

export default function LoginForm({ next }) {
  const { login } = useDataContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        login(data.userRole || "admin", data.expiresAt);
        window.location.assign(next);
        return;
      }
      setError(
        response.status === 429
          ? "Too many attempts. Try again in a few minutes."
          : data.remainingAttempts !== undefined
            ? `Invalid credentials. ${data.remainingAttempts} attempts left.`
            : data.message || "Sign-in failed."
      );
    } catch {
      setError("Network error. Check your connection.");
    }
    setBusy(false);
  };

  return (
    <main className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div>
          <span className={styles.emptyIcon} aria-hidden="true">
            <LuLock />
          </span>
        </div>
        <div>
          <h1>Sign in to write</h1>
          <p className={styles.pageSub}>Admin access for mahbub.dev.</p>
        </div>
        <form onSubmit={submit}>
          <label className={styles.field}>
            <span className={styles.label}>Username</span>
            <input className={styles.input} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <input className={styles.input} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error ? (
            <p className={`${styles.hint} ${styles.hintError}`} role="alert">
              {error}
            </p>
          ) : null}
          <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={busy}>
            {busy ? <LuLoaderCircle className={styles.spin} aria-hidden="true" /> : null}
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
