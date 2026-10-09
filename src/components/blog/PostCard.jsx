import Link from "next/link";
import { formatDate } from "@/lib/blog/posts.mjs";
import BlogImage from "./BlogImage";
import styles from "@/app/blog/blog.module.css";

/** Post teaser for the blog index and "Keep reading". */
export default function PostCard({ post, featured = false, headingLevel = 2, eager = false }) {
  const Heading = `h${headingLevel}`;
  return (
    <article className={`${styles.card} ${featured ? styles.featured : ""}`}>
      <div className={styles.cardMedia}>
        {post.coverImage ? (
          <BlogImage
            image={post.coverImage}
            alt=""
            eager={eager}
            sizes={featured ? "(min-width: 900px) 600px, 100vw" : "(min-width: 760px) 360px, 100vw"}
          />
        ) : (
          <div className={styles.cardPlaceholder} aria-hidden="true">
            {"</>"}
          </div>
        )}
      </div>
      <div className={styles.cardBody}>
        {featured ? <span className={styles.featuredLabel}>Latest</span> : null}
        {post.tags.length ? (
          <ul className={styles.tags} aria-label="Topics">
            {post.tags.slice(0, 3).map((tag) => (
              <li key={tag} className={styles.tag}>
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        <Heading className={styles.cardTitle}>
          <Link href={post.path}>{post.title}</Link>
        </Heading>
        {post.excerpt ? <p className={styles.cardExcerpt}>{post.excerpt}</p> : null}
        <p className={styles.meta}>
          <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time>
          <span className={styles.dot} aria-hidden="true" />
          <span>{post.readingMinutes} min read</span>
        </p>
      </div>
    </article>
  );
}
