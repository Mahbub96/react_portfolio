import { adminRoute } from "@/lib/blog/adminApi";
import { checkSlug } from "@/lib/blog/adminPosts";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  return checkSlug(String(searchParams.get("slug") || "").toLowerCase(), searchParams.get("id"));
});
