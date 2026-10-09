#!/usr/bin/env node
/**
 * Build-time generator for the site's static SEO files:
 *
 *   public/robots.txt
 *   public/sitemap.xml
 *   public/llms.txt  (+ public/.well-known/llms.txt)
 *   public/llms-full.txt
 *
 * WHY THESE ARE PHYSICAL FILES
 * ----------------------------
 * In production, nginx sits in front of the Next.js standalone server and
 * answers these paths from disk. Route handlers (app/sitemap.js, app/robots.js)
 * never received the request, which is how /sitemap.xml 404'd live while
 * working locally. Static files resolve regardless of the proxy config, and
 * being the ONLY source means there is nothing to drift.
 *
 * Runs with no database connection — it reads db.json, the same fallback the
 * app uses when MongoDB is unreachable.
 */

import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildSitemapEntries,
  renderSitemapXml,
} from "../src/lib/seo/sitemapBuilder.mjs";
import {
  renderLlmsTxt,
  renderLlmsFullTxt,
} from "../src/lib/seo/llmsProfile.mjs";
import { renderRobotsTxt } from "../src/lib/seo/robots.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const PUBLIC_DIR = join(ROOT, "public");

/** Load portfolio content from db.json without importing the Next.js runtime. */
async function loadContent() {
  const raw = await import(join(ROOT, "db.json"), {
    with: { type: "json" },
  });
  const db = raw.default || raw;
  return {
    projects: db.projects || [],
    skills: db.skills || [],
    experiences: db.experiences || [],
    educations: db.educations || [],
  };
}

/**
 * Date of the last commit touching any of `paths`, or null outside a git
 * checkout. Used for <lastmod> so it reflects real content changes instead of
 * the deploy date.
 */
function lastCommitDate(paths) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...paths], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

/** Source files whose changes alter what each URL shows. */
const SHARED = ["src/lib/seo/siteConfig.mjs", "src/components/Footer.jsx", "src/components/navbar"];
const ROUTE_SOURCES = {
  "/": ["db.json", "src/app/page.js", "src/components/banner", "src/components/projects", "src/components/skills", "src/components/experiences", "src/components/educations", "src/components/contact"],
  "/projects/": ["db.json", "src/app/projects/page.js", "src/components/projects"],
  "/skills/": ["db.json", "src/app/skills", "src/components/skills"],
  "/contact/": ["src/app/contact/page.js", "src/components/contact"],
  "/resume/": ["db.json", "src/app/resume", "src/lib/cvBuilder.js"],
};
const PROJECT_SOURCES = ["db.json", "src/lib/seo/caseStudies.mjs", "src/app/projects/[slug]/page.js", "src/components/projects/detail"];

function lastModifiedFor(kind, item) {
  if (kind === "route") {
    return lastCommitDate([...(ROUTE_SOURCES[item.path] || []), ...SHARED]);
  }
  return lastCommitDate([...PROJECT_SOURCES, ...SHARED]);
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
  const content = await loadContent();

  await writeArtifact("robots.txt", renderRobotsTxt());

  const entries = buildSitemapEntries({ projects: content.projects, lastModifiedFor });
  await writeArtifact("sitemap.xml", renderSitemapXml(entries));

  const llms = renderLlmsTxt(content);
  await writeArtifact("llms.txt", llms);
  // /llms.txt is the convention; /.well-known/ is what some agents probe first.
  await writeArtifact(".well-known/llms.txt", llms);
  await writeArtifact("llms-full.txt", renderLlmsFullTxt(content));

  console.log(
    `Done — ${entries.length} sitemap URLs, ${content.projects.length} projects.`
  );
}

main().catch((error) => {
  console.error("SEO artifact generation failed:", error);
  process.exit(1);
});
