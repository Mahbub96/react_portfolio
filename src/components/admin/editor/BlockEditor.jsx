"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { TableKit } from "@tiptap/extension-table";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import {
  LuAlignCenter,
  LuAlignLeft,
  LuAlignRight,
  LuBold,
  LuCaseSensitive,
  LuCheck,
  LuCode,
  LuHeading2,
  LuHeading3,
  LuHeading4,
  LuImage,
  LuImages,
  LuInfo,
  LuItalic,
  LuLightbulb,
  LuLink,
  LuList,
  LuListOrdered,
  LuLoaderCircle,
  LuMinus,
  LuPilcrow,
  LuPlus,
  LuQuote,
  LuSquareCode,
  LuStickyNote,
  LuStrikethrough,
  LuTable,
  LuTriangleAlert,
  LuUnlink,
  LuYoutube,
} from "react-icons/lu";
import { adminFetch } from "../adminApi";
import { useAdminUI } from "../AdminUI";
import {
  BlockStyle,
  Callout,
  CodeBlockWithLanguage,
  Figure,
  Gallery,
  SlashCommand,
  YouTube,
} from "./extensions";
import { ACCEPTED_TYPES, uploadImage } from "./imagePipeline";
import prose from "@/components/blog/prose.module.css";
import admin from "../admin.module.css";
import styles from "./editor.module.css";

/** Same rules as the server renderer's safeHref. */
export function normalizeLink(raw) {
  const href = String(raw || "").trim();
  if (!href) return null;
  if (/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href)) return href;
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(href)) return `https://${href}`;
  return null;
}

const SLASH_ITEMS = [
  { group: "Text", title: "Text", hint: "Plain paragraph", icon: LuPilcrow, keys: "paragraph p", run: (c) => c.setParagraph() },
  { group: "Text", title: "Heading", hint: "Section title (H2)", icon: LuHeading2, keys: "h2 title section", run: (c) => c.setHeading({ level: 2 }) },
  { group: "Text", title: "Subheading", hint: "H3", icon: LuHeading3, keys: "h3", run: (c) => c.setHeading({ level: 3 }) },
  { group: "Text", title: "Small heading", hint: "H4", icon: LuHeading4, keys: "h4", run: (c) => c.setHeading({ level: 4 }) },
  { group: "Text", title: "Bulleted list", hint: "Unordered list", icon: LuList, keys: "ul bullet", run: (c) => c.toggleBulletList() },
  { group: "Text", title: "Numbered list", hint: "Ordered list", icon: LuListOrdered, keys: "ol number", run: (c) => c.toggleOrderedList() },
  { group: "Text", title: "Quote", hint: "Pull quote", icon: LuQuote, keys: "blockquote", run: (c) => c.setParagraph().toggleBlockquote() },
  { group: "Text", title: "Divider", hint: "Section break", icon: LuMinus, keys: "hr line separator", run: (c) => c.setHorizontalRule() },
  { group: "Callouts", title: "Info", hint: "Highlighted note", icon: LuInfo, keys: "callout info", run: (c) => c.setParagraph().setCallout("info") },
  { group: "Callouts", title: "Tip", hint: "Positive callout", icon: LuLightbulb, keys: "callout success tip", run: (c) => c.setParagraph().setCallout("success") },
  { group: "Callouts", title: "Warning", hint: "Caution callout", icon: LuTriangleAlert, keys: "callout warning caution", run: (c) => c.setParagraph().setCallout("warning") },
  { group: "Callouts", title: "Note", hint: "Accent callout", icon: LuStickyNote, keys: "callout note aside", run: (c) => c.setParagraph().setCallout("note") },
  { group: "Media", title: "Image", hint: "Upload a picture", icon: LuImage, keys: "picture photo img", action: "image" },
  { group: "Media", title: "Gallery", hint: "2–9 images in a grid", icon: LuImages, keys: "images grid", action: "gallery" },
  { group: "Media", title: "YouTube", hint: "Embed a video", icon: LuYoutube, keys: "video embed", action: "youtube" },
  { group: "Code & data", title: "Code", hint: "Highlighted code block", icon: LuSquareCode, keys: "codeblock snippet", run: (c) => c.setCodeBlock() },
  { group: "Code & data", title: "Table", hint: "3 × 3 with header", icon: LuTable, keys: "grid", run: (c) => c.insertTable({ rows: 3, cols: 3, withHeaderRow: true }) },
];

