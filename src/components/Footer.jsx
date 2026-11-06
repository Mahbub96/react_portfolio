import React from "react";
import styles from "./footer.module.css";
import { SITE_AUTHOR, SITE_SUMMARY } from "@/lib/seo/siteConfig.mjs";
import { APP_VERSION, BUILD_NUMBER, HAS_RELEASE_NOTES } from "@/config/version";
import VersionBadge from "./VersionBadge";

/**
 * Site footer — "Calm Depth" v2. Identity and links come from siteConfig only
 * (never CMS rows), so the footer cannot re-publish stale contact details.
 * The `data` prop is accepted for backwards compatibility and ignored.
 */
const COLUMNS = [
  {
    title: "Site",
    links: [
      { label: "Work", href: "/projects/" },
      { label: "Experience", href: "/experience/" },
      { label: "Stack", href: "/skills/" },
      { label: "About", href: "/about/" },
    ],
  },
  {
    title: "Writing",
    links: [
      { label: "Blog", href: "/blog/" },
      { label: "RSS feed", href: "/blog/feed.xml" },
      { label: "Résumé", href: "/resume/" },
    ],
  },
  {
    title: "Elsewhere",
    links: [
      { label: "GitHub", href: SITE_AUTHOR.github, external: true },
      { label: "LinkedIn", href: SITE_AUTHOR.linkedin, external: true },
      { label: "X", href: SITE_AUTHOR.x, external: true },
      { label: "Email", href: `mailto:${SITE_AUTHOR.email}` },
    ],
  },
];

function initials(name = "") {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <a className={styles.brand} href="/">
              <span className={styles.mark} aria-hidden="true">
                {initials(SITE_AUTHOR.name)}
              </span>
              <span>
                {SITE_AUTHOR.name}
                <small>{SITE_AUTHOR.jobTitle}</small>
              </span>
            </a>
            <p className={styles.summary}>{SITE_SUMMARY}</p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} className={styles.col} aria-label={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links
                  .filter((link) => link.href)
                  .map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(link.external ? { target: "_blank", rel: "me noopener noreferrer" } : {})}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.bar}>
          <p>
            © {year} {SITE_AUTHOR.name}
          </p>
          <VersionBadge
            version={APP_VERSION}
            buildNumber={BUILD_NUMBER}
            hasReleaseNotes={HAS_RELEASE_NOTES}
          />
        </div>
      </div>
    </footer>
  );
}
