import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import OwnerBar from "@/components/blog/OwnerBar";
import BlogFeed from "@/components/blog/BlogFeed";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { buildPageGraph, blogNode } from "@/lib/seo/structuredData.mjs";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import { absoluteUrl } from "@/lib/seo/urls.mjs";
import { BLOG_PATH } from "@/lib/blog/posts.mjs";
import { getPublishedPosts } from "@/lib/blog/posts.server.mjs";
import { BLOG_DESCRIPTION } from "@/lib/blog/feeds.mjs";
import styles from "./blog.module.css";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), { ssr: true });
const Footer = NextDynamic(() => import("@/components/Footer"), { ssr: true });

// Posts are published live from the admin; data is cached (see posts.server).
export const dynamic = "force-dynamic";

const TITLE = "Blog";

export async function generateMetadata() {
  const posts = await getPublishedPosts();
  return pageMetadata({
    path: BLOG_PATH,
    title: TITLE,
    description: BLOG_DESCRIPTION,
    // An empty index is not worth indexing; it becomes indexable with the first post.
    noindex: posts.length === 0,
  });
}

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  const graph = buildPageGraph({
    path: BLOG_PATH,
    name: `${TITLE} — ${SITE_AUTHOR.name}`,
    description: BLOG_DESCRIPTION,
    type: "CollectionPage",
    breadcrumb: [{ name: TITLE, path: BLOG_PATH }],
    mainEntity: { "@id": `${absoluteUrl(BLOG_PATH)}#blog` },
    nodes: [blogNode(posts)],
  });

  return (
    <div>
      <JsonLd data={graph} />
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Blog</p>
          <h1 className={styles.heroTitle}>
            Engineering <span>notes</span>
          </h1>
          <p className={styles.heroLead}>{BLOG_DESCRIPTION}</p>
        </header>

        {posts.length > 0 ? (
          <BlogFeed posts={posts} />
        ) : (
          <section className={styles.empty} aria-labelledby="empty-title">
            <span className={styles.emptyIcon} aria-hidden="true">
              {"{ }"}
            </span>
            <h2 id="empty-title">The first articles are on their way</h2>
            <p>
              Notes on Bangla speech recognition, local voice assistants and shipping
              software to small servers. Meanwhile, read more{" "}
              <Link href="/about/">about {SITE_AUTHOR.name}</Link>.
            </p>
          </section>
        )}
      </main>
      <OwnerBar />

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
