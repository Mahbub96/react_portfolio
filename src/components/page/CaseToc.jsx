"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";

/**
 * Sticky table of contents for a case study. Highlights the section currently
 * in view; without JS it is still a plain list of anchor links.
 */
export default function CaseToc({ sections = [] }) {
  const [current, setCurrent] = useState(sections[0]?.id);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const nodes = sections
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setCurrent(hit.target.id);
      },
      { rootMargin: "-96px 0px -60% 0px" }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className={styles.toc} aria-label="On this page">
      {sections.map(({ id, label }) => (
        <a key={id} href={`#${id}`} aria-current={current === id ? "true" : undefined}>
          {label}
        </a>
      ))}
    </nav>
  );
}
