import mongoose from "mongoose";
import { collectionPrefix } from "@/lib/blog/env.mjs";

/**
 * Blog collections. Names carry the environment prefix (see lib/blog/env),
 * so test and development posts never mix with production ones even on a
 * shared database. Models are created on first use because the prefix is a
 * runtime setting.
 */

const ImageVariant = new mongoose.Schema(
  { width: Number, height: Number, src: String },
  { _id: false }
);

const ImageRef = new mongoose.Schema(
  {
    mediaId: String,
    src: String,
    variants: [ImageVariant],
    width: Number,
    height: Number,
    alt: String,
    caption: String,
    ogSrc: String,
  },
  { _id: false }
);

// What the public site renders. Autosave never touches it; only publish does.
const LiveSnapshot = new mongoose.Schema(
  {
    title: String,
    excerpt: String,
    metaTitle: String,
    metaDescription: String,
    canonicalUrl: String,
    coverImage: ImageRef,
    tags: [String],
    bodyFont: String,
    html: String,
    toc: [{ _id: false, id: String, text: String, level: Number }],
    plainText: String,
    wordCount: Number,
    readingMinutes: Number,
    publishedAt: Date,
    updatedAt: Date,
    rendererVersion: Number,
  },
  { _id: false }
);

const BlogPostSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    previousSlugs: { type: [String], index: true, default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },

    // Working copy (autosaved by the editor)
    title: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    canonicalUrl: { type: String, default: null },
    coverImage: { type: ImageRef, default: null },
    tags: { type: [String], index: true, default: [] },
    bodyFont: { type: String, enum: ["sans", "serif"], default: "sans" },
    contentJson: { type: mongoose.Schema.Types.Mixed, default: () => ({ type: "doc", content: [{ type: "paragraph" }] }) },
    schemaVersion: { type: Number, default: 1 },

    // Optimistic concurrency: every save bumps it; a stale client gets 409.
    version: { type: Number, default: 1 },
    live: { type: LiveSnapshot, default: null },
    liveVersion: { type: Number, default: 0 },

    indexNow: { lastPingAt: Date, lastStatus: Number },
    source: { type: String, enum: ["cms", "markdown-import"], default: "cms" },
  },
  { timestamps: true, minimize: false }
);
BlogPostSchema.index({ status: 1, "live.publishedAt": -1 });

const BlogMediaSchema = new mongoose.Schema(
  {
    hash: { type: String, required: true, unique: true },
    kind: { type: String, enum: ["image", "youtube-thumb"], default: "image" },
    mime: String,
    width: Number,
    height: Number,
    bytes: Number,
    variants: [{ _id: false, width: Number, height: Number, bytes: Number, src: String }],
    ogSrc: String,
    originalName: String,
  },
  { timestamps: true }
);

const BlogRevisionSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    version: Number,
    title: String,
    contentJson: mongoose.Schema.Types.Mixed,
    reason: { type: String, enum: ["publish", "restore"], default: "publish" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const MAX_REVISIONS = 30;

function model(name, schema, collection) {
  const prefix = collectionPrefix();
  const modelName = `${prefix}${name}`;
  return mongoose.models[modelName] || mongoose.model(modelName, schema, `${prefix}${collection}`);
}

export function blogModels() {
  return {
    BlogPost: model("BlogPost", BlogPostSchema, "blog_posts"),
    BlogMedia: model("BlogMedia", BlogMediaSchema, "blog_media"),
    BlogRevision: model("BlogRevision", BlogRevisionSchema, "blog_revisions"),
  };
}
