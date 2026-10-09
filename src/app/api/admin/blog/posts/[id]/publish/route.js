import { adminRoute } from "@/lib/blog/adminApi";
import { publishPost } from "@/lib/blog/adminPosts";
import { publishSchema } from "@/lib/blog/schema.mjs";

export const dynamic = "force-dynamic";

// Publish now, update a live post, or schedule with a future publishedAt.
export const POST = adminRoute(async (request, { params }) => {
  const body = publishSchema.parse(await request.json().catch(() => ({})));
  return publishPost(params.id, body);
});
