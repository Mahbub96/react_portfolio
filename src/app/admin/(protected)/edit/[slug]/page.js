import { notFound, redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { blogModels } from "@/models/Blog";

export const dynamic = "force-dynamic";

// "Edit this post" from a public page: resolve the slug (or an old slug) to
// the post and open it in the editor.
export default async function EditBySlugPage({ params }) {
  const slug = String(params.slug || "");
  if (!/^[a-z0-9-]{1,80}$/.test(slug) || !(await connectDB())) notFound();
  const post = await blogModels()
    .BlogPost.findOne({ $or: [{ slug }, { previousSlugs: slug }] }, { _id: 1 })
    .lean();
  if (!post) notFound();
  redirect(`/admin/posts/${post._id}/`);
}
