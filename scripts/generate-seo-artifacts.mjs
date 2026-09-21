#!/usr/bin/env node
/**
 * Build-time generator for public/sitemap.xml, public/llms.txt and
 * public/.well-known/llms.txt.
 *
 * WHY THESE ARE PHYSICAL FILES
 * ----------------------------
 * In production, nginx sits in front of the Next.js standalone server and
 * returns its own 404 for /sitemap.xml before the request ever reaches the
 * app — which is why the route-based sitemap resolved locally but 404'd live,
 * while /robots.txt and /llms.txt worked. The difference is that those two
 * exist as real files in public/. Emitting the sitemap the same way makes it
 * resolve regardless of how the upstream proxy is configured.
 *
 * The Next.js route (src/app/sitemap.js) is kept as well: it serves live
 * database content between deploys. This script provides the statically served
 * fallback built from the same modules, so the two cannot disagree in shape.
 *
 * Runs with no database connection — it reads db.json, the same fallback the
 * app uses when MongoDB is unreachable.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildSitemapEntries,
  renderSitemapXml,
} from "../src/lib/seo/sitemapBuilder.mjs";
import { renderLlmsTxt } from "../src/lib/seo/llmsProfile.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const PUBLIC_DIR = join(ROOT, "public");

/** Load projects/skills from db.json without importing the Next.js runtime. */
async function loadContent() {
  const raw = await import(join(ROOT, "db.json"), {
    with: { type: "json" },
  });
  const db = raw.default || raw;
  return {
    projects: db.projects || [],
    skills: db.skills || [],
  };
}

async function writeArtifact(relativePath, contents) {
  const target = join(PUBLIC_DIR, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents, "utf8");
  const size = Buffer.byteLength(contents, "utf8");
  console.log(`  ✓ public/${relativePath} (${size} bytes)`);
}

async function main() {
  console.log("Generating SEO artifacts…");
  const { projects, skills } = await loadContent();

  const entries = buildSitemapEntries({ projects });
  await writeArtifact("sitemap.xml", renderSitemapXml(entries));

  const llms = renderLlmsTxt({ projects, skills });
  await writeArtifact("llms.txt", llms);
  // Served at both locations: /llms.txt is the convention, /.well-known/ is
  // what some agents probe first. Same bytes, generated once.
  await writeArtifact(".well-known/llms.txt", llms);

  console.log(
    `Done — ${entries.length} sitemap URLs, ${projects.length} projects.`
  );
}

main().catch((error) => {
  console.error("SEO artifact generation failed:", error);
  process.exit(1);
});
