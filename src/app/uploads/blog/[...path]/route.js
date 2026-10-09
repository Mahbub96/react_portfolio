import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { uploadDir } from "@/lib/blog/env.mjs";

export const dynamic = "force-dynamic";

const TYPES = { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif" };
const SEGMENT = /^[a-z0-9][a-z0-9_-]*$/;
const FILE = /^([a-z0-9][a-z0-9_-]*)\.(webp|jpe?g|png|gif)$/;

function notFound() {
  return new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });
}

/**
 * Serves blog uploads from the persistent upload directory. File names are
 * content hashes, so responses are immutable and cached for a year. Nginx
 * may serve /uploads/blog/ directly instead (see env.example); this route is
 * the always-working fallback.
 */
export async function GET(request, { params }) {
  const parts = params.path || [];
  const fileName = parts[parts.length - 1] || "";
  const match = fileName.match(FILE);
  if (!match || parts.length > 4 || !parts.slice(0, -1).every((part) => SEGMENT.test(part))) {
    return notFound();
  }

  const root = resolve(uploadDir());
  const filePath = resolve(join(root, ...parts));
  if (!filePath.startsWith(root + sep)) return notFound();

  let info;
  try {
    info = await stat(filePath);
  } catch {
    return notFound();
  }
  if (!info.isFile()) return notFound();

  return new Response(Readable.toWeb(createReadStream(filePath)), {
    headers: {
      "Content-Type": TYPES[match[2]],
      "Content-Length": String(info.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-site",
    },
  });
}
