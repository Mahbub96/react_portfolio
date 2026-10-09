/**
 * Editor JSON (ProseMirror / Tiptap document) -> public HTML.
 *
 * This is the only path from stored content to the page, and it is an
 * allow-list: known node types and marks are rendered, every text and
 * attribute value is escaped, links must be http(s)/mailto/relative, images
 * must be this site's own uploads, and anything unrecognised is dropped.
 * HTML produced in the browser is never stored or trusted.
 *
 * Output classes (align-*, font-*, size-*, figure-*, callout-*, ...) are the
 * hooks for the shared prose styles used by both the post page and the editor.
 */
import { escapeHtml, highlightCode, normalizeLanguage } from "./highlight.mjs";
import {
  BLOCK_FONTS,
  BLOCK_SIZES,
  CALLOUT_VARIANTS,
  GALLERY_COLUMNS,
  IMAGE_LAYOUTS,
  TEXT_ALIGNS,
  isUploadSrc,
} from "./schema.mjs";
import { slugify } from "../seo/slug.mjs";

export const RENDERER_VERSION = 1;
const WORDS_PER_MINUTE = 220;
const MAX_DEPTH = 40;
const SITE_HOST = "mahbub.dev";

const IMAGE_SIZES = {
  inline: "(min-width: 760px) 680px, 100vw",
  wide: "(min-width: 1100px) 1040px, 100vw",
  full: "100vw",
  "float-left": "(min-width: 760px) 320px, 100vw",
  "float-right": "(min-width: 760px) 320px, 100vw",
  gallery: "(min-width: 760px) 340px, 50vw",
};

