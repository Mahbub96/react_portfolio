import { redirect } from "next/navigation";
import { createPost } from "@/lib/blog/adminPosts";

export const dynamic = "force-dynamic";

// "New post" link target: create an empty draft and open it in the editor.
export default async function NewPostPage() {
  const post = await createPost();
  redirect(`/admin/posts/${post.id}/`);
}
