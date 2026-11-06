"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import ContactForm from "./ContactForm";
import { CONTACT_MESSAGE, SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import styles from "./contactDialog.module.css";

/**
 * Contact form in a native <dialog>, opened from the navbar on every page.
 * The form mounts on first open (keeps it out of every page's initial HTML),
 * the page behind it stops scrolling, and Escape / backdrop / × all close it.
 */
const ContactDialog = forwardRef(function ContactDialog(_props, ref) {
  const dialogRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => dialogRef.current?.close(), []);

  useImperativeHandle(ref, () => ({
    open() {
      setMounted(true);
      const dialog = dialogRef.current;
      if (dialog && !dialog.open) {
        dialog.showModal();
        document.documentElement.classList.add("dialog-open");
        // Desktop: start in the Name field. Touch screens: don't pop the
        // keyboard up unasked; focus the panel instead.
        requestAnimationFrame(() => {
          const fine = window.matchMedia("(pointer: fine)").matches;
          const target = fine ? document.getElementById("contact-dialog-name") : dialog.querySelector("h2");
          target?.focus({ preventScroll: true });
        });
      }
    },
    close,
  }), [close]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const onClose = () => document.documentElement.classList.remove("dialog-open");
    // Close only when the press starts and ends on the backdrop, so selecting
    // text in a field and releasing outside never dismisses the form.
    let downOnBackdrop = false;
    const onDown = (event) => { downOnBackdrop = event.target === dialog; };
    const onClick = (event) => { if (downOnBackdrop && event.target === dialog) dialog.close(); };
    dialog.addEventListener("close", onClose);
    dialog.addEventListener("pointerdown", onDown);
    dialog.addEventListener("click", onClick);
    return () => {
      dialog.removeEventListener("close", onClose);
      dialog.removeEventListener("pointerdown", onDown);
      dialog.removeEventListener("click", onClick);
      onClose();
    };
  }, []);

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="contact-dialog-title">
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h2 id="contact-dialog-title" className={styles.title} tabIndex={-1}>Get in touch</h2>
            <p className={styles.lead}>{CONTACT_MESSAGE}</p>
            <a className={styles.email} href={`mailto:${SITE_AUTHOR.email}`}>{SITE_AUTHOR.email}</a>
          </div>
          <button type="button" className={styles.close} onClick={close} aria-label="Close contact form">
            ×
          </button>
        </header>
        <div className={styles.body}>{mounted && <ContactForm idPrefix="contact-dialog" embedded />}</div>
      </div>
    </dialog>
  );
});

export default ContactDialog;
