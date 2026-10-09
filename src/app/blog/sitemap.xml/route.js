import { getPublishedPosts, indexablePosts } from "@/lib/blog/posts.server.mjs";
import { renderBlogSitemap } from "@/lib/blog/feeds.mjs";

export const dynamic = "force-dynamic";

// Child of the static /sitemap.xml index: the blog and every published post
// whose canonical is this site.
export async function GET() {
  const posts = indexablePosts(await getPublishedPosts());
  return new Response(renderBlogSitemap(posts), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
