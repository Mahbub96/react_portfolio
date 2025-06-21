"use client";
import React, { useState } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaEnvelope, FaPaperPlane } from "react-icons/fa";
import styles from "./contact.module.css";

export default function Contact({ data }) {
  const contactData = data?.Contact?.data || {};

  // Default values if no data from database
  const contactInfo = contactData.contactInfo || {
    location: "Dhaka, Bangladesh",
    email: "mahbubcse96@gmail.com",
  };

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
      await axios.post("http://localhost:3001/feetback", formData);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setSubmitStatus("error");
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className={styles.contactSection}
      itemScope
      itemType="http://schema.org/ContactPage"
    >
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>
            <span className={styles.sectionNumber}>06.</span>
            Get In Touch
          </h2>
          <div className={styles.headerLine}></div>
        </div>

        <div className={styles.contactContent}>
          <div className={styles.contactInfo}>
            <h3>Let's Talk</h3>
            <p>{message}</p>
            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <FaMapMarkerAlt className={styles.contactIcon} />
                <span itemProp="address">{contactInfo.location}</span>
              </div>
              <div className={styles.contactItem}>
                <FaEnvelope className={styles.contactIcon} />
                <a href={`mailto:${contactInfo.email}`} itemProp="email">
                  {contactInfo.email}
                </a>
              </div>
            </div>
          </div>

          <form
            className={styles.contactForm}
            onSubmit={handleSubmit}
            itemScope
            itemType="http://schema.org/ContactForm"
          >
            <div className={styles.formGroup}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                aria-label="Your Name"
                itemProp="name"
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
                aria-label="Your Email"
                itemProp="email"
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
                aria-label="Subject"
                itemProp="subject"
              />
            </div>
            <div className={styles.formGroup}>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows="5"
                required
                aria-label="Your Message"
                itemProp="message"
              ></textarea>
            </div>

            {submitStatus === "success" && (
              <div className={styles.successMessage} role="alert">
                Message sent successfully!
              </div>
            )}
            {submitStatus === "error" && (
              <div className={styles.errorMessage} role="alert">
                Failed to send message. Please try again.
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
              aria-label={isSubmitting ? "Sending message..." : "Send message"}
            >
              {isSubmitting ? (
                <span className={styles.spinner}></span>
              ) : (
                <>
                  Send Message
                  <FaPaperPlane className={styles.sendIcon} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