function filterItems(query) {
  const q = query.toLowerCase().trim();
  return SLASH_ITEMS.filter((item) => !q || `${item.title} ${item.keys} ${item.group}`.toLowerCase().includes(q)).slice(0, 12);
}

/* Slash menu popup ---------------------------------------------------------------- */

function SlashMenu({ state, onPick, onHover }) {
  const listRef = useRef(null);
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [state.index]);
  if (!state.rect) return null;
  const top = Math.min(state.rect.bottom + 8, window.innerHeight - 340);
  let lastGroup = null;
  return (
    <div className={styles.slashMenu} style={{ top, left: Math.min(state.rect.left, window.innerWidth - 300) }} role="listbox" ref={listRef} aria-label="Insert block">
      {state.items.length === 0 ? <p className={styles.slashEmpty}>No matching blocks</p> : null}
      {state.items.map((item, index) => {
        const header = item.group !== lastGroup ? <p className={styles.slashGroup}>{item.group}</p> : null;
        lastGroup = item.group;
        const Icon = item.icon;
        return (
          <div key={item.title}>
            {header}
            <button
              type="button"
              role="option"
              aria-selected={index === state.index}
              className={styles.slashItem}
              onMouseEnter={() => onHover(index)}
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(index);
              }}
            >
              <span className={styles.slashIcon}>
                <Icon aria-hidden="true" />
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.hint}</small>
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* Selection toolbar --------------------------------------------------------------- */

// Module-level so React keeps the same element across the re-render that a
// selection change triggers between mousedown and click.
function Btn({ active, label, onClick, children }) {
  return (
    <button type="button" aria-pressed={Boolean(active)} aria-label={label} title={label} onMouseDown={(e) => e.preventDefault()} onClick={onClick}>
      {children}
    </button>
  );
}

function BubbleToolbar({ editor }) {
  const [mode, setMode] = useState(null); // null | "link" | "style"
  const [href, setHref] = useState("");
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      quote: e.isActive("blockquote"),
      align: ["center", "right"].find((a) => e.isActive({ textAlign: a })) || "left",
      font: e.getAttributes("paragraph").blockFont || e.getAttributes("heading").blockFont || "",
      size: e.getAttributes("paragraph").blockSize || e.getAttributes("heading").blockSize || "",
    }),
  });

  const chain = () => editor.chain().focus();
  const openLink = useCallback(() => {
    setHref(editor.getAttributes("link").href || "");
    setMode("link");
  }, [editor]);

  // Cmd/Ctrl+K from the editor opens the link field for the selection.
  useEffect(() => {
    const dom = editor.view.dom;
    const onOpen = () => !editor.state.selection.empty && openLink();
    dom.addEventListener("open-link", onOpen);
    return () => dom.removeEventListener("open-link", onOpen);
  }, [editor, openLink]);
  const applyLink = (event) => {
    event.preventDefault();
    const value = normalizeLink(href);
    if (!href.trim()) chain().extendMarkRange("link").unsetLink().run();
    else if (value) chain().extendMarkRange("link").setLink({ href: value }).run();
    else return;
    setMode(null);
  };

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 10 }}
      shouldShow={({ editor: e, state: s }) => {
        const { selection } = s;
        if (selection.empty || selection.node || e.isActive("codeBlock")) {
          if (mode) setTimeout(() => setMode(null));
          return false;
        }
        return true;
      }}
    >
      <div className={styles.bubble}>
        {mode === "link" ? (
          <form className={styles.linkForm} onSubmit={applyLink}>
            <LuLink aria-hidden="true" />
            <input
              autoFocus
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="Paste a link, or /about/"
              aria-label="Link URL"
              onKeyDown={(e) => e.key === "Escape" && setMode(null)}
              className={href && !normalizeLink(href) ? styles.inputMissing : undefined}
            />
            <button type="submit" aria-label="Apply link" title="Apply">
              <LuCheck />
            </button>
            {state.link ? (
              <button type="button" aria-label="Remove link" title="Remove link" onClick={() => { chain().extendMarkRange("link").unsetLink().run(); setMode(null); }}>
                <LuUnlink />
              </button>
            ) : null}
          </form>
        ) : (
          <>
            <Btn active={state.bold} label="Bold (⌘B)" onClick={() => chain().toggleBold().run()}><LuBold /></Btn>
            <Btn active={state.italic} label="Italic (⌘I)" onClick={() => chain().toggleItalic().run()}><LuItalic /></Btn>
            <Btn active={state.strike} label="Strikethrough" onClick={() => chain().toggleStrike().run()}><LuStrikethrough /></Btn>
            <Btn active={state.code} label="Inline code" onClick={() => chain().toggleCode().run()}><LuCode /></Btn>
            <Btn active={state.link} label="Link (⌘K)" onClick={openLink}><LuLink /></Btn>
            <span className={styles.toolbarDivider} />
            <Btn active={state.h2} label="Heading" onClick={() => chain().toggleHeading({ level: 2 }).run()}><LuHeading2 /></Btn>
            <Btn active={state.h3} label="Subheading" onClick={() => chain().toggleHeading({ level: 3 }).run()}><LuHeading3 /></Btn>
            <Btn active={state.quote} label="Quote" onClick={() => chain().toggleBlockquote().run()}><LuQuote /></Btn>
            <span className={styles.toolbarDivider} />
            <Btn active={state.align === "left"} label="Align left" onClick={() => chain().setTextAlign("left").run()}><LuAlignLeft /></Btn>
            <Btn active={state.align === "center"} label="Align centre" onClick={() => chain().setTextAlign("center").run()}><LuAlignCenter /></Btn>
            <Btn active={state.align === "right"} label="Align right" onClick={() => chain().setTextAlign("right").run()}><LuAlignRight /></Btn>
            <span className={styles.toolbarDivider} />
            <Btn active={mode === "style" || state.font || state.size} label="Font and size" onClick={() => setMode(mode === "style" ? null : "style")}><LuCaseSensitive /></Btn>
          </>
        )}
        {mode === "style" ? (
          <div className={styles.stylePanel}>
            <span>Font</span>
            <div className={styles.toolbarGroup}>
              {[["", "Default"], ["sans", "Sans"], ["serif", "Serif"], ["mono", "Mono"]].map(([value, label]) => (
                <button key={label} type="button" aria-pressed={state.font === value} onMouseDown={(e) => e.preventDefault()} onClick={() => chain().setBlockFont(value || null).run()}>
                  {label}
                </button>
              ))}
            </div>
            <span>Size</span>
            <div className={styles.toolbarGroup}>
              {[["sm", "Small"], ["", "Normal"], ["lg", "Large"]].map(([value, label]) => (
                <button key={label} type="button" aria-pressed={state.size === value} onMouseDown={(e) => e.preventDefault()} onClick={() => chain().setBlockSize(value || null).run()}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </BubbleMenu>
  );
}

/* YouTube dialog ------------------------------------------------------------------- */

function YouTubeDialog({ onClose, onInsert }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      onInsert(await adminFetch("/media/youtube/", { method: "POST", body: { url } }));
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };
  return (
    <div className={admin.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className={admin.dialog} onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="yt-title">
        <h2 id="yt-title">Embed a YouTube video</h2>
        <p>Readers see a thumbnail card; nothing loads from YouTube until they click it.</p>
        <input className={admin.input} autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" aria-label="YouTube link" onKeyDown={(e) => e.key === "Escape" && onClose()} />
        {error ? <p className={`${admin.hint} ${admin.hintError}`}>{error}</p> : null}
        <div className={admin.dialogActions}>
          <button type="button" className={`${admin.btn} ${admin.btnGhost}`} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={`${admin.btn} ${admin.btnPrimary}`} disabled={busy || !url.trim()}>
            {busy ? <LuLoaderCircle className={admin.spin} aria-hidden="true" /> : null} Embed
          </button>
        </div>
      </form>
    </div>
  );
}

/* Editor ------------------------------------------------------------------------------ */

const BlockEditor = forwardRef(function BlockEditor({ content, bodyFont, onChange, onStats }, ref) {
  const { toast } = useAdminUI();
  const fileRef = useRef(null);
  const [slash, setSlash] = useState({ items: [], index: 0, rect: null, command: null });
  const slashRef = useRef(slash);
  slashRef.current = slash;
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [uploading, setUploading] = useState(null);
  const editorRef = useRef(null);
  // The editor is created once; read the latest callbacks through refs.
  const onChangeRef = useRef(onChange);
  const onStatsRef = useRef(onStats);
  onChangeRef.current = onChange;
  onStatsRef.current = onStats;

  const insertImages = useCallback(
    async (files, position) => {
      const editor = editorRef.current;
      const images = [...files].filter((f) => f.type.startsWith("image/"));
      for (const file of images) {
        setUploading(`Uploading ${file.name || "image"}…`);
        try {
          const media = await uploadImage(file);
          const chain = editor.chain().focus();
          (position != null ? chain.insertContentAt(position, { type: "figure", attrs: { ...media, alt: "", layout: "inline" } }) : chain.insertFigure({ ...media, alt: "", layout: "inline" })).run();
        } catch (error) {
          if (error.status !== 401) toast(error.message, { type: "error" });
        }
      }
      setUploading(null);
    },
    [toast]
  );

  const requestBlock = useCallback((action) => {
    if (action === "youtube") setYoutubeOpen(true);
    else fileRef.current?.click();
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    content,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https", HTMLAttributes: { rel: null, target: null } },
        dropcursor: { color: "var(--accent-primary)", width: 2 },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["left", "center", "right", "justify"] }),
      Placeholder.configure({
        placeholder: ({ node }) => (node.type.name === "heading" ? "Heading" : "Write, or press / for blocks…"),
      }),
      CharacterCount,
      TableKit.configure({ table: { resizable: false } }),
      BlockStyle,
      Figure,
      Gallery,
      Callout,
      YouTube,
      CodeBlockWithLanguage,
      SlashCommand.configure({
        items: filterItems,
        render: () => ({
          onStart: (props) => setSlash({ items: props.items, index: 0, rect: props.clientRect?.(), command: props.command }),
          onUpdate: (props) => setSlash((s) => ({ ...s, items: props.items, index: 0, rect: props.clientRect?.(), command: props.command })),
          onKeyDown: ({ event }) => {
            const s = slashRef.current;
            if (!s.rect) return false;
            if (event.key === "ArrowDown") {
              setSlash({ ...s, index: (s.index + 1) % Math.max(1, s.items.length) });
              return true;
            }
            if (event.key === "ArrowUp") {
              setSlash({ ...s, index: (s.index - 1 + s.items.length) % Math.max(1, s.items.length) });
              return true;
            }
            if (event.key === "Enter") {
              const item = s.items[s.index];
              if (item) s.command({ run: ({ editor: e, range }) => runItem(e, range, item) });
              return Boolean(item);
            }
            if (event.key === "Escape") {
              setSlash((x) => ({ ...x, rect: null }));
              return true;
            }
            return false;
          },
          onExit: () => setSlash((s) => ({ ...s, rect: null })),
        }),
      }),
    ],
    editorProps: {
      attributes: {
        "aria-label": "Post body",
        spellcheck: "true",
        class: `${prose.prose} ${bodyFont === "serif" ? prose.serif : ""} ${styles.canvas}`,
      },
      handlePaste: (view, event) => {
        const files = event.clipboardData?.files;
        if (files?.length && [...files].some((f) => f.type.startsWith("image/"))) {
          insertImages(files);
          return true;
        }
        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        const files = event.dataTransfer?.files;
        if (moved || !files?.length || ![...files].some((f) => f.type.startsWith("image/"))) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        insertImages(files, pos);
        return true;
      },
      handleKeyDown: (view, event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          // Cmd/Ctrl+K: select the word and open the link field via the bubble.
          event.preventDefault();
          view.dom.dispatchEvent(new CustomEvent("open-link"));
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      onChangeRef.current?.(e.getJSON());
      onStatsRef.current?.({ words: e.storage.characterCount.words() });
    },
    onCreate: ({ editor: e }) => onStatsRef.current?.({ words: e.storage.characterCount.words() }),
  });
  editorRef.current = editor;

  function runItem(e, range, item) {
    const chain = e.chain().focus().deleteRange(range);
    if (item.action) {
      chain.run();
      if (item.action === "gallery") e.chain().focus().insertContent({ type: "gallery", attrs: { images: [], columns: 3 } }).run();
      else requestBlock(item.action);
      return;
    }
    item.run(chain).run();
  }

  const pickSlash = (index) => {
    const item = slash.items[index];
    if (item && slash.command) slash.command({ run: ({ editor: e, range }) => runItem(e, range, item) });
  };

  useImperativeHandle(ref, () => ({ focusStart: () => editor?.commands.focus("start"), editor }), [editor]);

  // Body font preset (Sans/Serif) applies to the whole canvas, like the post.
  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        ...editor.options.editorProps,
        attributes: {
          ...editor.options.editorProps.attributes,
          class: `${prose.prose} ${bodyFont === "serif" ? prose.serif : ""} ${styles.canvas}`,
        },
      },
    });
  }, [editor, bodyFont]);

  if (!editor) return <div className={styles.editorLoading}>Loading editor…</div>;

  return (
    <>
      <div className={prose.bleed}>
        <EditorContent editor={editor} />
      </div>

      <FloatingMenu
        editor={editor}
        options={{ placement: "left", offset: 12 }}
        shouldShow={({ state }) => {
          const { $from, empty } = state.selection;
          return empty && $from.depth === 1 && $from.parent.type.name === "paragraph" && $from.parent.content.size === 0;
        }}
      >
        <button type="button" className={styles.plusButton} aria-label="Insert block" title="Insert block" onClick={() => editor.chain().focus().insertContent("/").run()}>
          <LuPlus />
        </button>
      </FloatingMenu>

      <BubbleToolbar editor={editor} />
      <SlashMenu state={slash} onPick={pickSlash} onHover={(index) => setSlash((s) => ({ ...s, index }))} />

      {uploading ? (
        <div className={styles.uploadToast} role="status">
          <LuLoaderCircle className={styles.spin} aria-hidden="true" /> {uploading}
        </div>
      ) : null}

      {youtubeOpen ? (
        <YouTubeDialog
          onClose={() => setYoutubeOpen(false)}
          onInsert={(video) => {
            setYoutubeOpen(false);
            editor.chain().focus().insertContent({ type: "youtube", attrs: video }).run();
          }}
        />
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_TYPES}
        hidden
        onChange={(e) => {
          const files = e.target.files;
          if (files?.length) insertImages(files);
          e.target.value = "";
        }}
      />
    </>
  );
});

export default BlockEditor;
