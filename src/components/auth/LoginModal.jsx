"use client";
import React, { useState } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import styles from "./loginModal.module.css";

function LoginModal({ show, onHide }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useDataContex();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Simple authentication - replace with your preferred auth method
    if (username === "mahbub" && password === "1234") {
      login();
      onHide();
    } else {
      setError("Invalid credentials");
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
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.submitButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
