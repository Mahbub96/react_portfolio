import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { FaEnvelope, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import JsonLd from "@/components/seo/JsonLd";
import BlogImage from "@/components/blog/BlogImage";
import PostCard from "@/components/blog/PostCard";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { buildPageGraph, blogPostingNode } from "@/lib/seo/structuredData.mjs";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import { absoluteAssetUrl, absoluteUrl } from "@/lib/seo/urls.mjs";
import { BLOG_PATH, formatDate, sameDay } from "@/lib/blog/posts.mjs";
import {
  findRenamedSlug,
  getPublishedPost,
  getPublishedPosts,
  relatedPosts,
} from "@/lib/blog/posts.server.mjs";
import prose from "@/components/blog/prose.module.css";
import styles from "../blog.module.css";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), { ssr: true });
const Footer = NextDynamic(() => import("@/components/Footer"), { ssr: true });

// Published live from the admin; data is cached under the "blog" tag.
export const dynamic = "force-dynamic";

async function loadPost(slug) {
  const post = await getPublishedPost(slug);
  if (post) return post;
  // A renamed post keeps its old URLs working with a permanent redirect.
  const current = await findRenamedSlug(slug);
  if (current) permanentRedirect(`${BLOG_PATH}${current}/`);
  notFound();
}

function socialImage(post) {
  const cover = post.coverImage;
  if (!cover) return undefined;
  return cover.ogSrc
    ? { url: absoluteAssetUrl(cover.ogSrc), width: 1200, height: 630, alt: cover.alt }
    : { url: absoluteAssetUrl(cover.src), width: cover.width, height: cover.height, alt: cover.alt };
}

export async function generateMetadata({ params }) {
  const post = await getPublishedPost(params.slug);
  if (!post) return {};

  const base = pageMetadata({
    path: post.path,
    title: post.metaTitle || post.title,
    description: post.description,
    ogType: "article",
    canonical: post.canonicalUrl,
    ...(socialImage(post) ? { image: socialImage(post) } : {}),
  });

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [SITE_AUTHOR.name],
      tags: post.tags,
    },
  };
}

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

export default async function BlogPostPage({ params }) {
  const post = await loadPost(params.slug);
  const related = relatedPosts(post, await getPublishedPosts());
  const url = absoluteUrl(post.path);
  const showToc = post.toc.length >= 3;
  const updated = !sameDay(post.dateModified, post.datePublished);

  const graph = buildPageGraph({
    path: post.path,
    name: post.title,
    description: post.description,
    type: "WebPage",
    breadcrumb: [
      { name: "Blog", path: BLOG_PATH },
      { name: post.title, path: post.path },
    ],
    dateModified: post.dateModified,
    mainEntity: { "@id": `${url}#article` },
    nodes: [blogPostingNode(post)],
  });

  const shareText = encodeURIComponent(post.title);
  const shareUrl = encodeURIComponent(url);

  return (
    <div>
      <JsonLd data={graph} />
      <div className={styles.progress} aria-hidden="true" />
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main className={styles.post}>
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
              <img className={styles.avatar} src="/assets/img/profile.webp" alt="" width="44" height="44" />
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
              <img src="/assets/img/profile.webp" alt="" width="64" height="64" loading="lazy" />
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
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
