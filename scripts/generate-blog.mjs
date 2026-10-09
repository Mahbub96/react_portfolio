#!/usr/bin/env node
/**
 * Build-time blog generator.
 *
 *   content/blog/<slug>.md  →  src/content/blog.generated.json  (pages)
 *                           →  public/feed.xml                  (RSS)
 *
 * Posts are Markdown with a small front-matter block:
 *
 *   ---
 *   title: Fine-tuning Whisper for Bangla
 *   description: One or two sentences, under 160 characters.
 *   date: 2026-10-20
 *   updated: 2026-10-22        (optional)
 *   tags: [Whisper, ASR, Bangla]
 *   draft: true                (optional — drafts never reach production)
 *   ---
 *
 * WHY BUILD TIME: the server is tiny, so Markdown is rendered here on the
 * build machine and the pages are prerendered static HTML — no Markdown
 * library ships to the server or the browser.
 *
 * DRAFTS: excluded unless BLOG_INCLUDE_DRAFTS=1 (used for test.mahbub.dev
 * review builds). Even then they render with `noindex` and are kept out of the
 * sitemap, RSS and llms.txt.
 */

import { execFileSync } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Marked } from "marked";

import { SITE_ORIGIN, SITE_AUTHOR, SITE_NAME } from "../src/lib/seo/siteConfig.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_DIR = join(ROOT, "content", "blog");
const OUT_JSON = join(ROOT, "src", "content", "blog.generated.json");
const OUT_FEED = join(ROOT, "public", "feed.xml");
const INCLUDE_DRAFTS = process.env.BLOG_INCLUDE_DRAFTS === "1";
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Heading text → stable id for in-page links. */
const headingId = (text) =>
  String(text)
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Markdown renderer:
 *  - raw HTML in posts is escaped (Markdown only, nothing executable);
 *  - the post title is the page <h1>; Markdown "#" is demoted to h2 so each
 *    page keeps a single h1 (write sections as "##");
 *  - headings get ids so sections can be linked;
 *  - external links open safely.
 */
function createRenderer() {
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      html({ text }) {
        return escapeHtml(text);
      },
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        // The post title is the page's only <h1>, so a Markdown "#" becomes h2.
        const level = Math.max(depth, 2);
        return `<h${level} id="${headingId(inner)}">${inner}</h${level}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//i.test(href) && !href.startsWith(SITE_ORIGIN);
        const attrs = [
          `href="${escapeHtml(href)}"`,
          title ? `title="${escapeHtml(title)}"` : "",
          external ? 'rel="noopener noreferrer" target="_blank"' : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<a ${attrs}>${text}</a>`;
      },
    },
  });
  return marked;
}

/** Minimal front-matter parser: `key: value`, `[a, b]` lists, booleans. */
function parseFrontMatter(source, file) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing front matter`);

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const pair = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!pair) throw new Error(`${file}: cannot parse front matter line "${line}"`);
    let value = pair[2].trim();
    if (/^\[.*\]$/.test(value)) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else if (value === "true" || value === "false") {
      value = value === "true";
    } else {
      value = value.replace(/^["']|["']$/g, "");
    }
    data[pair[1]] = value;
  }
  return { data, body: match[2] };
}

function isoDate(value, file, field) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    throw new Error(`${file}: "${field}" must be a date (YYYY-MM-DD)`);
  }
  return date.toISOString().slice(0, 10);
}

/** Last commit date of a file, so `updated` can default to real history. */
function gitDate(path) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", path], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function plainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_|-]/g, " ");
}

async function loadPosts() {
  let files = [];
  try {
    files = (await readdir(POSTS_DIR)).filter((name) => name.endsWith(".md"));
  } catch {
    return [];
  }

  const marked = createRenderer();
  const posts = [];

  for (const name of files.sort()) {
    const slug = name.replace(/\.md$/, "");
    const file = `content/blog/${name}`;
    if (!SLUG_RE.test(slug)) throw new Error(`${file}: file name must be a lowercase-hyphen slug`);

    const { data, body } = parseFrontMatter(await readFile(join(POSTS_DIR, name), "utf8"), file);
    const draft = data.draft === true;
    if (draft && !INCLUDE_DRAFTS) continue;

    for (const field of ["title", "description", "date"]) {
      if (!data[field]) throw new Error(`${file}: front matter "${field}" is required`);
    }
    if (data.description.length > 160) {
      console.warn(`  ! ${file}: description is ${data.description.length} chars (keep ≤ 160)`);
    }

    const published = isoDate(data.date, file, "date");
    const updated = data.updated
      ? isoDate(data.updated, file, "updated")
      : [gitDate(file), published].filter(Boolean).sort().pop();
    const wordCount = plainText(body).split(/\s+/).filter(Boolean).length;

    posts.push({
      slug,
      path: `/blog/${slug}/`,
      title: data.title,
      description: data.description,
      datePublished: published,
      dateModified: updated < published ? published : updated,
      tags: Array.isArray(data.tags) ? data.tags : [],
      image: data.image || null,
      draft,
      wordCount,
      readingMinutes: Math.max(1, Math.round(wordCount / 220)),
      html: marked.parse(body),
    });
  }

  // Newest first.
  return posts.sort((a, b) => b.datePublished.localeCompare(a.datePublished));
}

function renderFeed(posts) {
  const items = posts
    .map((post) => {
      const url = `${SITE_ORIGIN}${post.path}`;
      return `    <item>
      <title>${escapeHtml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${post.datePublished}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeHtml(post.description)}</description>
${post.tags.map((tag) => `      <category>${escapeHtml(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(`${SITE_NAME} — Writing`)}</title>
    <link>${SITE_ORIGIN}/blog/</link>
    <atom:link href="${SITE_ORIGIN}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${escapeHtml(`Engineering notes by ${SITE_AUTHOR.name} on backend systems, applied AI and speech recognition.`)}</description>
    <language>en</language>
${posts[0] ? `    <lastBuildDate>${new Date(`${posts[0].dateModified}T00:00:00Z`).toUTCString()}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;
}

async function main() {
  const posts = await loadPosts();
  const published = posts.filter((post) => !post.draft);

  await mkdir(dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify({ posts }, null, 2) + "\n", "utf8");
  await writeFile(OUT_FEED, renderFeed(published), "utf8");

  console.log(
    `✓ Blog: ${published.length} published, ${posts.length - published.length} draft(s) included` +
      (INCLUDE_DRAFTS ? " (BLOG_INCLUDE_DRAFTS=1)" : "")
  );
}

main().catch((error) => {
  console.error("Blog generation failed:", error.message);
  process.exit(1);
});
