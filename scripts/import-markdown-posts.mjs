#!/usr/bin/env node
/**
 * One-time import of Markdown posts (content/blog/*.md) into the blog CMS,
 * as DRAFTS, through the admin API of a running site:
 *
 *   pnpm blog:import https://test.mahbub.dev
 *   pnpm blog:import https://mahbub.dev content/blog/some-post.md
 *
 * Asks for the admin username and password, logs in like the browser does
 * (session cookie), creates each post and saves its converted content. Runs
 * from your machine; nothing is installed or run on the server. Review and
 * publish the drafts in /admin afterwards.
 *
 * Markdown is converted to editor JSON (headings, paragraphs, lists, code,
 * quotes, tables, links, emphasis). Remote images are not imported: blog
 * images must be uploads, so add them in the editor.
 */
import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { markdownToDoc } from "../src/lib/blog/markdown.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseFrontMatter(source, file) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing front matter`);
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!pair) continue;
    let value = pair[2].trim();
    if (/^\[.*\]$/.test(value)) {
      value = value.slice(1, -1).split(",").map((v) => v.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else {
      value = value.replace(/^["']|["']$/g, "");
    }
    data[pair[1]] = value;
  }
  return { data, body: match[2] };
}

export { markdownToDoc };

// ---- Admin API client ------------------------------------------------------

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (text) => {
        if (text.includes(question) || text === "\r\n" || text === "\n") rl.output.write(text);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

async function main() {
  const [site, ...files] = process.argv.slice(2);
  if (!site || !/^https?:\/\//.test(site)) {
    console.error("Usage: pnpm blog:import <site-url> [file.md ...]");
    process.exit(2);
  }
  const origin = new URL(site).origin;
  const sources = files.length
    ? files
    : (await readdir(join(ROOT, "content", "blog"))).filter((f) => f.endsWith(".md")).map((f) => join("content", "blog", f));
  if (!sources.length) {
    console.log("No Markdown posts found.");
    return;
  }

  const username = await ask("Admin username: ");
  const password = await ask("Admin password: ", true);

  const login = await fetch(`${origin}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ username, password }),
  });
  if (!login.ok) throw new Error(`Login failed (HTTP ${login.status})`);
  const cookie = login.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");

  const api = async (path, init = {}) => {
    const response = await fetch(`${origin}/api/admin/blog${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Origin: origin, Cookie: cookie },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status} ${body.error || ""} ${(body.issues || []).join("; ")}`);
    return body;
  };

  try {
    for (const file of sources) {
      const { data, body } = parseFrontMatter(await readFile(join(ROOT, file), "utf8"), file);
      const slug = basename(file, ".md");
      const { post } = await api("/posts/", { method: "POST", body: JSON.stringify({ title: data.title || slug }) });
      const free = await api(`/slug-check/?slug=${encodeURIComponent(slug)}&id=${post.id}`);
      await api(`/posts/${post.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          version: post.version,
          ...(free.available ? { slug } : {}),
          excerpt: String(data.description || "").slice(0, 300),
          tags: Array.isArray(data.tags) ? data.tags.slice(0, 10) : [],
          contentJson: markdownToDoc(body),
        }),
      });
      console.log(`✓ ${file} → draft "${data.title}" (${origin}/admin/posts/${post.id}/)`);
    }
  } finally {
    await fetch(`${origin}/api/auth/logout/`, { method: "POST", headers: { Origin: origin, Cookie: cookie } }).catch(() => {});
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(`Import failed: ${error.message}`);
    process.exit(1);
  });
}
