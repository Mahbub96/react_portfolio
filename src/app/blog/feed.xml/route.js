import { getPublishedPost, getPublishedPosts } from "@/lib/blog/posts.server.mjs";
import { renderRss } from "@/lib/blog/feeds.mjs";

export const dynamic = "force-dynamic";

const FEED_SIZE = 20;

// RSS 2.0 with full article content. Data is cached under the "blog" tag,
// so a publish shows up here immediately.
export async function GET() {
  const latest = (await getPublishedPosts()).slice(0, FEED_SIZE);
  const posts = (await Promise.all(latest.map((post) => getPublishedPost(post.slug)))).filter(Boolean);
  return new Response(renderRss(posts), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
