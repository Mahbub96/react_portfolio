import React from "react";
import {
  FaGithub,
  FaEnvelope,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import styles from "./footer.module.css";
import { SITE_AUTHOR, SITE_SUMMARY } from "@/lib/seo/siteConfig.mjs";
import { APP_VERSION, BUILD_NUMBER, HAS_RELEASE_NOTES } from "@/config/version";
import VersionBadge from "./VersionBadge";

function Footer({ data }) {
  const currentYear = new Date().getFullYear();

  // Extract data from database
  const profile = data?.profile?.data || {};
  const bannerData = data?.Banner?.data || {};
  const name = profile.name || bannerData.name || "Mahbub Alam";
  // Identity links come from the SEO site config — one source of truth.
  const socialLinks = {
    email: SITE_AUTHOR.email,
    github: SITE_AUTHOR.github,
    facebook: SITE_AUTHOR.facebook,
    linkedin: SITE_AUTHOR.linkedin,
    x: SITE_AUTHOR.x,
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
    {
      name: "X",
      icon: FaXTwitter,
      url: socialLinks.x,
      title: "X (Twitter) Profile",
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
              title={link.title}
              aria-label={`${name} — ${link.title}`}
              rel="me noopener noreferrer"
              className={styles.socialLink}
            >
              <link.icon aria-hidden="true" />
            </a>
          ))}
        </div>

        <p className={styles.summary}>{SITE_SUMMARY}</p>

        <div className={styles.bottomMeta}>
          <p className={styles.copyrightLine}>
            © {currentYear} {name}. All rights reserved.
          </p>
          <div className={styles.versionContainer}>
            <VersionBadge
              version={APP_VERSION}
              buildNumber={BUILD_NUMBER}
              hasReleaseNotes={HAS_RELEASE_NOTES}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
