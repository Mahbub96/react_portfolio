/**
 * Public blog data: published posts from MongoDB, cached.
 *
 * Results are cached under the "blog" tag (dropped on publish, unpublish,
 * slug change and delete; see revalidate.mjs) and refreshed at least every
 * 5 minutes. The cache holds every live post, scheduled ones included, and
 * the "publish time has passed" filter runs on each request, so a scheduled
 * post appears at exactly its time with no cron job and no stale window.
 * Only `live` snapshots are ever read: drafts and unpublished changes
 * cannot reach a public page.
 */
import { unstable_cache } from "next/cache";
import connectDB from "@/lib/mongodb";
import { blogModels } from "@/models/Blog";
import { collectionPrefix } from "./env.mjs";
import { BLOG_TAG, pingSearchEngines, postPath } from "./revalidate.mjs";

// Upper bound on how long post data is cached between publishes (publish
// actions drop the cache immediately). BLOG_CACHE_SECONDS overrides it.
export const BLOG_REVALIDATE_SECONDS = Number(process.env.BLOG_CACHE_SECONDS) || 300;

const LIST_FIELDS = {
  slug: 1,
  "indexNow.lastPingAt": 1,
  "live.title": 1,
  "live.excerpt": 1,
  "live.metaTitle": 1,
  "live.metaDescription": 1,
  "live.canonicalUrl": 1,
  "live.coverImage": 1,
  "live.tags": 1,
  "live.wordCount": 1,
  "live.readingMinutes": 1,
  "live.publishedAt": 1,
  "live.updatedAt": 1,
};

const iso = (date) => (date ? new Date(date).toISOString() : null);

/** Plain, serialisable public view of a post's live snapshot. */
function toPublicPost(doc, { full = false } = {}) {
  const live = doc.live;
  const cover = live.coverImage?.src ? live.coverImage : null;
  const post = {
    slug: doc.slug,
    path: postPath(doc.slug),
    title: live.title,
    metaTitle: live.metaTitle || "",
    description: live.metaDescription || live.excerpt || "",
    excerpt: live.excerpt || live.metaDescription || "",
    canonicalUrl: live.canonicalUrl || null,
    coverImage: cover
      ? {
          src: cover.src,
          alt: cover.alt || "",
          caption: cover.caption || "",
          width: cover.width,
          height: cover.height,
          variants: (cover.variants || []).map(({ width, height, src }) => ({ width, height, src })),
          ogSrc: cover.ogSrc || null,
        }
      : null,
    // Social/structured-data image: the 1200x630 crop when there is one.
    image: cover ? cover.ogSrc || cover.src : null,
    tags: live.tags || [],
    wordCount: live.wordCount || 0,
    readingMinutes: live.readingMinutes || 1,
    datePublished: iso(live.publishedAt),
    dateModified: iso(live.updatedAt || live.publishedAt),
  };
  if (full) {
    post.html = live.html || "";
    post.toc = (live.toc || []).map(({ id, text, level }) => ({ id, text, level }));
    post.bodyFont = live.bodyFont === "serif" ? "serif" : "sans";
  }
  return post;
}

async function postModel() {
  // Never read the database while `next build` prerenders: the build
  // machine's environment is not the deployed site's.
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  if (!(await connectDB())) return null;
  return blogModels().BlogPost;
}

const LIVE = { live: { $ne: null } };
const isVisible = (post, now = Date.now()) => Boolean(post) && Date.parse(post.datePublished) <= now;

/**
 * Scheduled posts that went live since the last ping get one IndexNow
 * submission. Runs at most once per cache window, production only.
 */
function pingNewlyLive(BlogPost, docs) {
  const now = new Date();
  const pending = docs.filter(
    (doc) =>
      new Date(doc.live.publishedAt) <= now &&
      !doc.live.canonicalUrl &&
      (!doc.indexNow?.lastPingAt || new Date(doc.indexNow.lastPingAt) < new Date(doc.live.publishedAt))
  );
  if (!pending.length) return;
  pingSearchEngines(pending.map((doc) => doc.slug))
    .then((status) =>
      status
        ? BlogPost.updateMany(
            { _id: { $in: pending.map((doc) => doc._id) } },
            { indexNow: { lastPingAt: new Date(), lastStatus: status } }
          )
        : null
    )
    .catch(() => {});
}

const cachedList = unstable_cache(
  async () => {
    const BlogPost = await postModel();
    if (!BlogPost) return [];
    const docs = await BlogPost.find(LIVE, LIST_FIELDS)
      .sort({ "live.publishedAt": -1 })
      .limit(1000)
      .lean();
    pingNewlyLive(BlogPost, docs);
    return docs.map((doc) => toPublicPost(doc));
  },
  ["blog-published-list", collectionPrefix()],
  { tags: [BLOG_TAG], revalidate: BLOG_REVALIDATE_SECONDS }
);

const cachedPost = unstable_cache(
  async (slug) => {
    const BlogPost = await postModel();
    if (!BlogPost) return null;
    const doc = await BlogPost.findOne({ slug, ...LIVE }, { contentJson: 0, "live.plainText": 0 }).lean();
    return doc ? toPublicPost(doc, { full: true }) : null;
  },
  ["blog-published-post", collectionPrefix()],
  { tags: [BLOG_TAG], revalidate: BLOG_REVALIDATE_SECONDS }
);

const cachedRedirect = unstable_cache(
  async (slug) => {
    const BlogPost = await postModel();
    if (!BlogPost) return null;
    const doc = await BlogPost.findOne({ previousSlugs: slug, ...LIVE }, { slug: 1, "live.publishedAt": 1 }).lean();
    return doc ? { slug: doc.slug, datePublished: iso(doc.live.publishedAt) } : null;
  },
  ["blog-slug-redirect", collectionPrefix()],
  { tags: [BLOG_TAG], revalidate: BLOG_REVALIDATE_SECONDS }
);

/** Published posts, newest first (no body HTML). */
export async function getPublishedPosts() {
  try {
    const now = Date.now();
    return (await cachedList()).filter((post) => isVisible(post, now));
  } catch (error) {
    console.error("Blog list unavailable:", error.message);
    return [];
  }
}

/** One published post with its HTML and table of contents, or null. */
export async function getPublishedPost(slug) {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const post = await cachedPost(slug);
  return isVisible(post) ? post : null;
}

/** Current slug for a renamed post's old slug, or null. */
export async function findRenamedSlug(slug) {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const target = await cachedRedirect(slug);
  return isVisible(target) ? target.slug : null;
}

/** Up to `limit` other posts, preferring shared tags, then recency. */
export function relatedPosts(post, posts, limit = 3) {
  const tags = new Set(post.tags);
  return posts
    .filter((other) => other.slug !== post.slug)
    .map((other, index) => ({ other, score: other.tags.filter((tag) => tags.has(tag)).length * 100 - index }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ other }) => other);
}

/** Posts that belong in the sitemap and IndexNow (no external canonical). */
export function indexablePosts(posts) {
  return posts.filter((post) => !post.canonicalUrl);
}
