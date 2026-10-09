import { adminRoute } from "@/lib/blog/adminApi";
import { createPost, listPosts } from "@/lib/blog/adminPosts";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const status = ["all", "draft", "scheduled", "published"].includes(searchParams.get("status"))
    ? searchParams.get("status")
    : "all";
  return listPosts({ status, q: searchParams.get("q") || "" });
});

export const POST = adminRoute(async (request) => {
  const body = await request.json().catch(() => ({}));
  return { post: await createPost({ title: typeof body.title === "string" ? body.title : "" }) };
});
