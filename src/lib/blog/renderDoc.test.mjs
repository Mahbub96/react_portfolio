// Run: pnpm test:blog
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderDoc, safeHref } from "./renderDoc.mjs";
import { validateForPublish } from "./validate.mjs";
import { isValidSlug, slugFromTitle } from "./slug.mjs";

const doc = (...content) => ({ type: "doc", content });
const p = (...content) => ({ type: "paragraph", content });
const t = (text, marks) => ({ type: "text", text, ...(marks ? { marks } : {}) });
const IMG = "/uploads/blog/2026/10/abc123def456-1600.webp";

test("text is escaped, never interpreted as HTML", () => {
  const { html } = renderDoc(doc(p(t('<script>alert(1)</script> & "q" \'s'))));
  assert.equal(html, "<p>&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;q&quot; &#39;s</p>");
});

test("unknown node types and marks are dropped, children kept", () => {
  const { html } = renderDoc(
    doc(
      { type: "iframe", attrs: { src: "https://evil.example" } },
      { type: "mystery", content: [p(t("kept", [{ type: "blink" }]))] },
      { type: "paragraph", attrs: { onclick: "x()", style: "color:red" }, content: [t("safe")] }
    )
  );
  assert.equal(html, "<p>kept</p><p>safe</p>");
});

test("links: only http(s), mailto and relative; external get noopener", () => {
  const link = (href) => renderDoc(doc(p(t("x", [{ type: "link", attrs: { href } }])))).html;
  assert.equal(link("javascript:alert(1)"), "<p>x</p>");
  assert.equal(link("JaVaScRiPt:alert(1)"), "<p>x</p>");
  assert.equal(link("data:text/html,<b>"), "<p>x</p>");
  assert.equal(link("//evil.example/x"), "<p>x</p>");
  assert.equal(link("java\nscript:alert(1)"), "<p>x</p>");
  assert.equal(link("/blog/other/"), '<p><a href="/blog/other/">x</a></p>');
  assert.equal(link("https://mahbub.dev/about/"), '<p><a href="https://mahbub.dev/about/">x</a></p>');
  assert.equal(
    link('https://example.com/?a="><script>'),
    '<p><a href="https://example.com/?a=%22%3E%3Cscript%3E" target="_blank" rel="noopener noreferrer">x</a></p>'
  );
  assert.equal(safeHref("mailto:hi@mahbub.dev"), "mailto:hi@mahbub.dev");
});

test("images must be own uploads; attributes are escaped and sized", () => {
  const figure = (attrs) => renderDoc(doc({ type: "figure", attrs })).html;
  assert.equal(figure({ src: "https://evil.example/x.png", alt: "a", width: 10, height: 10 }), "");
  assert.equal(figure({ src: "/uploads/blog/../../etc/passwd.png", alt: "a" }), "");
  assert.equal(figure({ src: "javascript:alert(1)", alt: "a" }), "");
  const html = figure({
    src: IMG,
    alt: '"><img src=x onerror=alert(1)>',
    width: 1600,
    height: 900,
    layout: "wide",
    caption: "<b>cap</b>",
    variants: [
      { width: 480, height: 270, src: "/uploads/blog/2026/10/abc123def456-480.webp" },
      { width: 1600, height: 900, src: IMG },
      { width: 960, height: 540, src: "https://evil.example/x.webp" },
    ],
  });
  assert.match(html, /^<figure class="figure figure-wide"><img src="\/uploads\/blog\/2026\/10\/abc123def456-1600\.webp"/);
  assert.match(html, /alt="&quot;&gt;&lt;img src=x onerror=alert\(1\)&gt;"/);
  assert.match(html, /srcset="[^"]*-480\.webp 480w, [^"]*-1600\.webp 1600w"/);
  assert.doesNotMatch(html, /evil/);
  assert.match(html, /width="1600" height="900" loading="lazy"/);
  assert.match(html, /<figcaption>&lt;b&gt;cap&lt;\/b&gt;<\/figcaption>/);
  assert.equal(figure({ src: IMG, alt: "a", width: 2, height: 2, layout: "bogus" }).includes("figure-inline"), true);
});

test("first image is eager only when requested", () => {
  const d = doc({ type: "figure", attrs: { src: IMG, alt: "a", width: 2, height: 2 } });
  assert.match(renderDoc(d, { eagerFirstImage: true }).html, /fetchpriority="high"/);
  assert.match(renderDoc(d).html, /loading="lazy"/);
});

test("headings: H1 becomes H2, max H4, unique ids, TOC of H2/H3", () => {
  const h = (level, text) => ({ type: "heading", attrs: { level }, content: [t(text)] });
  const out = renderDoc(doc(h(1, "Intro"), h(2, "Intro"), h(3, "Deep <dive>"), h(6, "Tiny")));
  assert.equal(
    out.html,
    '<h2 id="intro">Intro</h2><h2 id="intro-2">Intro</h2><h3 id="deep-dive">Deep &lt;dive&gt;</h3><h4 id="tiny">Tiny</h4>'
  );
  assert.deepEqual(out.toc.map((x) => x.id), ["intro", "intro-2", "deep-dive"]);
});

test("block presets map to classes; arbitrary values are ignored", () => {
  const { html } = renderDoc(
    doc(
      { type: "paragraph", attrs: { textAlign: "center", blockFont: "serif", blockSize: "lg" }, content: [t("a")] },
      { type: "paragraph", attrs: { textAlign: "left;color:red", blockFont: "Comic Sans", blockSize: "99px" }, content: [t("b")] }
    )
  );
  assert.equal(html, '<p class="align-center font-serif size-lg">a</p><p>b</p>');
});

