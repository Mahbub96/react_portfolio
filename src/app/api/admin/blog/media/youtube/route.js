import connectDB from "@/lib/mongodb";
import { blogModels } from "@/models/Blog";
import { adminRoute } from "@/lib/blog/adminApi";
import { BlogError } from "@/lib/blog/adminPosts";
import { mediaToImageRef, storeImage } from "@/lib/blog/media";
import { youtubeId } from "@/lib/blog/youtube.mjs";

export const dynamic = "force-dynamic";

/**
 * Prepare a YouTube embed: the thumbnail is copied to our own uploads (the
 * page never loads anything from YouTube until the reader clicks) and the
 * title comes from YouTube's oEmbed endpoint.
 */
export const POST = adminRoute(async (request) => {
  const { url } = await request.json();
  const videoId = youtubeId(url);
  if (!videoId) throw new BlogError("Not a YouTube video link", 422);
  if (!(await connectDB())) throw new BlogError("Database unavailable", 503);

  const timeout = () => AbortSignal.timeout(8000);
  let title = "";
  try {
    const meta = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`,
      { signal: timeout() }
    );
    if (meta.ok) title = String((await meta.json()).title || "").slice(0, 200);
  } catch {
    // title is optional
  }

  let thumbSrc = null;
  try {
    const thumb = await fetch(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, { signal: timeout() });
    if (thumb.ok) {
      const stored = await storeImage(blogModels().BlogMedia, {
        variants: [Buffer.from(await thumb.arrayBuffer())],
        kind: "youtube-thumb",
        originalName: `youtube-${videoId}.jpg`,
      });
      thumbSrc = mediaToImageRef(stored).src;
    }
  } catch {
    // the embed card still works without a thumbnail
  }

  return { videoId, title, thumbSrc };
});
