#!/usr/bin/env node
/**
 * Fails the build when blog or admin code hardcodes a colour.
 *
 * Every colour in these areas must come from the theme tokens in
 * src/app/globals.css (:root for dark, [data-theme="light"] for light), so
 * new UI follows both themes automatically. Flagged in CSS, JS and JSX:
 *   - hex colours (#fff, #0d9488, #0d948880)
 *   - rgb()/rgba()/hsl()/hsla() literals
 *   - named colours in colour-bearing CSS properties (white, black, red, ...)
 *   - var() fallbacks that smuggle in a literal colour
 * `transparent`, `currentColor`, `inherit` and color-mix() over tokens are fine.
 */
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SCANNED_DIRS = [
  "src/app/blog",
  "src/app/admin",
  "src/components/blog",
  "src/components/admin",
];
const EXTENSIONS = new Set([".css", ".js", ".jsx", ".mjs"]);

const NAMED_COLOURS =
  "white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|silver|teal|navy|maroon|olive|lime|aqua|cyan|magenta|fuchsia|gold|indigo|violet|brown|beige|ivory|coral|crimson|salmon|tomato";

const RULES = [
  { name: "hex colour", pattern: /(^|[^&\w/-])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/ },
  { name: "rgb/hsl literal", pattern: /\b(?:rgba?|hsla?)\(/ },
  {
    name: "named colour",
    cssOnly: true,
    pattern: new RegExp(
      `(?:^|[;{\\s])(?:color|background(?:-color)?|border(?:-[a-z]+)*|outline(?:-color)?|fill|stroke|box-shadow|text-shadow|caret-color|accent-color|text-decoration-color)\\s*:[^;]*\\b(?:${NAMED_COLOURS})\\b`,
      "i"
    ),
  },
];

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // directory not created yet
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (EXTENSIONS.has(extname(entry.name))) yield path;
  }
}

function stripComments(source, isCss) {
  // Keep line count stable so reported line numbers stay right.
  const blank = (match) => match.replace(/[^\n]/g, " ");
  let out = source.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (!isCss) out = out.replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, p1) => p1 + blank(m.slice(p1.length)));
  return out;
}

const problems = [];

for (const dir of SCANNED_DIRS) {
  for await (const file of walk(join(ROOT, dir))) {
    const isCss = extname(file) === ".css";
    const lines = stripComments(await readFile(file, "utf8"), isCss).split("\n");
    lines.forEach((line, index) => {
      for (const rule of RULES) {
        if (rule.cssOnly && !isCss) continue;
        if (rule.pattern.test(line)) {
          problems.push(`${relative(ROOT, file)}:${index + 1}  ${rule.name}: ${line.trim()}`);
        }
      }
    });
  }
}

if (problems.length) {
  console.error("✗ Hardcoded colours found; use theme tokens from src/app/globals.css:\n");
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`✓ Theme tokens: no hardcoded colours in ${SCANNED_DIRS.join(", ")}`);