export function readingMinutes(wordCount) {
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

const attr = (value) => escapeHtml(value);

/** http(s), mailto, site-relative and in-page links only; null otherwise. */
export function safeHref(raw) {
  const href = String(raw || "").trim();
  if (!href || /[\s\u0000-\u001f]/.test(href)) return null;
  if (href.startsWith("#")) return /^#[\w-]+$/.test(href) ? href : null;
  if (href.startsWith("/")) return href.startsWith("//") ? null : href;
  try {
    const url = new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
    if (url.protocol === "mailto:") return href;
  } catch {
    // not a URL
  }
  return null;
}

function isExternal(href) {
  if (!/^https?:/i.test(href)) return false;
  try {
    const host = new URL(href).hostname;
    return host !== SITE_HOST && !host.endsWith(`.${SITE_HOST}`);
  } catch {
    return true;
  }
}

function blockClass(attrs = {}, base = []) {
  const classes = [...base];
  if (TEXT_ALIGNS.includes(attrs.textAlign) && attrs.textAlign !== "left") {
    classes.push(`align-${attrs.textAlign}`);
  }
  if (BLOCK_FONTS.includes(attrs.blockFont)) classes.push(`font-${attrs.blockFont}`);
  if (BLOCK_SIZES.includes(attrs.blockSize) && attrs.blockSize !== "md") {
    classes.push(`size-${attrs.blockSize}`);
  }
  return classes.length ? ` class="${classes.join(" ")}"` : "";
}

const clampInt = (value, min, max, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

function nodeText(node) {
  if (!node) return "";
  if (node.type === "text") return String(node.text || "");
  if (node.type === "hardBreak") return " ";
  return (node.content || []).map(nodeText).join("");
}

class Renderer {
  constructor({ eagerFirstImage }) {
    this.eagerFirstImage = eagerFirstImage;
    this.ids = new Set();
    this.toc = [];
    this.headings = [];
    this.images = [];
    this.text = [];
  }

  uniqueId(text) {
    const base = slugify(text) || "section";
    let id = base;
    for (let n = 2; this.ids.has(id); n += 1) id = `${base}-${n}`;
    this.ids.add(id);
    return id;
  }

  inline(nodes = []) {
    let html = "";
    for (const node of nodes) {
      if (node?.type === "hardBreak") {
        html += "<br>";
        this.text.push(" ");
      } else if (node?.type === "text" && typeof node.text === "string") {
        this.text.push(node.text);
        html += this.marks(escapeHtml(node.text), node.marks);
      }
    }
    return html;
  }

  marks(html, marks = []) {
    const has = (type) => marks.find((mark) => mark?.type === type);
    let out = html;
    if (has("code")) out = `<code>${out}</code>`;
    if (has("strike")) out = `<s>${out}</s>`;
    if (has("underline")) out = `<u>${out}</u>`;
    if (has("italic")) out = `<em>${out}</em>`;
    if (has("bold")) out = `<strong>${out}</strong>`;
    const link = has("link");
    const href = link && safeHref(link.attrs?.href);
    if (href) {
      const external = isExternal(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
      out = `<a href="${attr(href)}"${external}>${out}</a>`;
    }
    return out;
  }

  blocks(nodes = [], depth = 0) {
    if (depth > MAX_DEPTH || !Array.isArray(nodes)) return "";
    return nodes.map((node) => this.block(node, depth + 1)).join("");
  }

  img(image, sizes) {
    if (!image || !isUploadSrc(image.src)) return null;
    const width = clampInt(image.width, 1, 20000, null);
    const height = clampInt(image.height, 1, 20000, null);
    const variants = (Array.isArray(image.variants) ? image.variants : [])
      .filter((v) => isUploadSrc(v?.src) && clampInt(v.width, 1, 20000, 0))
      .sort((a, b) => a.width - b.width);
    const srcset = variants.length > 1
      ? ` srcset="${variants.map((v) => `${attr(v.src)} ${clampInt(v.width, 1, 20000, 1)}w`).join(", ")}" sizes="${sizes}"`
      : "";
    const alt = String(image.alt || "").trim();
    const eager = this.eagerFirstImage && this.images.length === 0;
    this.images.push({ src: image.src, alt });
    return (
      `<img src="${attr(image.src)}"${srcset} alt="${attr(alt)}"` +
      (width && height ? ` width="${width}" height="${height}"` : "") +
      (eager ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"') +
      ">"
    );
  }

  block(node, depth) {
    if (!node || typeof node !== "object") return "";
    const attrs = node.attrs || {};

    switch (node.type) {
      case "paragraph": {
        const inner = this.inline(node.content);
        this.text.push("\n");
        return inner ? `<p${blockClass(attrs)}>${inner}</p>` : "";
      }
      case "heading": {
        const text = nodeText(node).trim();
        if (!text) return "";
        const requested = clampInt(attrs.level, 1, 6, 2);
        const level = Math.min(4, Math.max(2, requested));
        const id = this.uniqueId(text);
        this.headings.push({ level, requested, text });
        if (level <= 3) this.toc.push({ id, text, level });
        const inner = this.inline(node.content);
        this.text.push("\n");
        return `<h${level} id="${id}"${blockClass(attrs)}>${inner}</h${level}>`;
      }
      case "bulletList":
        return `<ul>${this.blocks(node.content, depth)}</ul>`;
      case "orderedList": {
        const start = clampInt(attrs.start, 1, 100000, 1);
        return `<ol${start !== 1 ? ` start="${start}"` : ""}>${this.blocks(node.content, depth)}</ol>`;
      }
      case "listItem":
        return `<li>${this.blocks(node.content, depth)}</li>`;
      case "blockquote":
        return `<blockquote>${this.blocks(node.content, depth)}</blockquote>`;
      case "horizontalRule":
        return "<hr>";
      case "codeBlock": {
        const code = nodeText(node);
        const language = normalizeLanguage(attrs.language);
        this.text.push(code, "\n");
        const label = language === "plaintext" ? "" : ` data-language="${language}"`;
        return `<pre class="code-block"${label}><code class="hljs language-${language}">${highlightCode(code, language)}</code></pre>`;
      }
      case "figure": {
        const layout = IMAGE_LAYOUTS.includes(attrs.layout) ? attrs.layout : "inline";
        const img = this.img(attrs, IMAGE_SIZES[layout]);
        if (!img) return "";
        const caption = String(attrs.caption || "").trim();
        if (caption) this.text.push(caption, "\n");
        return (
          `<figure class="figure figure-${layout}">${img}` +
          (caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : "") +
          "</figure>"
        );
      }
      case "gallery": {
        const images = (Array.isArray(attrs.images) ? attrs.images : [])
          .slice(0, 9)
          .map((image) => this.img(image, IMAGE_SIZES.gallery))
          .filter(Boolean);
        if (!images.length) return "";
        const columns = GALLERY_COLUMNS.includes(Number(attrs.columns)) ? Number(attrs.columns) : 3;
        const caption = String(attrs.caption || "").trim();
        return (
          `<figure class="gallery gallery-cols-${columns}"><div class="gallery-grid">` +
          images.map((img) => `<div class="gallery-item">${img}</div>`).join("") +
          "</div>" +
          (caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : "") +
          "</figure>"
        );
      }
      case "callout": {
        const variant = CALLOUT_VARIANTS.includes(attrs.variant) ? attrs.variant : "info";
        return `<aside class="callout callout-${variant}" role="note">${this.blocks(node.content, depth)}</aside>`;
      }
      case "youtube": {
        const videoId = String(attrs.videoId || "");
        if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return "";
        const title = String(attrs.title || "").trim() || "Watch on YouTube";
        const thumb = isUploadSrc(attrs.thumbSrc)
          ? `<img src="${attr(attrs.thumbSrc)}" alt="" width="480" height="360" loading="lazy" decoding="async">`
          : "";
        this.text.push(title, "\n");
        return (
          `<figure class="embed embed-youtube">` +
          `<a class="embed-link" href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer">` +
          `${thumb}<span class="embed-play" aria-hidden="true"></span>` +
          `<span class="embed-title">${escapeHtml(title)}</span></a></figure>`
        );
      }
      case "table":
        return `<div class="table-wrap"><table><tbody>${this.blocks(node.content, depth)}</tbody></table></div>`;
      case "tableRow":
        return `<tr>${this.blocks(node.content, depth)}</tr>`;
      case "tableHeader":
      case "tableCell": {
        const tag = node.type === "tableHeader" ? "th" : "td";
        const colspan = clampInt(attrs.colspan, 1, 20, 1);
        const rowspan = clampInt(attrs.rowspan, 1, 50, 1);
        const span =
          (colspan > 1 ? ` colspan="${colspan}"` : "") + (rowspan > 1 ? ` rowspan="${rowspan}"` : "");
        return `<${tag}${span}>${this.blocks(node.content, depth)}</${tag}>`;
      }
      default:
        // Unknown container: keep its (allow-listed) children, drop the wrapper.
        return Array.isArray(node.content) ? this.blocks(node.content, depth) : "";
    }
  }
}

/**
 * @param {object} doc editor JSON ({ type: "doc", content: [...] })
 * @param {{ eagerFirstImage?: boolean }} options eagerFirstImage when the post
 *   has no cover, so the first body image is the likely LCP element
 */
export function renderDoc(doc, { eagerFirstImage = false } = {}) {
  const renderer = new Renderer({ eagerFirstImage });
  const html = doc?.type === "doc" ? renderer.blocks(doc.content) : "";
  const plainText = renderer.text.join("").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;

  return {
    html,
    toc: renderer.toc,
    headings: renderer.headings,
    images: renderer.images,
    plainText,
    wordCount,
    readingMinutes: readingMinutes(wordCount),
    rendererVersion: RENDERER_VERSION,
  };
}
