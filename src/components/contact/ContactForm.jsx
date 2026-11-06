"use client";

import React, { useState } from "react";
import axios from "axios";
import analytics from "@/services/analyticsSdk";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import styles from "@/components/page/page.module.css";

const EMPTY = { name: "", email: "", subject: "", message: "" };
const FALLBACK_ERROR = `The message could not be sent. Please try again, or email ${SITE_AUTHOR.email}.`;

// Mirrors the server-side rules in /api/contact so the visitor gets
// immediate feedback. The server remains authoritative.
function validate(values) {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const subject = values.subject.trim();
  const message = values.message.trim();

  if (!name) errors.name = "Name is required";
  else if (name.length < 2 || name.length > 100)
    errors.name = "Name must be between 2 and 100 characters";

  if (!email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address";

  if (!subject) errors.subject = "Subject is required";
  else if (subject.length < 5 || subject.length > 200)
    errors.subject = "Subject must be between 5 and 200 characters";

  if (!message) errors.message = "Message is required";
  else if (message.length < 10 || message.length > 2000)
    errors.message = "Message must be between 10 and 2000 characters";

  return errors;
}

const FIELDS = {
  name: { label: "Name", type: "text", placeholder: "Your name", autoComplete: "name" },
  email: { label: "Email", type: "email", placeholder: "you@example.com", autoComplete: "email" },
  subject: { label: "Subject", type: "text", placeholder: "What is it about?", autoComplete: "off" },
  message: { label: "Message", placeholder: "Write your message…", autoComplete: "off" },
};

/**
 * Contact form used on /contact/ and in the navbar's contact dialog.
 * `idPrefix` keeps element ids unique when both are on the same page;
 * `embedded` drops the card chrome and the heading (the dialog has its own).
 */
export default function ContactForm({ idPrefix = "contact", embedded = false }) {
  const [formData, setFormData] = useState(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear a field's error as soon as the visitor starts correcting it.
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitStatus("error");
      setErrorMessage("Please correct the highlighted fields and try again.");
      return;
    }

    setFieldErrors({});
    setErrorMessage("");
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post("/api/contact/", formData);

      if (response.status === 200) {
        setSubmitStatus("success");
        setFormData(EMPTY);
        analytics.track("form_submit_success", { formId: "contact_form" }, "contact_form");
      } else {
        setSubmitStatus("error");
        setErrorMessage(FALLBACK_ERROR);
        analytics.track(
          "form_submit_error",
          { formId: "contact_form", reason: "non_200_status" },
          "contact_form"
        );
      }
    } catch (error) {
      setSubmitStatus("error");
      const status = error?.response?.status;
      const payload = error?.response?.data;

      analytics.track(
        "form_submit_error",
        {
          formId: "contact_form",
          statusCode: status || 500,
          errorType: status === 429 ? "rate_limit" : status === 400 ? "validation" : "server_error",
        },
        "contact_form"
      );

      if (status === 429) {
        const retryAfter = payload?.retryAfter || "a few minutes";
        setErrorMessage(`Too many attempts. Please try again in ${retryAfter}, or send an email instead.`);
      } else if (status === 400 && payload?.details) {
        // Surface the server's per-field validation instead of discarding it.
        setFieldErrors(payload.details);
        setErrorMessage("Please correct the highlighted fields and try again.");
      } else if (payload?.error) {
        setErrorMessage(payload.error);
      } else {
        setErrorMessage(FALLBACK_ERROR);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (name) => {
    const { label, type, placeholder, autoComplete } = FIELDS[name];
    const Control = name === "message" ? "textarea" : "input";
    return (
      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-${name}`}>{label}</label>
        <Control
          id={`${idPrefix}-${name}`}
          name={name}
          type={type}
          rows={name === "message" ? 5 : undefined}
          data-analytics-id={`contact-form-${name}`}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required
          disabled={isSubmitting}
          aria-required="true"
          aria-describedby={`${idPrefix}-${name}-error`}
          aria-invalid={fieldErrors[name] ? "true" : "false"}
          autoComplete={autoComplete}
        />
        <p id={`${idPrefix}-${name}-error`} className={styles.fieldError} aria-live="polite">
          {fieldErrors[name] || ""}
        </p>
      </div>
    );
  };

  return (
    <form
      className={embedded ? `${styles.form} ${styles.formEmbedded}` : styles.form}
      onSubmit={handleSubmit}
      {...(embedded ? { "aria-label": "Contact form" } : { "aria-labelledby": `${idPrefix}-form-heading` })}
      noValidate
    >
      {!embedded && <h2 id={`${idPrefix}-form-heading`}>Send a message</h2>}
      <p className={styles.formNote}>All fields are required.</p>

      <div className={styles.f2}>
        {field("name")}
        {field("email")}
      </div>
      {field("subject")}
      {field("message")}

      {submitStatus === "success" && (
        <div className={`${styles.status} ${styles.statusOk}`} role="status" aria-live="polite">
          <span>✓ Message sent. A reply will come by email.</span>
          <button type="button" onClick={() => setSubmitStatus(null)}>
            Send another
          </button>
        </div>
      )}
      {submitStatus === "error" && (
        <div className={`${styles.status} ${styles.statusErr}`} role="alert">
          <span>{errorMessage || FALLBACK_ERROR}</span>
        </div>
      )}

      <button
        type="submit"
        className={styles.send}
        data-analytics-id="contact-form-submit-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
      <p className={styles.note}>Your details are only used to reply to this message.</p>
    </form>
  );
}
