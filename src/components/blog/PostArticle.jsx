import Link from "next/link";
import { FaEnvelope, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import BlogImage from "@/components/blog/BlogImage";
import PostCard from "@/components/blog/PostCard";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import { absoluteUrl } from "@/lib/seo/urls.mjs";
import { BLOG_PATH, formatDate, sameDay } from "@/lib/blog/posts.mjs";
import prose from "@/components/blog/prose.module.css";
import styles from "@/app/blog/blog.module.css";

/**
 * The article template shared by the public post page and the admin
 * preview, so a preview is exactly what readers will get.
 *
 * `post.html` must come from the allow-list renderer (lib/blog/renderDoc).
 */
function TocList({ toc }) {
  return (
    <ol className={styles.tocList}>
      {toc.map((item) => (
        <li key={item.id} className={item.level === 3 ? styles.tocLevel3 : undefined}>
          <a href={`#${item.id}`}>{item.text}</a>
        </li>
      ))}
    </ol>
  );
}

export default function PostArticle({ post, related = [] }) {
  const url = absoluteUrl(post.path);
  const showToc = post.toc.length >= 3;
  const updated = !sameDay(post.dateModified, post.datePublished);
  const shareText = encodeURIComponent(post.title);
  const shareUrl = encodeURIComponent(url);

  return (
    <>
      <article>
        <header className={styles.postHeader}>
          <ol className={styles.breadcrumb} aria-label="Breadcrumb">
            <li>
              <Link href={BLOG_PATH}>Blog</Link>
            </li>
            <li aria-current="page">{post.tags[0] || "Article"}</li>
          </ol>
          {post.tags.length ? (
            <ul className={styles.tags} aria-label="Topics">
              {post.tags.map((tag) => (
                <li key={tag} className={styles.tag}>
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
          <h1 className={styles.postTitle}>{post.title}</h1>
          {post.excerpt ? <p className={styles.postLead}>{post.excerpt}</p> : null}
          <div className={styles.byline}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.avatar} src="/assets/img/profile-128.webp" alt="" width="44" height="44" />
            <div className={styles.bylineText}>
              <Link href="/about/" rel="author">
                {SITE_AUTHOR.name}
              </Link>
              <p className={styles.meta}>
                <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time>
                {updated ? (
                  <>
                    <span className={styles.dot} aria-hidden="true" />
                    <span>
                      Updated <time dateTime={post.dateModified}>{formatDate(post.dateModified)}</time>
                    </span>
                  </>
                ) : null}
                <span className={styles.dot} aria-hidden="true" />
                <span>{post.readingMinutes} min read</span>
              </p>
            </div>
          </div>
        </header>

        {post.coverImage ? (
          <figure className={styles.cover}>
            <BlogImage image={post.coverImage} eager sizes="(min-width: 1140px) 1100px, 100vw" />
            {post.coverImage.caption ? <figcaption>{post.coverImage.caption}</figcaption> : null}
          </figure>
        ) : null}

        {showToc ? (
          <details className={styles.tocInline}>
            <summary>On this page</summary>
            <TocList toc={post.toc} />
          </details>
        ) : null}

        <div className={styles.bodyWrap}>
          {showToc ? (
            <aside className={styles.tocSide}>
              <nav aria-label="On this page">
                <p className={styles.tocHeading}>On this page</p>
                <TocList toc={post.toc} />
              </nav>
            </aside>
          ) : null}
          <div className={prose.bleed}>
            <div
              className={`${prose.prose} ${post.bodyFont === "serif" ? prose.serif : ""}`}
              // Produced by the allow-list renderer at publish time
              // (src/lib/blog/renderDoc.mjs): escaped text, safe links,
              // own-upload images only.
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </div>
        </div>

        <footer className={styles.postFooter}>
          <div className={styles.share}>
            <span>Share</span>
            <a href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer">
              <FaXTwitter aria-hidden="true" /> X
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer">
              <FaLinkedin aria-hidden="true" /> LinkedIn
            </a>
            <a href={`mailto:?subject=${shareText}&body=${shareUrl}`}>
              <FaEnvelope aria-hidden="true" /> Email
            </a>
          </div>

          <section className={styles.author} aria-labelledby="author-name">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/img/profile-128.webp" alt="" width="64" height="64" loading="lazy" />
            <div>
              <h2 id="author-name">{SITE_AUTHOR.name}</h2>
              <p>
                {SITE_AUTHOR.jobTitle} in {SITE_AUTHOR.location}, building backend systems and
                applied AI. More <Link href="/about/">about me</Link>, my{" "}
                <Link href="/projects/">projects</Link>, or <Link href="/contact/">get in touch</Link>.
              </p>
            </div>
          </section>
        </footer>
      </article>

      {related.length ? (
        <section className={styles.related} aria-labelledby="related-title">
          <h2 id="related-title">Keep reading</h2>
          <div className={styles.grid}>
            {related.map((item) => (
              <PostCard key={item.slug} post={item} headingLevel={3} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
