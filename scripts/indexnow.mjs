#!/usr/bin/env node
/**
 * Submit every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver…).
 *
 * Run after a production deploy:  pnpm seo:indexnow
 *
 * URLs come from the static public/sitemap-pages.xml (pages and case
 * studies) plus the live https://mahbub.dev/blog/sitemap.xml (published
 * posts). Publishing a post from the admin already pings IndexNow for that
 * post; this covers everything after a deploy.
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { INDEXNOW_HOST, submitIndexNow } from "../src/lib/seo/indexnow.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

async function main() {
  const urlList = locs(await readFile(join(ROOT, "public", "sitemap-pages.xml"), "utf8"));

  try {
    const blog = await fetch(`https://${INDEXNOW_HOST}/blog/sitemap.xml`, { signal: AbortSignal.timeout(15000) });
    if (blog.ok) urlList.push(...locs(await blog.text()));
    else console.warn(`Blog sitemap: HTTP ${blog.status}; submitting static pages only`);
  } catch (error) {
    console.warn(`Blog sitemap unreachable (${error.message}); submitting static pages only`);
  }
  if (!urlList.length) throw new Error("No URLs found");

  // 200 = accepted, 202 = accepted (key validation pending)
  const status = await submitIndexNow([...new Set(urlList)]);
  console.log(`IndexNow: HTTP ${status} for ${urlList.length} URLs`);
  if (![200, 202].includes(status)) process.exit(1);
}

main().catch((error) => {
  console.error("IndexNow submission failed:", error.message);
  process.exit(1);
});
