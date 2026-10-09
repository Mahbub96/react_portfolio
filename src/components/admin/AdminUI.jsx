"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { LuCircleAlert, LuCircleCheck } from "react-icons/lu";
import styles from "./admin.module.css";

const AdminUIContext = createContext(null);
export const useAdminUI = () => useContext(AdminUIContext);

/** Toasts and a promise-based confirm dialog for the admin screens. */
export function AdminUIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const confirmRef = useRef(null);

  const toast = useCallback((message, { type = "success", href, linkLabel } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((list) => [...list, { id, message, type, href, linkLabel }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), type === "error" ? 7000 : 4000);
  }, []);

  const confirm = useCallback(
    (options) => new Promise((resolve) => setDialog({ ...options, resolve })),
    []
  );

  const close = (value) => {
    dialog?.resolve(value);
    setDialog(null);
  };

  useEffect(() => {
    if (!dialog) return undefined;
    confirmRef.current?.focus();
    const onKey = (event) => event.key === "Escape" && close(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog]);

  return (
    <AdminUIContext.Provider value={{ toast, confirm }}>
      {children}

      {dialog ? (
        <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && close(false)}>
          <div className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
            <h2 id="dialog-title">{dialog.title}</h2>
            {dialog.body ? <p>{dialog.body}</p> : null}
            <div className={styles.dialogActions}>
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => close(false)}>
                Cancel
              </button>
              <button
                ref={confirmRef}
                type="button"
                className={`${styles.btn} ${dialog.danger ? styles.btnDanger : styles.btnPrimary}`}
                onClick={() => close(true)}
              >
                {dialog.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.toasts} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${t.type === "error" ? styles.toastError : ""}`}>
            {t.type === "error" ? <LuCircleAlert aria-hidden="true" /> : <LuCircleCheck aria-hidden="true" />}
            <span>
              {t.message}
              {t.href ? (
                <>
                  {" "}
                  <a href={t.href} target="_blank" rel="noopener noreferrer">
                    {t.linkLabel || "View"}
                  </a>
                </>
              ) : null}
            </span>
          </div>
        ))}
      </div>
    </AdminUIContext.Provider>
  );
}
