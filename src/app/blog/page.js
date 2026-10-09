import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { buildPageGraph, blogNode } from "@/lib/seo/structuredData.mjs";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import { allPosts, publishedPosts, formatDate } from "@/lib/blog/posts.mjs";
import styles from "./blog.module.css";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), {
  ssr: true,
});

const Footer = NextDynamic(() => import("@/components/Footer"), {
  ssr: true,
});

const PATH = "/blog/";
const TITLE = "Writing";
const DESCRIPTION = `Engineering notes by ${SITE_AUTHOR.name} on backend systems, applied AI, speech recognition and shipping software to small servers.`;

export const metadata = pageMetadata({
  path: PATH,
  title: TITLE,
  description: DESCRIPTION,
  // Indexable only once at least one post is published.
  noindex: publishedPosts().length === 0,
});

export default function BlogIndexPage() {
  const posts = allPosts();
  // No posts in this build: the section does not exist yet.
  if (posts.length === 0) notFound();

  const graph = buildPageGraph({
    path: PATH,
    name: `${TITLE} — ${SITE_AUTHOR.name}`,
    description: DESCRIPTION,
    type: "CollectionPage",
    breadcrumb: [{ name: TITLE, path: PATH }],
    mainEntity: { "@id": `https://mahbub.dev${PATH}#blog` },
    nodes: [blogNode(publishedPosts())],
  });

  return (
    <div>
      <JsonLd data={graph} />

      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main className={styles.page}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Writing</p>
          <h1 className={styles.title}>Engineering notes</h1>
          <p className={styles.lead}>{DESCRIPTION}</p>
          <p className={styles.meta}>
            <a href="/feed.xml">RSS feed</a>
          </p>
        </header>

        <ul className={styles.postList}>
          {posts.map((post) => (
            <li key={post.slug} className={styles.postItem}>
              <p className={styles.meta}>
                <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time>
                {" · "}
                {post.readingMinutes} min read
                {post.draft ? <span className={styles.draftTag}>Draft</span> : null}
              </p>
              <h2 className={styles.postTitle}>
                <Link href={post.path}>{post.title}</Link>
              </h2>
              <p className={styles.text}>{post.description}</p>
              {post.tags.length ? (
                <ul className={styles.tags} aria-label="Topics">
                  {post.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
