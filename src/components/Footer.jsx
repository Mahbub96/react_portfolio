import React from "react";
import {
  FaGithub,
  FaEnvelope,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";
import styles from "./footer.module.css";
import { footerRoutes } from "@/lib/seo/routes.mjs";
import {
  APP_VERSION,
  BUILD_NUMBER,
  COMMIT_HASH,
  BUILD_DATE,
} from "@/config/version";

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
        {/*
          Crawlable internal navigation.

          The navbar uses in-page anchors (#projects, #skills, #contact), so
          before this existed the standalone routes had zero inbound <a href>
          links anywhere in the HTML — they were orphan pages that Google could
          only reach via the sitemap. Rendered as plain anchors, server-side,
          so they are present for crawlers without any JS execution.
        */}
        <nav className={styles.siteLinks} aria-label="Site pages">
          {footerRoutes().map((route) => (
            <a
              key={route.path}
              href={route.path}
              className={styles.siteLink}
              title={route.description}
            >
              {route.label}
            </a>
          ))}
        </nav>

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

        <div className={styles.bottomMeta}>
          <p className={styles.copyrightLine}>
            © {currentYear} {name}. All rights reserved.
          </p>
          <div
            className={styles.versionContainer}
            title={`Commit: ${COMMIT_HASH}${
              BUILD_DATE
                ? ` | Date: ${new Date(BUILD_DATE).toLocaleDateString()}`
                : ""
            }`}
          >
            <span className={styles.versionBadge}>
              <span className={styles.versionDot} />
              <span className={styles.versionLabel}>v{APP_VERSION}</span>
              <span className={styles.versionSeparator}>•</span>
              <span className={styles.buildLabel}>Build {BUILD_NUMBER}</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
