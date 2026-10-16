import { test } from "node:test";
import assert from "node:assert/strict";
import { extractHeadingsFromHtml, translatePostToBangla, TranslationError } from "./translate.mjs";

test("extractHeadingsFromHtml extracts h2 and h3 with id and clean text", () => {
  const html = `
    <h2 id="intro">Introduction to System</h2>
    <p>Some text</p>
    <h3 id="details">Deep <span>Details</span></h3>
    <p>More text</p>
    <h2 id="summary">Summary &amp; Conclusion</h2>
  `;

  const headings = extractHeadingsFromHtml(html);
  assert.equal(headings.length, 3);
  assert.deepEqual(headings[0], { id: "intro", text: "Introduction to System", level: 2 });
  assert.deepEqual(headings[1], { id: "details", text: "Deep Details", level: 3 });
  assert.deepEqual(headings[2], { id: "summary", text: "Summary &amp; Conclusion", level: 2 });
});

test("translatePostToBangla throws error for unsupported language", async () => {
  await assert.rejects(
    () => translatePostToBangla({ title: "Test", html: "<p>Hello</p>" }, "es"),
    (err) => err instanceof TranslationError && err.status === 400
  );
});

test("translatePostToBangla throws error for empty post", async () => {
  await assert.rejects(
    () => translatePostToBangla({ title: "", html: "" }, "bn"),
    (err) => err instanceof TranslationError && err.status === 400
  );
});

test("sanitizeTranslatedHtml neutralizes dangerous tags, inline event handlers, and javascript URIs", async () => {
  const { sanitizeTranslatedHtml } = await import("./translate.mjs");
  const maliciousInput = `
    <script>alert("hacked")</script>
    <iframe src="https://evil.com"></iframe>
    <p onclick="alert('click')">Safe paragraph</p>
    <img src="valid.webp" alt="test" onerror="alert('xss')">
    <a href="javascript:stealTokens()">Malicious link</a>
    <h2 id="valid-heading--1' onclick='bad()">Title</h2>
  `;

  const clean = sanitizeTranslatedHtml(maliciousInput);
  assert.ok(!clean.includes("<script>"));
  assert.ok(!clean.includes("<iframe>"));
  assert.ok(!clean.includes("onclick"));
  assert.ok(!clean.includes("onerror"));
  assert.ok(!clean.includes("javascript:"));
  assert.ok(clean.includes("<p>Safe paragraph</p>"));
  assert.ok(clean.includes('<img src="valid.webp" alt="test"'));
  assert.ok(clean.includes('id="valid-heading--1"'));
});

test("sanitizePlainText strips HTML and replaces em dashes", async () => {
  const { sanitizePlainText } = await import("./translate.mjs");
  const dirty = "<b>Hello</b> World—New Era–2026";
  const clean = sanitizePlainText(dirty);
  assert.equal(clean, "Hello World, New Era, 2026");
});

