"use client";

/**
 * Browser-side image preparation. The server cannot run sharp, so images are
 * resized and re-encoded here: decoding with createImageBitmap applies the
 * EXIF orientation, and re-encoding through a canvas drops all metadata
 * (camera, GPS). Each size is uploaded in its own request so every request
 * stays far below nginx's default 1 MB body limit.
 */
import { adminFetch } from "../adminApi";

export const WIDTHS = [480, 960, 1600];
const OG = { width: 1200, height: 630 };
const QUALITY = 0.82;

export const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic";

function makeCanvas(width, height) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

async function encode(canvas) {
  const toBlob = (type, quality) =>
    canvas.convertToBlob
      ? canvas.convertToBlob({ type, quality })
      : new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  const webp = await toBlob("image/webp", QUALITY);
  // Older Safari silently falls back to PNG for WebP; use JPEG then.
  return webp?.type === "image/webp" ? webp : toBlob("image/jpeg", 0.85);
}

function draw(bitmap, width, height, crop) {
  const canvas = makeCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  if (crop) ctx.drawImage(bitmap, crop.x, crop.y, crop.w, crop.h, 0, 0, width, height);
  else ctx.drawImage(bitmap, 0, 0, width, height);
  return encode(canvas);
}

/** Centre crop of the bitmap to the 1200x630 social card ratio. */
function ogCrop(bitmap) {
  const ratio = OG.width / OG.height;
  let w = bitmap.width;
  let h = Math.round(w / ratio);
  if (h > bitmap.height) {
    h = bitmap.height;
    w = Math.round(h * ratio);
  }
  return { x: Math.round((bitmap.width - w) / 2), y: Math.round((bitmap.height - h) / 2), w, h };
}

/**
 * @returns {Promise<{ variants: Blob[], og: Blob|null }>} variants largest first
 */
export async function prepareImage(file, { withOg = false } = {}) {
  if (!file?.type?.startsWith("image/") || file.type === "image/svg+xml") {
    throw new Error("Choose a JPEG, PNG, WebP or GIF image (SVG is not allowed).");
  }
  // Animated GIFs would lose their animation on a canvas: upload as-is.
  if (file.type === "image/gif") {
    if (file.size > 4 * 1024 * 1024) throw new Error("GIFs must be under 4 MB.");
    return { variants: [file], og: null };
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This image format cannot be read by the browser.");
  }

  try {
    const widths = WIDTHS.filter((w) => w < bitmap.width);
    widths.push(Math.min(bitmap.width, WIDTHS[WIDTHS.length - 1]));
    const unique = [...new Set(widths)].sort((a, b) => b - a);
    const variants = [];
    for (const width of unique) {
      const height = Math.round((bitmap.height * width) / bitmap.width);
      variants.push(await draw(bitmap, width, height));
    }
    const og = withOg ? await draw(bitmap, OG.width, OG.height, ogCrop(bitmap)) : null;
    return { variants, og };
  } finally {
    bitmap.close?.();
  }
}

const formWith = (field, blob, name) => {
  const form = new FormData();
  form.append(field, blob, name);
  return form;
};

/**
 * Prepare and upload an image. Resolves to the image reference the editor
 * stores: { mediaId, src, variants, width, height, ogSrc? }.
 */
export async function uploadImage(file, { withOg = false, onProgress } = {}) {
  const { variants, og } = await prepareImage(file, { withOg });
  const ext = (blob) => (blob.type === "image/webp" ? "webp" : blob.type === "image/gif" ? "gif" : "jpg");
  const steps = variants.length + (og ? 1 : 0);
  let done = 0;
  const tick = () => onProgress?.(Math.round((++done / steps) * 100));

  const first = formWith("variant", variants[0], `image.${ext(variants[0])}`);
  first.append("name", file.name || "");
  let { media } = await adminFetch("/media/", { method: "POST", form: first });
  tick();

  for (const blob of variants.slice(1)) {
    // Already stored (same image uploaded before): skip the extra sizes.
    if (media.variants.length >= variants.length) break;
    ({ media } = await adminFetch(`/media/${media.mediaId}/`, { method: "POST", form: formWith("variant", blob, `image.${ext(blob)}`) }));
    tick();
  }
  if (og && !media.ogSrc) {
    ({ media } = await adminFetch(`/media/${media.mediaId}/`, { method: "POST", form: formWith("og", og, `og.${ext(og)}`) }));
    tick();
  }
  onProgress?.(100);
  return media;
}
