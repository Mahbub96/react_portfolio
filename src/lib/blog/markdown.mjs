/**
 * Markdown -> editor JSON (the Tiptap/ProseMirror document the blog editor
 * stores). Used by the one-time Markdown importer and by the AI writing
 * assistant, whose body suggestions arrive as Markdown.
 *
 * Headings, paragraphs, lists, code, quotes, tables, links and emphasis are
 * kept; raw HTML becomes plain text and remote images become a text note,
 * so the result is always safe for the allow-list renderer.
 */
import { Lexer } from "marked";

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
