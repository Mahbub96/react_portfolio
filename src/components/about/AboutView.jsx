import React from "react";
import Image from "next/image";
import styles from "@/components/page/page.module.css";
import { Breadcrumb } from "@/components/page/PageHeader";
import { displayImage } from "@/lib/displayImage";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import {
  ABOUT_TITLE,
  ABOUT_INTRO,
  ABOUT_FOCUS,
  ABOUT_APPROACH,
  ABOUT_CAREER,
  ABOUT_EDUCATION,
  ABOUT_TOPICS,
} from "@/lib/seo/aboutProfile.mjs";

/**
 * /about/ — every statement comes from aboutProfile.mjs (reviewed, in code),
 * so the page reads in one third-person voice and never picks up stale CMS
 * rows. Only the portrait image is taken from the CMS profile.
 */
export default function AboutView({ profileImage }) {
  const portrait = displayImage(profileImage || "/assets/img/profile.png");
  const city = SITE_AUTHOR.location.split(",")[0];

  return (
    <>
      <header className={styles.phead}>
        <div className={`${styles.wrap} ${styles.aboutHead}`}>
          <div>
            <Breadcrumb crumbs={[{ name: "About", href: "/about/" }]} />
            <h1 className={styles.title}>{ABOUT_TITLE}</h1>
            <div className={styles.intro}>
              {ABOUT_INTRO.map((text) => (
                <p key={text.slice(0, 40)}>{text}</p>
              ))}
            </div>
          </div>
          <div className={styles.portrait}>
            <figure className={styles.portraitCard}>
              <Image
                src={portrait}
                alt={`Portrait of ${SITE_AUTHOR.name}`}
                width={900}
                height={900}
                sizes="(max-width: 860px) 260px, 300px"
                priority
              />
              <figcaption>
                <b>{SITE_AUTHOR.name}</b>
                <span>{city} · GMT+6</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </header>

      <section className={styles.sec} aria-labelledby="focus-heading">
        <div className={styles.wrap}>
          <div className={styles.sh}>
            <div>
              <p className={styles.kicker}>01 — Focus</p>
              <h2 id="focus-heading">What he works on.</h2>
            </div>
          </div>
          <ul className={styles.focus}>
            {ABOUT_FOCUS.map((item, index) => (
              <li key={item.title} className={styles[`tone${index % 4}`]}>
                <i aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${styles.sec} ${styles.tint}`}>
        <div className={`${styles.wrap} ${styles.two}`}>
          <div>
            <p className={styles.kicker}>02 — Approach</p>
            <h2 className={styles.subTitle}>How he works.</h2>
            <ol className={styles.approach}>
              {ABOUT_APPROACH.map((text) => (
                <li key={text.slice(0, 40)}>{text}</li>
              ))}
            </ol>
          </div>
          <div>
            <p className={styles.kicker}>03 — Career</p>
            <h2 className={styles.subTitle}>{ABOUT_CAREER[0]?.org || "Career"}</h2>
            <ol className={styles.timeline}>
              {ABOUT_CAREER.map((role) => (
                <li key={role.role} className={/present/i.test(role.period) ? styles.now : undefined}>
                  <span className={styles.mono}>{role.period.replace(/\s*–\s*/, " — ").toUpperCase()}</span>
                  <h3>{role.role}</h3>
                  <p>{role.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.sec}>
        <div className={`${styles.wrap} ${styles.two}`}>
          <div>
            <p className={styles.kicker}>04 — Education</p>
            <h2 className={styles.subTitle}>{ABOUT_EDUCATION.degree}</h2>
            <p>
              {ABOUT_EDUCATION.org} · {ABOUT_EDUCATION.period}
            </p>
            <p className={`${styles.mono} ${styles.eduDetail}`}>{ABOUT_EDUCATION.detail}</p>
          </div>
          <div>
            <p className={styles.kicker}>05 — Topics</p>
            <h2 className={styles.subTitle}>Areas backed by projects.</h2>
            <ul className={styles.chips}>
              {ABOUT_TOPICS.map((topic) => (
                <li key={topic} className={styles.chip}>
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
