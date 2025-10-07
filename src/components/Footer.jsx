import React from "react";
import {
  FaGithub,
  FaEnvelope,
  FaFacebook,
  FaLinkedin,
  FaHeart,
} from "react-icons/fa";
import styles from "./footer.module.css";

function Footer({ data }) {
  const currentYear = new Date().getFullYear();

  // Extract data from database
  const profile = data?.profile?.data || {};
  const bannerData = data?.Banner?.data || {};
  const name = profile.name || bannerData.name || "Mahbub Alam";
  const socialLinks = bannerData.socialLinks || {
    email: process.env.EMAIL || "admin@mahbub.dev",
    github: process.env.GITHUB_URL || "https://github.com/mahbub96",
    facebook: process.env.FACEBOOK_URL || "https://fb.me/MahbubCSE96",
    linkedin:
      process.env.LINKEDIN_URL ||
      "https://www.linkedin.com/in/md-mahbub-alam-6b751821b",
  };

  const footerSocialLinks = [
    {
      name: "GitHub",
      icon: FaGithub,
      url: socialLinks.github,
      title: "GitHub Profile",
    },
    {
      name: "Email",
      icon: FaEnvelope,
      url: `mailto:${socialLinks.email}`,
      title: "Email me",
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      url: socialLinks.facebook,
      title: "Facebook Profile",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      url: socialLinks.linkedin,
      title: "LinkedIn Profile",
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.socialLinks}>
          {footerSocialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.title}
              className={styles.socialLink}
            >
              <link.icon />
            </a>
          ))}
        </div>

        <div className={styles.footerInfo}>
          <div className={styles.builtWith}>
            <span>Built with</span>
            <FaHeart />
            <span>using React</span>
          </div>
          <div className={styles.copyright}>
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              <span className={styles.bracket}>{"<"}</span>
              {name}
              <span className={styles.bracket}>{"/>"}</span>
            </a>
            <span className={styles.copyrightText}>
              © {currentYear}. All Rights Reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
