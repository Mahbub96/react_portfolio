import React, { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../DB/DB_init";
import styles from "./loginModal.module.css";

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Get credentials from Firebase
      const credentialsRef = doc(db, "admin", "credentials");
      const credentialsDoc = await getDoc(credentialsRef);

      if (!credentialsDoc.exists()) {
        console.log("No credentials document found");
        setError("Authentication failed. Please contact administrator.");
        return;
      }

      const storedData = credentialsDoc.data();

      if (
        username.trim() === storedData.username.trim() &&
        password.trim() === storedData.password.trim()
      ) {
        onLogin();
        onClose();
      } else {
        console.log("Login failed - credentials don't match");
        setError("Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <i className="fa fa-times"></i>
        </button>

        <h2>Admin Login</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value.trim())}
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? <span className={styles.spinner}></span> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
