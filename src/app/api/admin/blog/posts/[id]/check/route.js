import { adminRoute } from "@/lib/blog/adminApi";
import { checkPost } from "@/lib/blog/adminPosts";

export const dynamic = "force-dynamic";

// Publish checks without publishing, for the editor's SEO checklist.
export const GET = adminRoute(async (request, { params }) => checkPost(params.id));
