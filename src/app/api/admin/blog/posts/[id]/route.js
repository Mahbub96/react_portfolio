import { adminRoute } from "@/lib/blog/adminApi";
import { deletePost, getPost, updatePost } from "@/lib/blog/adminPosts";
import { postPatchSchema } from "@/lib/blog/schema.mjs";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async (request, { params }) => ({ post: await getPost(params.id) }));

// Autosave: partial update guarded by the post's version number.
export const PATCH = adminRoute(async (request, { params }) => {
  const patch = postPatchSchema.parse(await request.json());
  return updatePost(params.id, patch);
});

export const DELETE = adminRoute(async (request, { params }) => deletePost(params.id));
