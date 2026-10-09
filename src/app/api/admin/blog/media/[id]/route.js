import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { blogModels } from "@/models/Blog";
import { adminRoute } from "@/lib/blog/adminApi";
import { BlogError } from "@/lib/blog/adminPosts";
import { addImageVariant, MAX_FILE_BYTES, mediaToImageRef, removeImageFiles } from "@/lib/blog/media";

export const dynamic = "force-dynamic";

// Delete an upload, but only when no post (draft or live) references it.
export const DELETE = adminRoute(async (request, { params }) => {
  if (!(await connectDB())) throw new BlogError("Database unavailable", 503);
  const { BlogMedia, BlogPost } = blogModels();
  if (!mongoose.isValidObjectId(params.id)) throw new BlogError("Image not found", 404);
  const item = await BlogMedia.findById(params.id).lean();
  if (!item) throw new BlogError("Image not found", 404);

  const key = item.hash.slice(0, 12);
  const posts = await BlogPost.find({}, { contentJson: 1, coverImage: 1, live: 1, title: 1 }).lean();
  const users = posts.filter((post) => JSON.stringify([post.contentJson, post.coverImage, post.live?.html, post.live?.coverImage]).includes(key));
  if (users.length) {
    throw new BlogError("This image is used in a post", 409, { posts: users.map((p) => p.title || "Untitled") });
  }

  await removeImageFiles(item);
  await BlogMedia.deleteOne({ _id: item._id });
  return { deleted: true };
});

/**
 * Add one size to an uploaded image (multipart: `variant` or `og` file).
 * The editor uploads the largest size first (POST /media/), then the others
 * here, one per request.
 */
export const POST = adminRoute(async (request, { params }) => {
  if (Number(request.headers.get("content-length") || 0) > MAX_FILE_BYTES + 64 * 1024) {
    throw new BlogError("Upload is larger than 4 MB", 413);
  }
  if (!(await connectDB())) throw new BlogError("Database unavailable", 503);
  if (!mongoose.isValidObjectId(params.id)) throw new BlogError("Image not found", 404);
  const form = await request.formData();
  const og = form.get("og");
  const file = og && typeof og === "object" ? og : form.get("variant");
  if (!file || typeof file !== "object" || !file.size) throw new BlogError("No image received", 422);
  const media = await addImageVariant(blogModels().BlogMedia, params.id, Buffer.from(await file.arrayBuffer()), {
    og: file === og,
  });
  return { media: mediaToImageRef(media) };
});
