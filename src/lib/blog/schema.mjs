/**
 * The allowed vocabulary of a blog post, shared by the editor, the API
 * validation and the HTML renderer. Anything outside these lists is dropped
 * when a post is rendered, so the editor can only offer presets that follow
 * the site theme (no arbitrary fonts, sizes or colours).
 */
import { z } from "zod";

export const TEXT_ALIGNS = ["left", "center", "right", "justify"];
export const BLOCK_FONTS = ["sans", "serif", "mono"];
export const BLOCK_SIZES = ["sm", "md", "lg"];
export const BODY_FONTS = ["sans", "serif"];
export const IMAGE_LAYOUTS = ["inline", "wide", "full", "float-left", "float-right"];
export const CALLOUT_VARIANTS = ["info", "success", "warning", "note"];
export const GALLERY_COLUMNS = [2, 3];

export const LIMITS = {
  title: 200,
  excerpt: 300,
  metaTitle: 70,
  metaDescription: 160,
  tags: 10,
  tag: 40,
  contentBytes: 2_000_000,
};

/** Only images this site stored itself may appear in a post. */
const UPLOAD_SRC = /^\/uploads\/blog\/[a-z0-9][a-z0-9/_-]*\.(?:webp|jpe?g|png|gif)$/;

export function isUploadSrc(src) {
  return typeof src === "string" && UPLOAD_SRC.test(src) && !src.includes("..") && !src.includes("//");
}

const uploadSrc = z.string().max(300).refine(isUploadSrc, "Image must be an uploaded blog image");
const dimension = z.number().int().min(1).max(20000);

export const imageVariantSchema = z.object({
  width: dimension,
  height: dimension,
  src: uploadSrc,
});

export const imageRefSchema = z.object({
  mediaId: z.string().max(40).optional(),
  src: uploadSrc,
  variants: z.array(imageVariantSchema).max(6).optional(),
  width: dimension,
  height: dimension,
  alt: z.string().max(300).default(""),
  caption: z.string().max(500).optional(),
  ogSrc: uploadSrc.optional(),
});

const docSchema = z.looseObject({
  type: z.literal("doc"),
  content: z.array(z.any()).max(5000),
});

const optionalText = (max) => z.string().trim().max(max).optional();

/** Body of PATCH /api/admin/blog/posts/[id]/ (autosave). */
export const postPatchSchema = z
  .object({
    version: z.number().int().min(0),
    title: optionalText(LIMITS.title),
    slug: z.string().trim().toLowerCase().max(80).optional(),
    // The slug was derived from the title (not typed): resolve collisions by
    // suffixing (-2, -3) instead of rejecting.
    autoSlug: z.boolean().optional(),
    excerpt: optionalText(LIMITS.excerpt),
    metaTitle: optionalText(LIMITS.metaTitle * 2),
    metaDescription: optionalText(LIMITS.metaDescription * 2),
    canonicalUrl: z.string().trim().max(500).nullable().optional(),
    coverImage: imageRefSchema.nullable().optional(),
    tags: z.array(z.string().trim().min(1).max(LIMITS.tag)).max(LIMITS.tags).optional(),
    bodyFont: z.enum(BODY_FONTS).optional(),
    contentJson: docSchema.optional(),
  })
  .strict();

/** Body of POST /api/admin/blog/posts/[id]/publish/. */
export const publishSchema = z
  .object({
    publishedAt: z.iso.datetime({ offset: true }).optional(),
  })
  .strict();

/** An empty document, as the editor creates it. */
export function emptyDoc() {
  return { type: "doc", content: [{ type: "paragraph" }] };
}
