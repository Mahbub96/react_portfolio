"use client";
import React, { useState, useEffect } from "react";
import { useDataContext } from "../../contexts/useAllContext";
import styles from "./loginModal.module.css";

function LoginModal({ show, onHide }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const { login } = useDataContext();

  // Clear form when modal is hidden
  useEffect(() => {
    if (!show) {
      setUsername("");
      setPassword("");
      setError("");
      setIsLoading(false);
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLockedOut) {
      setError("Account is temporarily locked. Please try again later.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store JWT token securely
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userRole", data.userRole || "admin");
          
          // Call login function with token and role
          login(data.token, data.userRole || "admin");
        } else {
          // Fallback if no token in response
          login();
        }
        
        onHide();
        setUsername("");
        setPassword("");
        setError("");
        setRemainingAttempts(5);
        setIsLockedOut(false);
      } else {
        if (data.lockedOut) {
          setIsLockedOut(true);
          setLockoutTime(data.lockoutTime || 900000); // 15 minutes default
          setError("Account locked due to too many failed attempts. Please try again later.");
        } else if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
          setError(`Invalid credentials. ${data.remainingAttempts} attempts remaining.`);
        } else {
          setError(data.message || "Login failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer for lockout
  useEffect(() => {
    let timer;
    if (isLockedOut && lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1000) {
            setIsLockedOut(false);
            setLockoutTime(0);
            setRemainingAttempts(5);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLockedOut, lockoutTime]);

  if (!show) return null;

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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
              placeholder="Enter username"
              required
              disabled={isLoading || isLockedOut}
              autoComplete="username"
              autoFocus
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={isLoading || isLockedOut}
              autoComplete="current-password"
            />
          </div>
          
          {error && (
            <div className={`${styles.error} ${isLockedOut ? styles.lockoutError : ''}`}>
              {error}
              {isLockedOut && lockoutTime > 0 && (
                <div className={styles.lockoutTimer}>
                  Unlock in: {formatTime(lockoutTime)}
                </div>
              )}
            </div>
          )}
          
          {!isLockedOut && remainingAttempts < 5 && (
            <div className={styles.attemptsWarning}>
              ⚠️ {remainingAttempts} login attempts remaining
            </div>
          )}
          
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || isLockedOut}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          
          <div className={styles.helpText}>
            <small>
              Forgot credentials? Contact the system administrator.
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
