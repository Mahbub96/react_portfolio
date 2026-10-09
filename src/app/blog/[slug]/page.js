import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import { notFound, permanentRedirect } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { buildPageGraph, blogPostingNode } from "@/lib/seo/structuredData.mjs";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import { absoluteAssetUrl, absoluteUrl } from "@/lib/seo/urls.mjs";
import { BLOG_PATH } from "@/lib/blog/posts.mjs";
import PostArticle from "@/components/blog/PostArticle";
import {
  findRenamedSlug,
  getPublishedPost,
  getPublishedPosts,
  relatedPosts,
} from "@/lib/blog/posts.server.mjs";
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

export default async function BlogPostPage({ params }) {
  const post = await loadPost(params.slug);
  const related = relatedPosts(post, await getPublishedPosts());
  const url = absoluteUrl(post.path);

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

  return (
    <div>
      <JsonLd data={graph} />
      <div className={styles.progress} aria-hidden="true" />
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main className={styles.post}>
        <PostArticle post={post} related={related} />
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
