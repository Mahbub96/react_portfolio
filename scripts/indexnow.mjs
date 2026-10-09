#!/usr/bin/env node
/**
 * Submit every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver…).
 *
 * Run after a production deploy:  pnpm seo:indexnow
 *
 * The key file public/28df78752bbf6920a66c71aa2f29ece0.txt must be live at
 * https://mahbub.dev/28df78752bbf6920a66c71aa2f29ece0.txt — IndexNow fetches it to prove ownership.
 * The key is not a secret; it only proves the submitter controls the host.
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "mahbub.dev";
const KEY = "28df78752bbf6920a66c71aa2f29ece0";

async function main() {
  const sitemap = await readFile(join(ROOT, "public", "sitemap.xml"), "utf8");
  const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!urlList.length) throw new Error("No URLs found in public/sitemap.xml");

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList,
    }),
  });

  // 200 = accepted, 202 = accepted (key validation pending)
  console.log(`IndexNow: HTTP ${response.status} for ${urlList.length} URLs`);
  if (![200, 202].includes(response.status)) {
    console.error(await response.text());
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("IndexNow submission failed:", error.message);
  process.exit(1);
});
