import React from "react";
import styles from "@/components/page/page.module.css";
import PageHeader from "@/components/page/PageHeader";
import ContactForm from "./ContactForm";
import { CONTACT_MESSAGE, SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";

/**
 * /contact/ — public contact details come from the SEO site config, not the
 * CMS, so a stale database row can never re-publish a phone number, extra
 * email addresses or availability wording.
 */
function handle(url = "") {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

const WAYS = [
  {
    key: "email",
    icon: "@",
    label: "Email",
    href: `mailto:${SITE_AUTHOR.email}`,
    value: SITE_AUTHOR.email,
  },
  { key: "linkedin", icon: "in", label: "LinkedIn", href: SITE_AUTHOR.linkedin, value: handle(SITE_AUTHOR.linkedin) },
  { key: "github", icon: "gh", label: "GitHub", href: SITE_AUTHOR.github, value: handle(SITE_AUTHOR.github) },
  {
    key: "x",
    icon: "x",
    label: "X",
    href: SITE_AUTHOR.x,
    value: `@${handle(SITE_AUTHOR.x).split("/").pop()}`,
  },
].filter((way) => way.href);

export default function Contact() {
  return (
    <>
      <PageHeader crumbs={[{ name: "Contact", href: "/contact/" }]} title="Contact" lead={CONTACT_MESSAGE} />

      <section className={styles.sec} aria-label="Contact options">
        <div className={`${styles.wrap} ${styles.ct}`}>
          <address className={styles.ways}>
            {WAYS.map((way) => (
              <a
                key={way.key}
                className={styles.way}
                href={way.href}
                {...(way.key === "email" ? {} : { target: "_blank", rel: "me noopener noreferrer" })}
              >
                <span className={styles.wayIcon} aria-hidden="true">
                  {way.icon}
                </span>
                <span>
                  <b>{way.label}</b>
                  <span className={styles.wayValue}>{way.value}</span>
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </address>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
