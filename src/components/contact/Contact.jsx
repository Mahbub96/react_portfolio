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

export default function Contact({ data }) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post("/api/contact", formData);

      if (response.status === 200) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
      console.error("Error submitting form:", error);
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
            <h1 id="contact-heading" className={styles.sectionTitle}>
              Get In Touch
            </h1>
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
                    itemProp="name"
                    className={styles.formInput}
                    autoComplete="name"
                  />
                  <div
                    id="name-error"
                    className={styles.errorText}
                    aria-live="polite"
                  ></div>
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
                    itemProp="email"
                    className={styles.formInput}
                    autoComplete="email"
                  />
                  <div
                    id="email-error"
                    className={styles.errorText}
                    aria-live="polite"
                  ></div>
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
                    itemProp="subject"
                    className={styles.formInput}
                    autoComplete="off"
                  />
                  <div
                    id="subject-error"
                    className={styles.errorText}
                    aria-live="polite"
                  ></div>
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
                    itemProp="message"
                    className={styles.formTextarea}
                    autoComplete="off"
                  ></textarea>
                  <div
                    id="message-error"
                    className={styles.errorText}
                    aria-live="polite"
                  ></div>
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
                    Failed to send message. Please try again or contact me
                    directly via email.
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
