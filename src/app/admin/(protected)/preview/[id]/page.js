import Link from "next/link";
import { notFound } from "next/navigation";
import PostArticle from "@/components/blog/PostArticle";
import { previewPost } from "@/lib/blog/adminPosts";
import blogStyles from "@/app/blog/blog.module.css";
import styles from "@/components/admin/admin.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preview" };

// The working copy rendered with the public template and renderer.
export default async function PreviewPage({ params }) {
  let post;
  try {
    post = await previewPost(params.id);
  } catch {
    notFound();
  }
  return (
    <>
      <div className={styles.previewBar}>
        <span className={styles.status}>Preview</span>
        <span>Unpublished changes are shown exactly as readers will see them.</span>
        <Link href={`/admin/posts/${params.id}/`} className={`${styles.btn} ${styles.btnSmall}`}>
          Back to editor
        </Link>
      </div>
      <main className={blogStyles.post}>
        <PostArticle post={post} />
      </main>
    </>
  );
}
