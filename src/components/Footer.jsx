import React from "react";
import {
  FaGithub,
  FaEnvelope,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import styles from "./footer.module.css";
import { footerRoutes } from "@/lib/seo/routes.mjs";
import { hasPosts } from "@/lib/blog/posts.mjs";
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
          {hasPosts() ? (
            <a
              href="/blog/"
              className={styles.siteLink}
              title="Engineering notes and articles"
            >
              Writing
            </a>
          ) : null}
        </nav>

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
