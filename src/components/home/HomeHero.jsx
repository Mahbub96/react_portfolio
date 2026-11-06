import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import styles from "./home.module.css";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import { experienceSummary, primaryEducation } from "./homeData";

/**
 * Hero: identity, one sentence on how he works, three verifiable facts, and
 * the layered system diagram (the page's single 3D moment). Deliberately no
 * call-to-action buttons — navigation and contact live elsewhere.
 */
export default function HomeHero({ experiences = [], educations = [] }) {
  const career = experienceSummary(experiences, SITE_AUTHOR.company);
  const education = primaryEducation(educations);

  const facts = [
    career && {
      title: SITE_AUTHOR.company.replace(/\s+Ltd\.?$/, ""),
      sub: `Since ${career.since} · ${career.roles} ${career.roles === 1 ? "role" : "roles"}`,
    },
    { title: "Production systems", sub: "Enterprise · Health · ERP" },
    education && { title: education.title, sub: education.institution },
  ].filter(Boolean);

  const socials = [
    { href: SITE_AUTHOR.github, label: "GitHub", Icon: FaGithub },
    { href: SITE_AUTHOR.linkedin, label: "LinkedIn", Icon: FaLinkedin },
    { href: SITE_AUTHOR.x, label: "X", Icon: FaXTwitter },
  ];

  return (
    <header id="about" className={styles.hero} aria-labelledby="hero-name">
      <div className={`${styles.wrap} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <span className={`${styles.status} ${styles.mono}`}>
            <span className={styles.dot} aria-hidden="true" />
            {SITE_AUTHOR.location} · GMT+6
          </span>
          <h1 id="hero-name" className={styles.heroName}>
            {SITE_AUTHOR.name}
          </h1>
          <p className={styles.heroTitle}>
            {SITE_AUTHOR.jobTitle}
            <span className={styles.heroSep} aria-hidden="true">
              {" · "}
            </span>
            <span className={styles.heroTagline}>{SITE_AUTHOR.tagline}</span>
          </p>
          <p className={styles.lede}>
            I design and build backend services, full-stack products and applied AI
            systems — with a focus on clean architecture, measurable behaviour and
            systems that stay maintainable in production.
          </p>

          <dl className={styles.facts}>
            {facts.map((fact) => (
              <div key={fact.title}>
                <dt>{fact.title}</dt>
                <dd>{fact.sub}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.contactRow}>
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                className={styles.iconLink}
                target="_blank"
                rel="me noopener noreferrer"
                aria-label={`${SITE_AUTHOR.name} on ${label}`}
              >
                <Icon aria-hidden="true" />
              </a>
            ))}
            <a className={`${styles.mono} ${styles.mailLink}`} href={`mailto:${SITE_AUTHOR.email}`}>
              {SITE_AUTHOR.email}
            </a>
          </div>
        </div>

        <SystemLayers />
      </div>
    </header>
  );
}

const LAYERS = [
  {
    id: "data",
    step: "LAYER 03",
    title: "Data & storage",
    tone: "violet",
    blocks: [["PostgreSQL", "Redis"], ["ClickHouse", "Vector store"]],
  },
  {
    id: "services",
    step: "LAYER 02",
    title: "Services & AI",
    tone: "accent",
    blocks: [["NestJS API", "Queue workers"], ["FastAPI · Whisper · LLM"]],
  },
  {
    id: "product",
    step: "LAYER 01",
    title: "Product",
    tone: "sky",
    blocks: [["Next.js web", "React Native"], ["Dashboards · Admin · RBAC"]],
  },
];

/** Isometric stack of the three layers he works across. Pure CSS 3D. */
function SystemLayers() {
  return (
    <figure className={styles.arch} aria-label="Layered architecture: product, services and AI, data">
      <figcaption className={`${styles.archCap} ${styles.mono}`}>
        HOW I THINK ABOUT SYSTEMS
        <b>Product → Services → Data</b>
      </figcaption>
      <div className={styles.iso} aria-hidden="true">
        {LAYERS.map((layer, index) => (
          <div
            key={layer.id}
            className={`${styles.plate} ${styles[`plate${index}`]} ${styles[`tone_${layer.tone}`]}`}
          >
            <div className={styles.plateLabel}>
              <small>{layer.step}</small>
              {layer.title}
            </div>
            <div className={styles.plateRows}>
              {layer.blocks.map((row) => (
                <div key={row.join()} className={styles.plateRow}>
                  {row.map((block) => (
                    <span key={block} className={styles.block}>
                      {block}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ul className={styles.legend}>
        <li>
          <i className={styles.tone_sky} />
          Interfaces people use
        </li>
        <li>
          <i className={styles.tone_accent} />
          Business logic &amp; AI
        </li>
        <li>
          <i className={styles.tone_violet} />
          State &amp; storage
        </li>
      </ul>
    </figure>
  );
}
