import React, { useState } from "react";
import axios from "axios";
import styles from "./contact.module.css";

export default function Contact() {
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
    <section id="contact" className={styles.contactSection}>
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
            <p>
              I'm currently looking for new opportunities. Whether you have a
              question or just want to say hi, I'll try my best to get back to
              you!
            </p>
            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <i className="fa fa-map-marker"></i>
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className={styles.contactItem}>
                <i className="fa fa-envelope"></i>
                <a href="mailto:mahbubcse96@gmail.com">mahbubcse96@gmail.com</a>
              </div>
            </div>
          </div>

          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
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
              ></textarea>
            </div>

            {submitStatus === "success" && (
              <div className={styles.successMessage}>
                Message sent successfully!
              </div>
            )}
            {submitStatus === "error" && (
              <div className={styles.errorMessage}>
                Failed to send message. Please try again.
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className={styles.spinner}></span>
              ) : (
                <>
                  Send Message
                  <i className="fa fa-paper-plane"></i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
