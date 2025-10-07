"use client";
import React, { useState } from "react";
import { useDataContext } from "../../contexts/useAllContext";
import styles from "./configButton.module.css";

function ConfigButton() {
  const [showModal, setShowModal] = useState(false);
  const { auth, logout } = useDataContext();

  const handleLogout = () => {
    logout();
    setShowModal(false);
  };

  const handleLogin = () => {
    setShowModal(true);
  };

  return (
    <>
      <button
        className={styles.configButton}
        onClick={auth ? handleLogout : handleLogin}
        title={auth ? "Logout" : "Admin Login"}
      >
        <i className={`fa ${auth ? "fa-sign-out" : "fa-cog"}`}></i>
      </button>

      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Admin Access</h3>
            <p>Please log in to access admin features.</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ConfigButton;
