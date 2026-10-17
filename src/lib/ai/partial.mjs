/**
 * Browser-safe parser for partial JSON responses while streaming.
 *
 * Short fields arrive as partial JSON: {"status":"ok","value":"...
 * This extracts the value so far, decoding string escapes and returning
 * finished items for array fields (tags).
 */

function parsePartialString(str) {
  let out = "";
  let i = 0;
  while (i < str.length) {
    const c = str[i];
    if (c === '"') {
      // Reached the closing unescaped quote of the JSON string
      break;
    }
    if (c === "\\") {
      if (i + 1 >= str.length) {
        // Trailing lone backslash: wait for the escaped character to arrive
        break;
      }
      const next = str[i + 1];
      if (next === '"') {
        out += '"';
        i += 2;
      } else if (next === "\\") {
        out += "\\";
        i += 2;
      } else if (next === "/") {
        out += "/";
        i += 2;
      } else if (next === "b") {
        out += "\b";
        i += 2;
      } else if (next === "f") {
        out += "\f";
        i += 2;
      } else if (next === "n") {
        out += "\n";
        i += 2;
      } else if (next === "r") {
        out += "\r";
        i += 2;
      } else if (next === "t") {
        out += "\t";
        i += 2;
      } else if (next === "u") {
        if (i + 5 < str.length) {
          const hex = str.slice(i + 2, i + 6);
          if (/^[0-9a-fA-F]{4}$/.test(hex)) {
            out += String.fromCharCode(Number.parseInt(hex, 16));
            i += 6;
          } else {
            out += "\\u";
            i += 2;
          }
        } else {
          // Incomplete unicode escape: wait for full 4-hex sequence
          break;
        }
      } else {
        out += next;
        i += 2;
      }
    } else {
      out += c;
      i += 1;
    }
  }
  return out;
}

function parseFinishedTags(str) {
  const items = [];
  let i = 1; // skip leading '['
  while (i < str.length) {
    while (i < str.length && (str[i] === " " || str[i] === "\t" || str[i] === "\n" || str[i] === "\r" || str[i] === ",")) {
      i++;
    }
    if (i >= str.length) break;
    if (str[i] === "]") break;
    if (str[i] === '"') {
      i++; // skip opening quote
      let item = "";
      let closed = false;
      while (i < str.length) {
        const c = str[i];
        if (c === '"') {
          closed = true;
          i++; // skip closing quote
          break;
        }
        if (c === "\\") {
          if (i + 1 >= str.length) break;
          const next = str[i + 1];
          if (next === '"') {
            item += '"';
            i += 2;
          } else if (next === "\\") {
            item += "\\";
            i += 2;
          } else if (next === "/") {
            item += "/";
            i += 2;
          } else if (next === "b") {
            item += "\b";
            i += 2;
          } else if (next === "f") {
            item += "\f";
            i += 2;
          } else if (next === "n") {
            item += "\n";
            i += 2;
          } else if (next === "r") {
            item += "\r";
            i += 2;
          } else if (next === "t") {
            item += "\t";
            i += 2;
          } else if (next === "u") {
            if (i + 5 < str.length) {
              const hex = str.slice(i + 2, i + 6);
              if (/^[0-9a-fA-F]{4}$/.test(hex)) {
                item += String.fromCharCode(Number.parseInt(hex, 16));
                i += 6;
              } else {
                item += "\\u";
                i += 2;
              }
            } else {
              break;
            }
          } else {
            item += next;
            i += 2;
          }
        } else {
          item += c;
          i++;
        }
      }
      if (closed) {
        const trimmed = item.trim();
        if (trimmed) items.push(trimmed);
      }
    } else {
      i++;
    }
  }
  return items;
}

import { sanitizePlainText, sanitizeMarkdown, sanitizeTags } from "./sanitize.mjs";

/**
 * Extracts the value so far from raw streaming text and sanitizes it against injection.
 *
 * @param {string} raw   Cumulative response text from provider
 * @param {string} kind  FIELD_SPECS[target]?.kind ("text"|"slug"|"tags"|"markdown"|"code")
 * @returns {string|string[]} Sanitized partial value
 */
export function partialValue(raw, kind) {
  if (kind === "markdown") return sanitizeMarkdown(raw || "");
  if (!raw) return kind === "tags" ? [] : "";

  const valueMatch = raw.match(/"value"\s*:\s*/);
  if (!valueMatch) return kind === "tags" ? [] : "";

  const remainder = raw.slice(valueMatch.index + valueMatch[0].length).trimStart();

  if (kind === "tags") {
    if (!remainder.startsWith("[")) return [];
    const tags = parseFinishedTags(remainder);
    return sanitizeTags(tags);
  }

  if (!remainder.startsWith('"')) return "";
  const parsed = parsePartialString(remainder.slice(1));
  if (kind === "code") return parsed;
  return sanitizePlainText(parsed, { preserveNewlines: true, trim: false });
}
