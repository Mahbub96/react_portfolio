import connectDB from "@/lib/mongodb";
import { blogModels } from "@/models/Blog";
import { adminRoute } from "@/lib/blog/adminApi";
import { BlogError } from "@/lib/blog/adminPosts";
import { MAX_REQUEST_BYTES, mediaToImageRef, storeImage } from "@/lib/blog/media";

export const dynamic = "force-dynamic";

async function media() {
  if (!(await connectDB())) throw new BlogError("Database unavailable", 503);
  return blogModels().BlogMedia;
}

/**
 * Upload one image as multipart form data:
 *   variant  1-4 files, the browser-resized sizes of the same image
 *   og       optional 1200x630 social-card crop (cover images)
 *   name     optional original file name
 */
export const POST = adminRoute(async (request) => {
  if (Number(request.headers.get("content-length") || 0) > MAX_REQUEST_BYTES) {
    throw new BlogError("Upload is larger than 8 MB", 413);
  }
  const form = await request.formData();
  const toBuffer = async (file) => Buffer.from(await file.arrayBuffer());
  const variants = await Promise.all(
    form.getAll("variant").filter((f) => typeof f === "object" && f.size).map(toBuffer)
  );
  const ogFile = form.get("og");
  const og = ogFile && typeof ogFile === "object" && ogFile.size ? await toBuffer(ogFile) : null;

  const stored = await storeImage(await media(), {
    variants,
    og,
    originalName: form.get("name") || "",
  });
  return { media: mediaToImageRef(stored) };
});

/** Recent uploads for the media picker. */
export const GET = adminRoute(async () => {
  const BlogMedia = await media();
  const items = await BlogMedia.find({ kind: "image" }).sort({ createdAt: -1 }).limit(120).lean();
  return { items: items.map((item) => ({ ...mediaToImageRef(item), createdAt: item.createdAt, name: item.originalName })) };
});
