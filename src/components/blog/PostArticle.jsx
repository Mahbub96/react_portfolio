"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { FaEnvelope, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { LuArrowLeft, LuBookOpen } from "react-icons/lu";
import BlogCoverImage from "@/components/blog/BlogCoverImage";
import PostCard from "@/components/blog/PostCard";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import { absoluteUrl } from "@/lib/seo/urls.mjs";
import { BLOG_PATH, formatDate, sameDay } from "@/lib/blog/posts.mjs";
import prose from "@/components/blog/prose.module.css";
import styles from "@/app/blog/blog.module.css";
import BlogViewTracker from "@/components/blog/BlogViewTracker";
import LanguageDropdown from "@/components/blog/LanguageDropdown";

/**
 * Table of contents list with active heading highlight
 */
function TocList({ toc = [], activeId = "" }) {
  return (
    <ol className={styles.tocList}>
      {toc.map((item) => (
        <li
          key={item.id}
          className={`${item.level === 3 ? styles.tocLevel3 : ""} ${
            activeId === item.id ? styles.tocActive : ""
          }`}
        >
          <a href={`#${item.id}`}>{item.text}</a>
        </li>
      ))}
    </ol>
  );
}

export default function PostArticle({ post, related = [] }) {
  const url = absoluteUrl(post.path);
  const updated = !sameDay(post.dateModified, post.datePublished);
  const shareText = encodeURIComponent(post.title);
  const shareUrl = encodeURIComponent(url);

  // Translation & Language state
  const [lang, setLang] = useState("en");
  const [translations, setTranslations] = useState(() => {
    if (post.translations?.bn) {
      return { bn: post.translations.bn };
    }
    return {};
  });
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const abortControllerRef = useRef(null);

  const handleStopTranslation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoadingTranslation(false);
    setLang("en");
  }, []);

  const handleSelectLang = useCallback(
    async (targetLang) => {
      if (targetLang === "en") {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        setIsLoadingTranslation(false);
        setLang("en");
        return;
      }

      if (targetLang === "bn") {
        // If already cached in memory
        if (translations.bn) {
          setLang("bn");
          return;
        }

        // Abort any prior request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoadingTranslation(true);
        try {
          const res = await fetch(
            `/api/blog/${encodeURIComponent(post.slug)}/translate/?lang=bn`,
            { signal: controller.signal }
          );
          const data = await res.json().catch(() => ({}));

          if (res.ok && data.success && data.translation) {
            setTranslations((prev) => ({ ...prev, bn: data.translation }));
            setLang("bn");
          } else {
            // Revert gracefully to English on failure
            setLang("en");
          }
        } catch (err) {
          if (err.name === "AbortError") {
            // Cancelled by user
            return;
          }
          setLang("en");
        } finally {
          setIsLoadingTranslation(false);
          abortControllerRef.current = null;
        }
      }
    },
    [post.slug, translations.bn]
  );

  // Active post data based on selected language
  const isBangla = lang === "bn" && translations.bn;
  const currentData = isBangla ? translations.bn : post;

  const displayedTitle = currentData.title || post.title;
  const displayedExcerpt = currentData.excerpt || post.excerpt;
  const displayedHtml = currentData.html || post.html;
  const displayedToc = Array.isArray(currentData.toc) && currentData.toc.length > 0
    ? currentData.toc
    : Array.isArray(post.toc)
    ? post.toc
    : [];

  const showToc = displayedToc.length >= 1;

  // Scrollspy to highlight active heading in TOC
  useEffect(() => {
    if (!showToc) return;

    const headingElements = Array.from(
      document.querySelectorAll("article h2, article h3")
    );
    if (!headingElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.find((e) => e.isIntersecting);
        if (intersecting && intersecting.target.id) {
          setActiveHeadingId(intersecting.target.id);
        }
      },
      {
        rootMargin: "-80px 0% -65% 0%",
      }
    );

    headingElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [displayedHtml, showToc]);

  return (
    <>
      <article className={styles.post}>
        <header className={styles.postHeader}>
          <div
            className={`${styles.headerLayout} ${
              post.coverImage ? styles.headerWithCover : ""
            }`}
          >
            <div className={styles.headerInfo}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <Link href={BLOG_PATH} className={styles.backLink}>
                  <LuArrowLeft aria-hidden="true" /> All articles
                </Link>
                <div className={styles.headerLangWrap}>
                  <LanguageDropdown
                    currentLang={lang}
                    onSelectLang={handleSelectLang}
                    isLoading={isLoadingTranslation}
                    onStop={handleStopTranslation}
                  />
                </div>
              </div>

              {post.tags?.length ? (
                <ul className={styles.tags} aria-label="Topics">
                  {post.tags.map((tag) => (
                    <li key={tag} className={styles.tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}

              <h1 className={styles.postTitle}>{displayedTitle}</h1>

              {displayedExcerpt ? (
                <p className={styles.postLead}>{displayedExcerpt}</p>
              ) : null}

              <div className={styles.byline}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.avatar}
                  src="/assets/img/profile-128.webp"
                  alt=""
                  width="44"
                  height="44"
                />
                <div className={styles.bylineText}>
                  <Link href="/about/" rel="author">
                    {SITE_AUTHOR.name}
                  </Link>
                  <p className={styles.meta}>
                    <time dateTime={post.datePublished}>
                      {formatDate(post.datePublished)}
                    </time>
                    {updated ? (
                      <>
                        <span className={styles.dot} aria-hidden="true" />
                        <span>
                          Updated{" "}
                          <time dateTime={post.dateModified}>
                            {formatDate(post.dateModified)}
                          </time>
                        </span>
                      </>
                    ) : null}
                    <span className={styles.dot} aria-hidden="true" />
                    <span>{post.readingMinutes} min read</span>
                    <span className={styles.dot} aria-hidden="true" />
                    <BlogViewTracker slug={post.slug} initialViews={post.views} />
                  </p>
                </div>
              </div>
            </div>

            {post.coverImage ? (
              <figure className={styles.headerCover}>
                <BlogCoverImage
                  image={post.coverImage}
                  eager
                  title={displayedTitle}
                />
                {post.coverImage.caption ? (
                  <figcaption>{post.coverImage.caption}</figcaption>
                ) : null}
              </figure>
            ) : null}
          </div>
        </header>

        {isBangla && (
          <div className={styles.translationBanner} role="note">
            <div className={styles.translationText}>
              <span>🇧🇩</span>
              <span>
                <strong>বাংলা সংস্করণ</strong> (AI দ্বারা অনূদিত এবং ডাটাবেজে সংরক্ষিত)
              </span>
            </div>
            <button
              type="button"
              className={styles.revertButton}
              onClick={() => handleSelectLang("en")}
            >
              English-এ পড়ুন
            </button>
          </div>
        )}


        {/* Mobile Sticky Table of Contents */}
        {showToc ? (
          <details className={styles.tocInline}>
            <summary className={styles.tocInlineSummary}>
              <span className={styles.tocInlineTitle}>
                <LuBookOpen aria-hidden="true" />{" "}
                {isBangla ? "এই নিবন্ধে" : "In this article"} (
                {displayedToc.length} {isBangla ? "টি অনুচ্ছেদ" : "sections"})
              </span>
              <LanguageDropdown
                currentLang={lang}
                onSelectLang={handleSelectLang}
                isLoading={isLoadingTranslation}
                onStop={handleStopTranslation}
              />
            </summary>
            <TocList toc={displayedToc} activeId={activeHeadingId} />
          </details>
        ) : null}

        <div
          className={`${styles.bodyWrap} ${
            showToc ? styles.bodyWrapWithToc : ""
          }`}
        >
          <div className={styles.bodyContent}>
            <div className={prose.bleed}>
              <div
                className={`${prose.prose} ${
                  post.bodyFont === "serif" ? prose.serif : ""
                }`}
                dangerouslySetInnerHTML={{ __html: displayedHtml }}
              />
            </div>

            <footer className={styles.postFooter}>
              <div className={styles.footerRow}>
                <div className={styles.share}>
                  <span>Share</span>
                  <a
                    href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaXTwitter aria-hidden="true" /> X
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin aria-hidden="true" /> LinkedIn
                  </a>
                  <a href={`mailto:?subject=${shareText}&body=${shareUrl}`}>
                    <FaEnvelope aria-hidden="true" /> Email
                  </a>
                </div>
                <Link href={BLOG_PATH} className={styles.backLink}>
                  <LuArrowLeft aria-hidden="true" /> All articles
                </Link>
              </div>

              <section className={styles.author} aria-labelledby="author-name">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/img/profile-128.webp"
                  alt=""
                  width="64"
                  height="64"
                  loading="lazy"
                />
                <div>
                  <h2 id="author-name">{SITE_AUTHOR.name}</h2>
                  <p>
                    {SITE_AUTHOR.jobTitle} in {SITE_AUTHOR.location}, building
                    backend systems and applied AI. More{" "}
                    <Link href="/#about">about me</Link>, my{" "}
                    <Link href="/#projects">projects</Link>, or{" "}
                    <Link href="/#contact">get in touch</Link>.
                  </p>
                </div>
              </section>
            </footer>
          </div>

          {/* Desktop Sticky Sidebar Table of Contents */}
          {showToc ? (
            <aside className={styles.tocSide}>
              <nav aria-label="On this page">
                <div className={styles.tocSideHeader}>
                  <p className={styles.tocHeading}>
                    {isBangla ? "এই পৃষ্ঠায়" : "On this page"}
                  </p>
                  <LanguageDropdown
                    currentLang={lang}
                    onSelectLang={handleSelectLang}
                    isLoading={isLoadingTranslation}
                    onStop={handleStopTranslation}
                  />
                </div>
                <TocList toc={displayedToc} activeId={activeHeadingId} />
              </nav>
            </aside>
          ) : null}
        </div>
      </article>

      {related.length ? (
        <section className={styles.related} aria-labelledby="related-title">
          <h2 id="related-title">Keep reading</h2>
          <div className={styles.feedList}>
            {related.map((item) => (
              <PostCard key={item.slug} post={item} headingLevel={3} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
