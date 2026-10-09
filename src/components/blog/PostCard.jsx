import Link from "next/link";
import { LuArrowUpRight } from "react-icons/lu";
import { formatDate } from "@/lib/blog/posts.mjs";
import BlogImage from "./BlogImage";
import styles from "@/app/blog/blog.module.css";

/** Modern, compact Post card with 70% content / 30% image layout */
export default function PostCard({ post, featured = false, headingLevel = 2, eager = false, variant = "list" }) {
  const Heading = `h${headingLevel}`;
  const hasCover = Boolean(post.coverImage);

  return (
    <article
      className={`${styles.card} ${featured ? styles.featured : ""} ${variant === "grid" ? styles.gridCard : styles.listCard} ${!hasCover ? styles.noCover : ""}`}
    >
      <div className={styles.cardBody}>
        <div className={styles.cardMetaTop}>
          {featured ? <span className={styles.featuredBadge}>Featured</span> : null}
          {post.tags?.length ? (
            <span className={styles.tagPrimary}>{post.tags[0]}</span>
          ) : null}
          <span className={styles.dot} aria-hidden="true" />
          <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.readTime}>{post.readingMinutes} min read</span>
        </div>

        <Heading className={styles.cardTitle}>
          <Link href={post.path}>
            {post.title}
          </Link>
        </Heading>

        {post.excerpt ? (
          <p className={styles.cardExcerpt}>{post.excerpt}</p>
        ) : null}

        <div className={styles.cardFooter}>
          {post.tags?.length > 1 ? (
            <div className={styles.tagsSecondary}>
              {post.tags.slice(1, 4).map((tag) => (
                <span key={tag} className={styles.miniTag}>
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          <span className={styles.readAction}>
            Read article <LuArrowUpRight aria-hidden="true" />
          </span>
        </div>
      </div>

      {hasCover ? (
        <div className={styles.cardMedia}>
          <BlogImage
            image={post.coverImage}
            alt=""
            eager={eager}
            sizes={featured ? "(min-width: 900px) 340px, 100vw" : "(min-width: 760px) 240px, 100vw"}
          />
        </div>
      ) : null}
    </article>
  );
}