test("code blocks are highlighted and escaped; unknown language is plain", () => {
  const code = (language, text) => renderDoc(doc({ type: "codeBlock", attrs: { language }, content: [t(text)] })).html;
  const js = code("js", "const a = '<b>';");
  assert.match(js, /^<pre class="code-block" data-language="javascript"><code class="hljs language-javascript">/);
  assert.match(js, /hljs-keyword/);
  assert.doesNotMatch(js, /<b>/);
  assert.equal(
    code('"><script>', "<x>"),
    '<pre class="code-block"><code class="hljs language-plaintext">&lt;x&gt;</code></pre>'
  );
});

test("callout, youtube, table and lists render with safe attributes", () => {
  const out = renderDoc(
    doc(
      { type: "callout", attrs: { variant: "warning" }, content: [p(t("careful"))] },
      { type: "callout", attrs: { variant: "red" }, content: [p(t("x"))] },
      { type: "youtube", attrs: { videoId: "dQw4w9WgXcQ", title: "Demo <1>" } },
      { type: "youtube", attrs: { videoId: '"><script>' } },
      { type: "orderedList", attrs: { start: "3" }, content: [{ type: "listItem", content: [p(t("three"))] }] },
      { type: "table", content: [{ type: "tableRow", content: [{ type: "tableHeader", attrs: { colspan: 2 }, content: [p(t("h"))] }] }] }
    )
  );
  assert.match(out.html, /<aside class="callout callout-warning" role="note"><p>careful<\/p><\/aside>/);
  assert.match(out.html, /<aside class="callout callout-info" role="note">/);
  assert.match(out.html, /href="https:\/\/www\.youtube\.com\/watch\?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer"/);
  assert.match(out.html, /Demo &lt;1&gt;/);
  assert.equal((out.html.match(/embed-youtube/g) || []).length, 1);
  assert.match(out.html, /<ol start="3"><li><p>three<\/p><\/li><\/ol>/);
  assert.match(out.html, /<th colspan="2"><p>h<\/p><\/th>/);
});

test("word count, plain text and reading time", () => {
  const words = Array.from({ length: 440 }, (_, i) => `w${i}`).join(" ");
  const out = renderDoc(doc(p(t(words)), p(t("আমি বাংলায় লিখি"))));
  assert.equal(out.wordCount, 443);
  assert.equal(out.readingMinutes, 2);
  assert.match(out.plainText, /আমি বাংলায় লিখি$/);
});

test("deeply nested input cannot blow the stack", () => {
  let node = p(t("deep"));
  for (let i = 0; i < 5000; i += 1) node = { type: "blockquote", content: [node] };
  assert.doesNotThrow(() => renderDoc(doc(node)));
});

test("publish validation: blocks missing alt, long description, bad slug", () => {
  const rendered = renderDoc(doc({ type: "figure", attrs: { src: IMG, alt: "", width: 2, height: 2 } }));
  const result = validateForPublish(
    { title: "T", slug: "Bad Slug", metaDescription: "x".repeat(161), canonicalUrl: "http://x.y/" },
    rendered
  );
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 4);

  const good = validateForPublish(
    { title: "Fine", slug: "fine-post", excerpt: "A".repeat(130), coverImage: { src: IMG, alt: "cover" } },
    renderDoc(doc(p(t("word ".repeat(400)))))
  );
  assert.deepEqual(good, { ok: true, errors: [], warnings: [] });
});

test("slugs", () => {
  assert.equal(slugFromTitle("Fine-Tuning Whisper for Bangla — Without Guessing!"), "fine-tuning-whisper-for-bangla-without-guessing");
  assert.match(slugFromTitle("বাংলা শিরোনাম"), /^post-[0-9a-f]{6}$/);
  assert.equal(isValidSlug("admin"), false);
  assert.equal(isValidSlug("ok-slug-1"), true);
  assert.equal(isValidSlug("double--hyphen"), false);
});

test("youtube ids from every common link form", async () => {
  const { youtubeId } = await import("./youtube.mjs");
  for (const url of [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s",
    "https://youtu.be/dQw4w9WgXcQ?si=x",
    "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "dQw4w9WgXcQ",
  ]) assert.equal(youtubeId(url), "dQw4w9WgXcQ", url);
  assert.equal(youtubeId("https://evil.example/watch?v=dQw4w9WgXcQ"), null);
  assert.equal(youtubeId("javascript:alert(1)"), null);
});

test("markdown import converts to renderable editor JSON", async () => {
  const { markdownToDoc } = await import("../../../scripts/import-markdown-posts.mjs");
  const doc = markdownToDoc(
    "# Top\n\nHello **bold** and `code` with [a link](https://example.com).\n\n- one\n- two\n\n```python\nprint(1)\n```\n\n> quote\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n<script>x</script>\n"
  );
  const { html } = renderDoc(doc);
  assert.match(html, /^<h2 id="top">Top<\/h2>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<code>code<\/code>/);
  assert.match(html, /<a href="https:\/\/example\.com\/" target="_blank" rel="noopener noreferrer">a link<\/a>/);
  assert.match(html, /<ul><li><p>one<\/p><\/li><li><p>two<\/p><\/li><\/ul>/);
  assert.match(html, /language-python/);
  assert.match(html, /<blockquote><p>quote<\/p><\/blockquote>/);
  assert.match(html, /<th><p>a<\/p><\/th>/);
  assert.match(html, /&lt;script&gt;x&lt;\/script&gt;/);
});
