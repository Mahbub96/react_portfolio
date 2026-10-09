import { adminRoute } from "@/lib/blog/adminApi";
import { unpublishPost } from "@/lib/blog/adminPosts";

export const dynamic = "force-dynamic";

export const POST = adminRoute(async (request, { params }) => ({ post: await unpublishPost(params.id) }));
