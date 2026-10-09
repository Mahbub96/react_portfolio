import { adminRoute } from "@/lib/blog/adminApi";
import { listTags } from "@/lib/blog/adminPosts";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async () => ({ tags: await listTags() }));
