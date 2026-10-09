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
import { Lexer } from "marked";

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

// ---- Markdown tokens -> editor JSON --------------------------------------

function inline(tokens = [], marks = []) {
  const out = [];
  for (const token of tokens) {
    switch (token.type) {
      case "text":
      case "escape":
        if (token.tokens?.length) out.push(...inline(token.tokens, marks));
        else if (token.text) out.push(textNode(decode(token.text), marks));
        break;
      case "strong":
        out.push(...inline(token.tokens, [...marks, { type: "bold" }]));
        break;
      case "em":
        out.push(...inline(token.tokens, [...marks, { type: "italic" }]));
        break;
      case "del":
        out.push(...inline(token.tokens, [...marks, { type: "strike" }]));
        break;
      case "codespan":
        out.push(textNode(decode(token.text), [...marks, { type: "code" }]));
        break;
      case "link":
        out.push(...inline(token.tokens, [...marks, { type: "link", attrs: { href: token.href } }]));
        break;
      case "image":
        if (token.text) out.push(textNode(`[image: ${token.text}]`, marks));
        break;
      case "br":
        out.push({ type: "hardBreak" });
        break;
      case "html":
        out.push(textNode(token.text, marks));
        break;
      default:
        if (token.text) out.push(textNode(decode(token.text), marks));
    }
  }
  return out.filter((node) => node.type !== "text" || node.text);
}

const decode = (text) =>
  String(text).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function textNode(text, marks) {
  return marks.length ? { type: "text", text, marks } : { type: "text", text };
}

function paragraph(tokens) {
  const content = inline(tokens);
  return content.length ? { type: "paragraph", content } : null;
}

function blocks(tokens = []) {
  const out = [];
  for (const token of tokens) {
    switch (token.type) {
      case "heading":
        out.push({ type: "heading", attrs: { level: Math.min(4, Math.max(2, token.depth)) }, content: inline(token.tokens) });
        break;
      case "paragraph":
      case "text": {
        const node = paragraph(token.tokens || [{ type: "text", text: token.text }]);
        if (node) out.push(node);
        break;
      }
      case "list":
        out.push({
          type: token.ordered ? "orderedList" : "bulletList",
          ...(token.ordered && token.start > 1 ? { attrs: { start: token.start } } : {}),
          content: token.items.map((item) => ({ type: "listItem", content: blocks(item.tokens).filter(Boolean) })),
        });
        break;
      case "code":
        out.push({ type: "codeBlock", attrs: { language: token.lang || "plaintext" }, content: token.text ? [{ type: "text", text: token.text }] : [] });
        break;
      case "blockquote":
        out.push({ type: "blockquote", content: blocks(token.tokens) });
        break;
      case "hr":
        out.push({ type: "horizontalRule" });
        break;
      case "table": {
        const cell = (type, c) => ({ type, content: [paragraph(c.tokens) || { type: "paragraph" }] });
        out.push({
          type: "table",
          content: [
            { type: "tableRow", content: token.header.map((c) => cell("tableHeader", c)) },
            ...token.rows.map((row) => ({ type: "tableRow", content: row.map((c) => cell("tableCell", c)) })),
          ],
        });
        break;
      }
      case "html":
        out.push({ type: "paragraph", content: [{ type: "text", text: token.text.trim() }] });
        break;
      default:
        break; // space, def
    }
  }
  return out;
}

export function markdownToDoc(markdown) {
  const content = blocks(Lexer.lex(markdown, { gfm: true }));
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

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
