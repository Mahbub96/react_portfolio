"use client";
import React, { useState } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import styles from "./loginModal.module.css";

function LoginModal({ show, onHide }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useDataContex();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Simple authentication with admin/admin credentials
      if (username === "admin" && password === "admin") {
        // Store authentication in database for tracking
        await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            timestamp: new Date().toISOString(),
            userAgent:
              typeof navigator !== "undefined"
                ? navigator.userAgent
                : "unknown",
            ip: "unknown", // In production, this would come from server-side
          }),
        });

        login();
        onHide();
        setUsername("");
        setPassword("");
      } else {
        setError("Invalid credentials. Use admin/admin");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onHide}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Admin Login</h2>
          <button className={styles.closeButton} onClick={onHide}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              disabled={isLoading}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin"
              required
              disabled={isLoading}
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <div className={styles.helpText}>
            <small>Default credentials: admin/admin</small>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
