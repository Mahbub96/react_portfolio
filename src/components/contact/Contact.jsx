"use client";
import React, { useState } from "react";
import axios from "axios";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPaperPlane,
  FaGlobe,
} from "react-icons/fa";
import styles from "./contact.module.css";
import HarmonicHeading from "../HarmonicHeading";
import HarmonicChip from "@/components/HarmonicChip";
import analytics from "@/services/analyticsSdk";
import {
  CONTACT_MESSAGE,
  SITE_AUTHOR,
  SITE_ORIGIN,
} from "@/lib/seo/siteConfig.mjs";

// headingLevel defaults to h2 because this section also renders on the
// homepage, which already has its own h1. The standalone /contact page
// passes "h1" so that page has exactly one top-level heading.
//
// Public contact details come from the SEO site config, not the CMS, so a
// stale database row can never re-publish a phone number, extra email
// addresses or availability wording.
const contactInfo = {
  location: SITE_AUTHOR.location,
  email: SITE_AUTHOR.email,
  website: `${SITE_ORIGIN}/`,
};

export default function Contact({ headingLevel = "h2" }) {
  const Heading = headingLevel;
  const message = CONTACT_MESSAGE;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear a field's error as soon as the visitor starts correcting it.
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // Mirrors the server-side rules in /api/contact so the visitor gets
  // immediate feedback. The server remains authoritative.
  const validate = (values) => {
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
      const response = await axios.post("/api/contact", formData);

      if (response.status === 200) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        analytics.track("form_submit_success", { formId: "contact_form" }, "contact_form");
      } else {
        setSubmitStatus("error");
        setErrorMessage(
          "Failed to send message. Please try again or contact me directly via email."
        );
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
        setErrorMessage(
          `Too many attempts. Please try again in ${retryAfter}, or email me directly.`
        );
      } else if (status === 400 && payload?.details) {
        // Surface the server's per-field validation instead of discarding it.
        setFieldErrors(payload.details);
        setErrorMessage("Please correct the highlighted fields and try again.");
      } else if (payload?.error) {
        setErrorMessage(payload.error);
      } else {
        setErrorMessage(
          "Failed to send message. Please try again or contact me directly via email."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section
        id="contact"
        className={styles.contactSection}
        aria-labelledby="contact-heading"
      >
        <div className="container">
          <header className={styles.sectionHeader}>
            <HarmonicHeading
              as={Heading}
              id="contact-heading"
              className={styles.sectionTitle}
              text="Get In Touch"
            />
            <div className={styles.headerLine} aria-hidden="true"></div>
          </header>

          <div className={styles.contactContent}>
            <aside className={styles.contactInfo}>
              <h2 className={styles.contactInfoTitle}>Let's Talk</h2>
              <p className={styles.contactMessage}>{message}</p>

              <address className={styles.contactDetails}>
                <div className={styles.contactItem}>
                  <FaMapMarkerAlt
                    className={styles.contactIcon}
                    aria-hidden="true"
                  />
                  <span className={styles.contactText}>
                    <HarmonicChip text={contactInfo.location} />
                  </span>
                </div>
                <div className={styles.contactItem}>
                  <FaEnvelope
                    className={styles.contactIcon}
                    aria-hidden="true"
                  />
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className={styles.contactLink}
                    aria-label={`Send email to ${contactInfo.email}`}
                  >
                    <HarmonicChip text={contactInfo.email} />
                  </a>
                </div>
                {contactInfo.website && (
                  <div className={styles.contactItem}>
                    <FaGlobe
                      className={styles.contactIcon}
                      aria-hidden="true"
                    />
                    <a
                      href={contactInfo.website}
                      className={styles.contactLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit website ${contactInfo.website}`}
                    >
                      <HarmonicChip text={contactInfo.website.replace(/^https?:\/\//, "")} />
                    </a>
                  </div>
                )}
              </address>
            </aside>

            <main className={styles.contactFormContainer}>
              <form
                className={styles.contactForm}
                onSubmit={handleSubmit}
                aria-labelledby="contact-form-heading"
                noValidate
              >
                <h2
                  id="contact-form-heading"
                  className={styles.formTitle}
                  aria-hidden="true"
                >
                  Contact Form
                </h2>

                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    Your Name{" "}
                    <span className={styles.required} aria-label="required">
                      *
                    </span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    data-analytics-id="contact-form-name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    aria-required="true"
                    aria-describedby="name-error"
                    aria-invalid={fieldErrors.name ? "true" : "false"}
                    className={styles.formInput}
                    autoComplete="name"
                  />
                  <div
                    id="name-error"
                    className={styles.errorText}
                    aria-live="polite"
                  >
                    {fieldErrors.name || ""}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    Your Email{" "}
                    <span className={styles.required} aria-label="required">
                      *
                    </span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    data-analytics-id="contact-form-email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    aria-required="true"
                    aria-describedby="email-error"
                    aria-invalid={fieldErrors.email ? "true" : "false"}
                    className={styles.formInput}
                    autoComplete="email"
                  />
                  <div
                    id="email-error"
                    className={styles.errorText}
                    aria-live="polite"
                  >
                    {fieldErrors.email || ""}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject" className={styles.formLabel}>
                    Subject{" "}
                    <span className={styles.required} aria-label="required">
                      *
                    </span>
                  </label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    data-analytics-id="contact-form-subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    required
                    aria-required="true"
                    aria-describedby="subject-error"
                    aria-invalid={fieldErrors.subject ? "true" : "false"}
                    className={styles.formInput}
                    autoComplete="off"
                  />
                  <div
                    id="subject-error"
                    className={styles.errorText}
                    aria-live="polite"
                  >
                    {fieldErrors.subject || ""}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>
                    Your Message{" "}
                    <span className={styles.required} aria-label="required">
                      *
                    </span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    data-analytics-id="contact-form-message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me more about your inquiry..."
                    rows="5"
                    required
                    aria-required="true"
                    aria-describedby="message-error"
                    aria-invalid={fieldErrors.message ? "true" : "false"}
                    className={styles.formTextarea}
                    autoComplete="off"
                  ></textarea>
                  <div
                    id="message-error"
                    className={styles.errorText}
                    aria-live="polite"
                  >
                    {fieldErrors.message || ""}
                  </div>
                </div>

                {submitStatus === "success" && (
                  <div
                    className={styles.successMessage}
                    role="alert"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <span className={styles.messageIcon}>✓</span>
                    Message sent successfully! I'll get back to you soon.
                  </div>
                )}
                {submitStatus === "error" && (
                  <div
                    className={styles.errorMessage}
                    role="alert"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <span className={styles.messageIcon}>⚠</span>
                    {errorMessage ||
                      "Failed to send message. Please try again or contact me directly via email."}
                  </div>
                )}

                <button
                  type="submit"
                  data-analytics-id="contact-form-submit-btn"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                  aria-label={
                    isSubmitting ? "Sending message..." : "Send message"
                  }
                  aria-describedby={isSubmitting ? "sending-status" : undefined}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className={styles.spinner}
                        aria-hidden="true"
                      ></span>
                      <span id="sending-status">Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <FaPaperPlane
                        className={styles.sendIcon}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>
              </form>
            </main>
          </div>
        </div>
      </section>
    </>
  );
}