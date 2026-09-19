"use client";
import React, { useState } from "react";
import axios from "axios";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPaperPlane,
  FaPhone,
  FaGlobe,
} from "react-icons/fa";
import styles from "./contact.module.css";

// headingLevel defaults to h2 because this section also renders on the
// homepage, which already has its own h1. The standalone /contact page
// passes "h1" so that page has exactly one top-level heading.
export default function Contact({ data, headingLevel = "h2" }) {
  const Heading = headingLevel;
  const contactData = data?.Contact?.data || {};

  // Default values if no data from database
  const contactInfo = contactData.contactInfo || {
    location: "Dhaka, Bangladesh",
    email: "admin@mahbub.dev",
    phone: "+880 1784 310 996",
    website: "https://mahbub.dev",
  };

  // All available email addresses for SEO
  const allEmails = [
    "admin@mahbub.dev",
    "mahbub@lunetsoft.com",
    "mahbubcse96@gmail.com",
    "mahbub.alam.sobuz@gmail.com",
  ];

  const message =
    contactData.message ||
    "I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!";

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
      } else {
        setSubmitStatus("error");
        setErrorMessage(
          "Failed to send message. Please try again or contact me directly via email."
        );
      }
    } catch (error) {
      setSubmitStatus("error");
      const status = error?.response?.status;
      const payload = error?.response?.data;

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

  // Enhanced structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact - Mahbub Alam Portfolio",
    description:
      "Get in touch with Mahbub Alam for collaboration, opportunities, or just to say hello. Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies.",
    mainEntity: {
      "@type": "Organization",
      name: "Mahbub Alam - Full Stack Developer",
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: contactInfo.phone,
          email: contactInfo.email,
          contactType: "customer service",
          areaServed: "Worldwide",
          availableLanguage: "English",
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "18:00",
          },
        },
        ...allEmails.map((email) => ({
          "@type": "ContactPoint",
          email: email,
          contactType: "customer service",
          areaServed: "Worldwide",
          availableLanguage: "English",
        })),
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: contactInfo.location.split(",")[0].trim(),
        addressCountry:
          contactInfo.location.split(",")[1]?.trim() || "Bangladesh",
        addressRegion: "Dhaka",
        postalCode: "1230",
      },
      url: contactInfo.website,
      sameAs: [
        "https://github.com/mahbub96",
        "https://linkedin.com/in/md-mahbub-alam-6b751821b",
        "https://fb.me/MahbubCSE96",
      ],
    },
    potentialAction: {
      "@type": "ContactAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://mahbub.dev/contact",
        inLanguage: "en-US",
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: {
        "@type": "ContactPage",
        name: "Contact Form Submission",
      },
    },
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <section
        id="contact"
        className={styles.contactSection}
        itemScope
        itemType="http://schema.org/ContactPage"
        aria-labelledby="contact-heading"
      >
        <div className="container">
          <header className={styles.sectionHeader}>
            <Heading id="contact-heading" className={styles.sectionTitle}>
              Get In Touch
            </Heading>
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
                  <span itemProp="address" className={styles.contactText}>
                    {contactInfo.location}
                  </span>
                </div>
                <div className={styles.contactItem}>
                  <FaEnvelope
                    className={styles.contactIcon}
                    aria-hidden="true"
                  />
                  <a
                    href={`mailto:${contactInfo.email}`}
                    itemProp="email"
                    className={styles.contactLink}
                    aria-label={`Send email to ${contactInfo.email}`}
                  >
                    {contactInfo.email}
                  </a>
                </div>
                {contactInfo.phone && (
                  <div className={styles.contactItem}>
                    <FaPhone
                      className={styles.contactIcon}
                      aria-hidden="true"
                    />
                    <a
                      href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}
                      itemProp="telephone"
                      className={styles.contactLink}
                      aria-label={`Call ${contactInfo.phone}`}
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                )}
                {contactInfo.website && (
                  <div className={styles.contactItem}>
                    <FaGlobe
                      className={styles.contactIcon}
                      aria-hidden="true"
                    />
                    <a
                      href={contactInfo.website}
                      itemProp="url"
                      className={styles.contactLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit website ${contactInfo.website}`}
                    >
                      {contactInfo.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </address>
            </aside>

            <main className={styles.contactFormContainer}>
              <form
                className={styles.contactForm}
                onSubmit={handleSubmit}
                itemScope
                itemType="http://schema.org/ContactForm"
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
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    aria-required="true"
                    aria-describedby="name-error"
                    aria-invalid={fieldErrors.name ? "true" : "false"}
                    itemProp="name"
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
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    aria-required="true"
                    aria-describedby="email-error"
                    aria-invalid={fieldErrors.email ? "true" : "false"}
                    itemProp="email"
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
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    required
                    aria-required="true"
                    aria-describedby="subject-error"
                    aria-invalid={fieldErrors.subject ? "true" : "false"}
                    itemProp="subject"
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
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me more about your inquiry..."
                    rows="5"
                    required
                    aria-required="true"
                    aria-describedby="message-error"
                    aria-invalid={fieldErrors.message ? "true" : "false"}
                    itemProp="message"
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