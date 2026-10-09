/**
 * Admin-side blog operations: list, create, autosave, publish, unpublish,
 * delete. Route handlers stay thin and call these after requireAdmin().
 *
 * Model: every post has a working copy (autosaved, never public) and a
 * `live` snapshot (what readers see). Publish renders the working copy with
 * the allow-list renderer and copies it into `live`, like Ghost.
 */
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { blogModels, MAX_REVISIONS } from "@/models/Blog";
import { renderDoc } from "./renderDoc.mjs";
import { emptyDoc, LIMITS } from "./schema.mjs";
import { isValidSlug, slugFromTitle } from "./slug.mjs";
import { postDescription, validateForPublish } from "./validate.mjs";
import { pingSearchEngines, refreshBlog } from "./revalidate.mjs";

export class BlogError extends Error {
  constructor(message, status = 400, details = undefined) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function models() {
  if (!(await connectDB())) throw new BlogError("Database unavailable", 503);
  return blogModels();
}

async function findPost(BlogPost, id) {
  if (!mongoose.isValidObjectId(id)) throw new BlogError("Post not found", 404);
  const post = await BlogPost.findById(id);
  if (!post) throw new BlogError("Post not found", 404);
  return post;
}

/** "draft" | "scheduled" | "published", as the admin list shows it. */
export function displayStatus(post, now = new Date()) {
  if (!post.live) return "draft";
  return new Date(post.live.publishedAt) > now ? "scheduled" : "published";
}

function summary(post) {
  return {
    id: String(post._id),
    title: post.title,
    slug: post.slug,
    status: displayStatus(post),
    tags: post.tags,
    coverImage: post.coverImage?.src ? { src: post.coverImage.src, alt: post.coverImage.alt } : null,
    updatedAt: post.updatedAt,
    publishedAt: post.live?.publishedAt || null,
    hasUnpublishedChanges: Boolean(post.live) && post.version > post.liveVersion,
  };
}

/** Full working copy for the editor. */
export function toEditorPost(post) {
  return {
    ...summary(post),
    excerpt: post.excerpt,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    canonicalUrl: post.canonicalUrl,
    coverImage: post.coverImage || null,
    bodyFont: post.bodyFont,
    contentJson: post.contentJson,
    version: post.version,
    previousSlugs: post.previousSlugs,
  };
}

export async function listPosts({ status = "all", q = "" } = {}) {
  const { BlogPost } = await models();
  const filter = {};
  const query = String(q).trim().slice(0, 100);
  if (query) {
    filter.title = { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }
  const posts = await BlogPost.find(filter, { contentJson: 0, "live.html": 0, "live.plainText": 0 })
    .sort({ updatedAt: -1 })
    .limit(500)
    .lean();
  const items = posts.map(summary);
  const counts = { all: items.length, draft: 0, scheduled: 0, published: 0 };
  for (const item of items) counts[item.status] += 1;
  return {
    counts,
    items: status === "all" ? items : items.filter((item) => item.status === status),
  };
}

async function uniqueSlug(BlogPost, base, exceptId = null) {
  let slug = base;
  for (let n = 2; await BlogPost.exists({ slug, ...(exceptId ? { _id: { $ne: exceptId } } : {}) }); n += 1) {
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function createPost({ title = "" } = {}) {
  const { BlogPost } = await models();
  const cleanTitle = String(title).trim().slice(0, LIMITS.title);
  const slug = await uniqueSlug(BlogPost, slugFromTitle(cleanTitle || "untitled"));
  const post = await BlogPost.create({ title: cleanTitle, slug, contentJson: emptyDoc() });
  return toEditorPost(post.toObject());
}

export async function getPost(id) {
  const { BlogPost } = await models();
  return toEditorPost((await findPost(BlogPost, id)).toObject());
}

/** Is `slug` free for post `id`? Used by the editor's live check. */
export async function checkSlug(slug, id = null) {
  const { BlogPost } = await models();
  if (!isValidSlug(slug)) return { available: false, reason: "invalid" };
  const taken = await BlogPost.exists({ slug, ...(mongoose.isValidObjectId(id) ? { _id: { $ne: id } } : {}) });
  return taken ? { available: false, reason: "taken" } : { available: true };
}

/**
 * Autosave. `patch.version` must match the stored version; a stale editor
 * (another tab saved meanwhile) gets 409 with the current version.
 */
export async function updatePost(id, patch) {
  const { BlogPost } = await models();
  const post = await findPost(BlogPost, id);
  if (patch.version !== post.version) {
    throw new BlogError("This post was changed in another tab or window", 409, { version: post.version });
  }

  const contentBytes = patch.contentJson ? Buffer.byteLength(JSON.stringify(patch.contentJson)) : 0;
  if (contentBytes > LIMITS.contentBytes) throw new BlogError("The post is too large to save", 413);

  const oldSlug = post.slug;
  if (patch.slug !== undefined && patch.slug !== post.slug && patch.autoSlug) {
    if (!isValidSlug(patch.slug)) patch.slug = post.slug;
    else patch.slug = await uniqueSlug(BlogPost, patch.slug, post._id);
  }
  const slugChanged = patch.slug !== undefined && patch.slug !== post.slug;
  if (slugChanged) {
    if (!isValidSlug(patch.slug)) throw new BlogError("Invalid URL slug", 422);
    if (await BlogPost.exists({ slug: patch.slug, _id: { $ne: post._id } })) {
      throw new BlogError("Another post already uses this URL", 409, { field: "slug" });
    }
    // A slug another post used to have is released to this one.
    await BlogPost.updateMany({ previousSlugs: patch.slug }, { $pull: { previousSlugs: patch.slug } });
    if (post.live) {
      // Published URL moves now; the old one 301-redirects to it.
      post.previousSlugs = [...new Set([...post.previousSlugs, oldSlug])].filter((s) => s !== patch.slug);
    }
  }

  for (const key of ["title", "slug", "excerpt", "metaTitle", "metaDescription", "canonicalUrl", "coverImage", "tags", "bodyFont", "contentJson"]) {
    if (patch[key] !== undefined) post[key] = patch[key];
  }
  if (patch.tags) post.tags = [...new Set(patch.tags.map((tag) => tag.trim()))];
  if (patch.contentJson) post.markModified("contentJson");
  post.version += 1;
  await post.save();

  if (slugChanged && post.live) refreshBlog([oldSlug, post.slug]);
  return { version: post.version, updatedAt: post.updatedAt, slug: post.slug, previousSlugs: post.previousSlugs };
}

function renderPost(post) {
  return renderDoc(post.contentJson, { eagerFirstImage: !post.coverImage });
}

/** Dry run of the publish checks for the editor's SEO checklist. */
export async function checkPost(id) {
  const { BlogPost } = await models();
  const post = (await findPost(BlogPost, id)).toObject();
  const rendered = renderPost(post);
  return { ...validateForPublish(post, rendered), wordCount: rendered.wordCount, readingMinutes: rendered.readingMinutes };
}

/**
 * Publish (or update) the live snapshot. `publishedAt` in the future
 * schedules the post; it becomes visible when that time passes.
 */
export async function publishPost(id, { publishedAt } = {}) {
  const { BlogPost, BlogRevision } = await models();
  const post = await findPost(BlogPost, id);
  const rendered = renderPost(post.toObject());
  const check = validateForPublish(post.toObject(), rendered);
  if (!check.ok) throw new BlogError("Fix these before publishing", 422, check);

  const now = new Date();
  const firstPublish = !post.live;
  const when = publishedAt ? new Date(publishedAt) : firstPublish ? now : post.live.publishedAt;

  post.live = {
    title: post.title.trim(),
    excerpt: post.excerpt,
    metaTitle: post.metaTitle,
    metaDescription: postDescription(post),
    canonicalUrl: post.canonicalUrl || null,
    coverImage: post.coverImage,
    tags: post.tags,
    bodyFont: post.bodyFont,
    html: rendered.html,
    toc: rendered.toc,
    plainText: rendered.plainText,
    wordCount: rendered.wordCount,
    readingMinutes: rendered.readingMinutes,
    publishedAt: when,
    updatedAt: firstPublish ? when : now,
    rendererVersion: rendered.rendererVersion,
  };
  post.status = "published";
  post.liveVersion = post.version;
  await post.save();

  await BlogRevision.create({ postId: post._id, version: post.version, title: post.title, contentJson: post.contentJson });
  const stale = await BlogRevision.find({ postId: post._id }).sort({ createdAt: -1 }).skip(MAX_REVISIONS).select("_id").lean();
  if (stale.length) await BlogRevision.deleteMany({ _id: { $in: stale.map((r) => r._id) } });

  refreshBlog([post.slug]);
  // Scheduled posts are pinged by the background check when they go live.
  if (when <= now && !post.canonicalUrl) {
    const status = await pingSearchEngines([post.slug]);
    if (status) await BlogPost.updateOne({ _id: post._id }, { indexNow: { lastPingAt: new Date(), lastStatus: status } });
  }

  return { post: toEditorPost(post.toObject()), warnings: check.warnings };
}

export async function unpublishPost(id) {
  const { BlogPost } = await models();
  const post = await findPost(BlogPost, id);
  const wasLive = Boolean(post.live);
  post.live = null;
  post.status = "draft";
  post.liveVersion = 0;
  await post.save();
  if (wasLive) {
    refreshBlog([post.slug, ...post.previousSlugs]);
    await pingSearchEngines([post.slug]); // recrawl sees the 404 and drops it
  }
  return toEditorPost(post.toObject());
}

export async function deletePost(id) {
  const { BlogPost, BlogRevision } = await models();
  const post = await findPost(BlogPost, id);
  const wasLive = Boolean(post.live);
  await BlogRevision.deleteMany({ postId: post._id });
  await post.deleteOne();
  if (wasLive) {
    refreshBlog([post.slug, ...post.previousSlugs]);
    await pingSearchEngines([post.slug]);
  }
  return { deleted: true };
}

export async function listTags() {
  const { BlogPost } = await models();
  return (await BlogPost.distinct("tags")).filter(Boolean).sort((a, b) => a.localeCompare(b));
}

/**
 * The working copy rendered exactly like a published post (same renderer,
 * same public shape), for /admin/preview/[id]/. Nothing is saved.
 */
export async function previewPost(id) {
  const { BlogPost } = await models();
  const post = (await findPost(BlogPost, id)).toObject();
  const rendered = renderPost(post);
  const now = new Date().toISOString();
  const cover = post.coverImage?.src ? post.coverImage : null;
  return {
    slug: post.slug,
    path: `/blog/${post.slug}/`,
    title: post.title || "Untitled",
    description: postDescription(post),
    excerpt: post.excerpt || post.metaDescription || "",
    coverImage: cover
      ? { ...cover, variants: (cover.variants || []).map(({ width, height, src }) => ({ width, height, src })) }
      : null,
    tags: post.tags || [],
    wordCount: rendered.wordCount,
    readingMinutes: rendered.readingMinutes,
    datePublished: post.live?.publishedAt ? new Date(post.live.publishedAt).toISOString() : now,
    dateModified: now,
    html: rendered.html,
    toc: rendered.toc,
    bodyFont: post.bodyFont === "serif" ? "serif" : "sans",
    status: displayStatus(post),
  };
}
