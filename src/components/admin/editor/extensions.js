"use client";

/**
 * Custom Tiptap extensions. Node names and attributes match exactly what the
 * server renderer (src/lib/blog/renderDoc.mjs) accepts, and the editor DOM
 * uses the same classes as the public prose styles, so the canvas looks like
 * the published post.
 */
import { Extension, Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CodeBlock } from "@tiptap/extension-code-block";
import Suggestion from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import { CalloutView, CodeBlockView, FigureView, GalleryView, YouTubeView } from "./nodeViews";

/** Font and size presets on paragraphs and headings (never arbitrary values). */
export const BlockStyle = Extension.create({
  name: "blockStyle",
  addGlobalAttributes() {
    const preset = (attr, prefix) => ({
      default: null,
      parseHTML: (el) => el.getAttribute(`data-${prefix}`),
      renderHTML: (attrs) =>
        attrs[attr] ? { class: `${prefix}-${attrs[attr]}`, [`data-${prefix}`]: attrs[attr] } : {},
    });
    return [
      {
        types: ["paragraph", "heading"],
        attributes: { blockFont: preset("blockFont", "font"), blockSize: preset("blockSize", "size") },
      },
    ];
  },
  addCommands() {
    const set = (attr) => (value) => ({ commands }) =>
      ["paragraph", "heading"].some((type) => commands.updateAttributes(type, { [attr]: value || null }));
    return { setBlockFont: set("blockFont"), setBlockSize: set("blockSize") };
  },
});

const jsonAttr = (fallback) => ({
  default: fallback,
  parseHTML: () => fallback,
  renderHTML: () => ({}),
});

export const Figure = Node.create({
  name: "figure",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      mediaId: { default: null },
      src: { default: null },
      variants: jsonAttr([]),
      width: { default: null },
      height: { default: null },
      alt: { default: "" },
      caption: { default: "" },
      layout: { default: "inline" },
    };
  },
  parseHTML: () => [{ tag: "figure[data-figure]" }],
  renderHTML: ({ HTMLAttributes }) => [
    "figure",
    { "data-figure": "", class: `figure figure-${HTMLAttributes.layout || "inline"}` },
    ["img", { src: HTMLAttributes.src, alt: HTMLAttributes.alt }],
  ],
  // The node view's outer element carries the public classes, so the prose
  // layout rules (wide/full/float) apply in the editor exactly as on the site.
  addNodeView: () =>
    ReactNodeViewRenderer(FigureView, {
      as: "figure",
      attrs: ({ node }) => ({ class: `figure figure-${node.attrs.layout || "inline"}` }),
    }),
  addCommands() {
    return {
      insertFigure: (attrs) => ({ commands }) => commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export const Gallery = Node.create({
  name: "gallery",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return { images: jsonAttr([]), columns: { default: 3 }, caption: { default: "" } };
  },
  parseHTML: () => [{ tag: "figure[data-gallery]" }],
  renderHTML: () => ["figure", { "data-gallery": "", class: "gallery" }],
  addNodeView: () =>
    ReactNodeViewRenderer(GalleryView, {
      as: "figure",
      attrs: ({ node }) => ({ class: `gallery gallery-cols-${node.attrs.columns === 2 ? 2 : 3}` }),
    }),
});

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "paragraph+",
  defining: true,
  addAttributes() {
    return { variant: { default: "info" } };
  },
  parseHTML: () => [{ tag: "aside[data-callout]" }],
  renderHTML: ({ HTMLAttributes }) => [
    "aside",
    mergeAttributes({ "data-callout": "", class: `callout callout-${HTMLAttributes.variant}` }),
    0,
  ],
  addNodeView: () =>
    ReactNodeViewRenderer(CalloutView, {
      as: "aside",
      attrs: ({ node }) => ({ class: `callout callout-${node.attrs.variant || "info"}` }),
    }),
  addCommands() {
    return {
      setCallout: (variant = "info") => ({ commands }) => commands.wrapIn(this.name, { variant }),
    };
  },
});

export const YouTube = Node.create({
  name: "youtube",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return { videoId: { default: null }, title: { default: "" }, thumbSrc: { default: null } };
  },
  parseHTML: () => [{ tag: "figure[data-youtube]" }],
  renderHTML: () => ["figure", { "data-youtube": "", class: "embed embed-youtube" }],
  addNodeView: () => ReactNodeViewRenderer(YouTubeView, { as: "figure", attrs: { class: "embed embed-youtube" } }),
});

export const CodeBlockWithLanguage = CodeBlock.extend({
  addAttributes() {
    return { language: { default: "plaintext" } };
  },
  addNodeView: () => ReactNodeViewRenderer(CodeBlockView, { as: "pre", attrs: { class: "code-block" } }),
}).configure({ HTMLAttributes: { class: "code-block" } });

/**
 * "/" command menu. Items come from the editor (BlockEditor) through the
 * `items` option; rendering is delegated to `render` (a React popup).
 */
export const SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    return { items: () => [], render: () => ({}) };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: new PluginKey("slashCommand"),
        char: "/",
        startOfLine: false,
        allowSpaces: false,
        allow: ({ state, range }) => {
          // Not inside code blocks.
          const $from = state.doc.resolve(range.from);
          return $from.parent.type.name !== "codeBlock";
        },
        command: ({ editor, range, props }) => props.run({ editor, range }),
        items: ({ query }) => this.options.items(query),
        render: this.options.render,
      }),
    ];
  },
});
