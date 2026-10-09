import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { buildPageGraph, blogPostingNode } from "@/lib/seo/structuredData.mjs";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import { allPosts, getPost, formatDate } from "@/lib/blog/posts.mjs";
import styles from "../blog.module.css";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), {
  ssr: true,
});

const Footer = NextDynamic(() => import("@/components/Footer"), {
  ssr: true,
});

// Every post is prerendered at build time; unknown slugs are a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return allPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const base = pageMetadata({
    path: post.path,
    title: post.title,
    description: post.description,
    ogType: "article",
    noindex: post.draft,
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

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const graph = buildPageGraph({
    path: post.path,
    name: post.title,
    description: post.description,
    type: "WebPage",
    breadcrumb: [
      { name: "Writing", path: "/blog/" },
      { name: post.title, path: post.path },
    ],
    dateModified: post.dateModified,
    mainEntity: { "@id": `https://mahbub.dev${post.path}#article` },
    nodes: [blogPostingNode(post)],
  });

  return (
    <div>
      <JsonLd data={graph} />

      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main className={styles.page}>
        <article className={styles.article}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/blog/">Writing</Link>
          </nav>

          {post.draft ? (
            <p className={styles.draftBanner} role="note">
              Draft — not published. Visible only on review builds and excluded from
              search engines.
            </p>
          ) : null}

          <header className={styles.articleHeader}>
            <h1 className={styles.title}>{post.title}</h1>
            <p className={styles.lead}>{post.description}</p>
            <p className={styles.meta}>
              By <Link href="/about/">{SITE_AUTHOR.name}</Link>
              {" · "}
              <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time>
              {post.dateModified !== post.datePublished ? (
                <>
                  {" · Updated "}
                  <time dateTime={post.dateModified}>{formatDate(post.dateModified)}</time>
                </>
              ) : null}
              {" · "}
              {post.readingMinutes} min read
            </p>
          </header>

          <div
            className={styles.prose}
            // Rendered at build time from repo Markdown; raw HTML is escaped
            // by scripts/generate-blog.mjs.
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <footer className={styles.articleFooter}>
            {post.tags.length ? (
              <ul className={styles.tags} aria-label="Topics">
                {post.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            ) : null}
            <p className={styles.text}>
              Written by <Link href="/about/">{SITE_AUTHOR.name}</Link>,{" "}
              {SITE_AUTHOR.jobTitle} in {SITE_AUTHOR.location}. More in{" "}
              <Link href="/blog/">Writing</Link> and <Link href="/projects/">Projects</Link>.
            </p>
          </footer>
        </article>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
