/**
 * Blog image storage.
 *
 * The browser resizes and re-encodes images before upload (sharp cannot run
 * on the server), so the server's job is to distrust the upload: it checks
 * each file's magic bytes, reads the real dimensions, names files by content
 * hash (immutable, cache-forever URLs, automatic de-duplication) and writes
 * them under the persistent upload directory. SVG is never accepted.
 */
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { imageSize } from "image-size";
import { UPLOAD_URL_PREFIX, uploadDir } from "./env.mjs";

export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_REQUEST_BYTES = 8 * 1024 * 1024;
export const MAX_VARIANTS = 4;

const TYPES = {
  webp: { mime: "image/webp", test: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  jpg: { mime: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  png: { mime: "image/png", test: (b) => b.readUInt32BE(0) === 0x89504e47 },
  gif: { mime: "image/gif", test: (b) => /^GIF8[79]a$/.test(b.toString("ascii", 0, 6)) },
};

export class MediaError extends Error {}

/** Validate one uploaded buffer; returns { ext, mime, width, height }. */
export function inspectImage(buffer) {
  if (!buffer || buffer.length < 16) throw new MediaError("Empty or truncated image");
  if (buffer.length > MAX_FILE_BYTES) throw new MediaError("Image is larger than 4 MB");
  const ext = Object.keys(TYPES).find((key) => TYPES[key].test(buffer));
  if (!ext) throw new MediaError("Only WebP, JPEG, PNG and GIF images are accepted");

  let size;
  try {
    size = imageSize(buffer);
  } catch {
    throw new MediaError("Unreadable image");
  }
  const detected = size.type === "jpeg" ? "jpg" : size.type;
  if (detected !== ext) throw new MediaError("Image content does not match its type");
  if (!size.width || !size.height || size.width > 8000 || size.height > 8000) {
    throw new MediaError("Image dimensions are out of range");
  }
  return { ext, mime: TYPES[ext].mime, width: size.width, height: size.height };
}

function datedDir(now = new Date()) {
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}/${month}`;
}

async function writeVariant(relDir, name, buffer) {
  const dir = join(uploadDir(), relDir);
  await mkdir(dir, { recursive: true });
  try {
    await writeFile(join(dir, name), buffer, { flag: "wx", mode: 0o644 });
  } catch (error) {
    if (error.code !== "EEXIST") throw error; // same content already stored
  }
  return `${UPLOAD_URL_PREFIX}${relDir}/${name}`;
}

/**
 * Store an image's variants (largest first is not required) and an optional
 * 1200x630 social-card crop. Returns the BlogMedia document.
 *
 * @param {import("mongoose").Model} BlogMedia
 * @param {{ variants: Buffer[], og?: Buffer|null, kind?: string, originalName?: string }} input
 */
export async function storeImage(BlogMedia, { variants, og = null, kind = "image", originalName = "" }) {
  if (!variants?.length) throw new MediaError("No image received");
  if (variants.length > MAX_VARIANTS) throw new MediaError(`At most ${MAX_VARIANTS} sizes per image`);

  // Validate everything before writing anything, so a rejected upload
  // never leaves orphan files behind.
  const inspected = variants.map((buffer) => ({ buffer, ...inspectImage(buffer) }));
  inspected.sort((a, b) => b.width - a.width);
  const largest = inspected[0];
  const ogInfo = og ? inspectImage(og) : null;
  if (ogInfo && (ogInfo.width !== 1200 || ogInfo.height !== 630)) {
    throw new MediaError("Social image must be 1200x630");
  }

  const hash = createHash("sha256").update(largest.buffer).digest("hex");
  const existing = await BlogMedia.findOne({ hash }).lean();
  if (existing) return existing;

  const short = hash.slice(0, 12);
  const relDir = datedDir();
  const stored = [];
  const seenWidths = new Set();
  for (const item of inspected) {
    if (seenWidths.has(item.width)) continue;
    seenWidths.add(item.width);
    const src = await writeVariant(relDir, `${short}-${item.width}.${item.ext}`, item.buffer);
    stored.push({ width: item.width, height: item.height, bytes: item.buffer.length, src });
  }

  const ogSrc = og ? await writeVariant(relDir, `${short}-og.${ogInfo.ext}`, og) : undefined;

  return (
    await BlogMedia.create({
      hash,
      kind,
      mime: largest.mime,
      width: largest.width,
      height: largest.height,
      bytes: largest.buffer.length,
      variants: stored.sort((a, b) => a.width - b.width),
      ogSrc,
      originalName: String(originalName).slice(0, 200),
    })
  ).toObject();
}

/**
 * Add one smaller size (or the 1200x630 social crop) to an existing image.
 * Lets the editor upload one file per request, keeping every request far
 * below nginx's default 1 MB body limit. A size must keep the original's
 * aspect ratio (within 2%) and be narrower than it.
 */
export async function addImageVariant(BlogMedia, id, buffer, { og = false } = {}) {
  const media = await BlogMedia.findById(id);
  if (!media) throw new MediaError("Image not found");
  const info = inspectImage(buffer);
  const short = media.hash.slice(0, 12);
  const largestSrc = [...media.variants].sort((a, b) => b.width - a.width)[0]?.src || "";
  const relDir = largestSrc.slice(UPLOAD_URL_PREFIX.length).split("/").slice(0, -1).join("/");
  if (!relDir) throw new MediaError("Image has no stored files");

  if (og) {
    if (info.width !== 1200 || info.height !== 630) throw new MediaError("Social image must be 1200x630");
    media.ogSrc = await writeVariant(relDir, `${short}-og.${info.ext}`, buffer);
  } else {
    const ratio = media.width / media.height;
    if (info.width >= media.width) throw new MediaError("A size must be smaller than the original");
    if (Math.abs(info.width / info.height - ratio) / ratio > 0.02) {
      throw new MediaError("A size must keep the original aspect ratio");
    }
    if (!media.variants.some((v) => v.width === info.width)) {
      if (media.variants.length >= MAX_VARIANTS) throw new MediaError(`At most ${MAX_VARIANTS} sizes per image`);
      const src = await writeVariant(relDir, `${short}-${info.width}.${info.ext}`, buffer);
      media.variants.push({ width: info.width, height: info.height, bytes: buffer.length, src });
      media.variants.sort((a, b) => a.width - b.width);
    }
  }
  await media.save();
  return media.toObject();
}

/** Delete a media item's files (callers check it is unused first). */
export async function removeImageFiles(media) {
  const srcs = [...(media.variants || []).map((v) => v.src), media.ogSrc].filter(Boolean);
  await Promise.all(
    srcs.map((src) => rm(join(uploadDir(), src.slice(UPLOAD_URL_PREFIX.length)), { force: true }))
  );
}

/** The shape the editor receives for an uploaded image. */
export function mediaToImageRef(media) {
  const variants = [...(media.variants || [])].sort((a, b) => a.width - b.width);
  const largest = variants[variants.length - 1];
  return {
    mediaId: String(media._id),
    src: largest?.src,
    variants: variants.map(({ width, height, src }) => ({ width, height, src })),
    width: largest?.width || media.width,
    height: largest?.height || media.height,
    ogSrc: media.ogSrc || undefined,
  };
}
