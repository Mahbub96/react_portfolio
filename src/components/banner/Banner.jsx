"use client";

import React from "react";
import { TypeAnimation } from "react-type-animation";
import styles from "./banner.module.css";

function Banner({ data }) {
  const bannerData = data?.data || {};

  // Default values if no data from database
  const roles = bannerData.roles || [
    "Full Stack Developer",
    1500,
    "Mobile App Developer",
    1500,
    "ML Engineer",
    1500,
    "Data Scientist",
    1500,
    "DevSecOps Engineer",
    1500,
  ];

  const name = bannerData.name || "Mahbub Alam";
  const location = bannerData.location || "Dhaka, Bangladesh";
  const bio =
    bannerData.bio ||
    "As a Junior Software Engineer at Brotecs Technologies Ltd., I specialize in the backend development of web applications and cloud-based VoIP calling solutions. I have hands-on experience with PHP frameworks like CodeIgniter and Laravel, and have also worked with modern JavaScript frameworks such as Node.js and React. Additionally, I am familiar with ASTPP and various UI frameworks including Tailwind, MaterialUI, and Bootstrap.\n\nMy background extends into Python, particularly for deep learning applications, and I am continually exploring new technologies in cloud and DevSecOps to expand my skill set. I am committed to ongoing learning, believing it is key to personal and professional growth.";
  const socialLinks = bannerData.socialLinks || {
    email: "support@mahbub.dev",
    github: "https://github.com/mahbub96",
    facebook: "https://fb.me/MahbubCSE96",
    linkedin: "https://www.linkedin.com/in/md-mahbub-alam-6b751821b",
  };

  return (
    <section className={styles.banner_section}>
      <div className={styles.tech_background}></div>
      <div className={styles.banner_container}>
        <div className={styles.profile_section}>
          <div className={styles.profile_image_container}>
            <div
              className={styles.profile_image}
              style={{
                backgroundImage: "url('/assets/img/profile.png')",
              }}
              aria-label={`Profile photo of ${name}`}
            />
            <div className={styles.profile_glow}></div>
          </div>
          <h1 className={styles.name}>
            {name}
            <span className={styles.cursor}>_</span>
          </h1>
        </div>

        <div className={styles.content_section}>
          <div className={styles.type_animation_container}>
            <TypeAnimation
              sequence={roles}
              speed={40}
              repeat={Infinity}
              deletionSpeed={60}
              className={styles.animated_text}
            />
          </div>

          <div className={styles.location_container}>
            <i className="fa fa-map-marker"></i>
            <span>{location}</span>
          </div>

          <div className={styles.bio_container}>
            {bio.split("\n").map((line, index) => (
              <p key={index} className={styles.bio_text}>
                {line}
              </p>
            ))}
          </div>

          <button className={styles.cta_button}>
            <i className="fa fa-code"></i>
            <span>Get in Touch</span>
          </button>
        </div>

        <div className={styles.social_links}>
          <a
            href={`mailto:${socialLinks.email}`}
            target="_blank"
            title="Email me"
            rel="noopener noreferrer"
            className={styles.social_link}
          >
            <i className="fa fa-envelope"></i>
          </a>
          <a
            href={socialLinks.github}
            target="_blank"
            title="GitHub Profile"
            rel="noopener noreferrer"
            className={styles.social_link}
          >
            <i className="fa fa-github"></i>
          </a>
          <a
            href={socialLinks.facebook}
            target="_blank"
            title="Facebook Profile"
            rel="noopener noreferrer"
            className={styles.social_link}
          >
            <i className="fa fa-facebook"></i>
          </a>
          <a
            href={socialLinks.linkedin}
            target="_blank"
            title="LinkedIn Profile"
            rel="noopener noreferrer"
            className={styles.social_link}
          >
            <i className="fa fa-linkedin"></i>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Banner;
