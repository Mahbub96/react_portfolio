#!/usr/bin/env node
/**
 * Build-time generator for version and build metadata.
 * Generates src/config/buildInfo.json containing:
 * - version: A.M.m from package.json (or APP_VERSION env)
 *     A = architectural change, M = major update, m = minor update
 * - buildNumber: YYYYMMDD-<commit_count> (e.g., 20261009-173) or from environment
 * - commitCount: git commit count of HEAD (the "commit number")
 * - commitHash: Short git commit hash (e.g., a443317)
 * - buildDate: ISO 8601 timestamp
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const TARGET_FILE = join(ROOT, "src", "config", "buildInfo.json");

// Load environment files if they exist (standard precedence)
const envFiles = [
  join(ROOT, ".env"),
  join(ROOT, ".env.local"),
  join(ROOT, ".env.production"),
  join(ROOT, ".env.production.local"),
];

for (const envPath of envFiles) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  }
}

function getGitInfo() {
  let commitCount = "0";
  let commitHash = "unknown";

  try {
    commitCount = execSync("git rev-list --count HEAD", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    // Git might not be available in some CI/Docker environments
  }

  try {
    commitHash = execSync("git rev-parse --short HEAD", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    // Fallback hash
  }

  return { commitCount, commitHash };
}

function formatDateYYYYMMDD(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${y}${m}${d}`;
}

/**
 * Release notes for `version`, parsed from CHANGELOG.md.
 *
 * Expected shape (Keep-a-Changelog style):
 *   ## 1.0.0
 *   Optional intro paragraph.
 *   ### Section title
 *   - item
 *
 * Returns { version, intro, sections: [{ title, items: [] }] } or null when
 * the changelog has no entry for this version. Inline Markdown is kept as-is
 * (only `code` spans are rendered by the UI).
 */
async function readReleaseNotes(version) {
  let markdown;
  try {
    markdown = await readFile(join(ROOT, "CHANGELOG.md"), "utf8");
  } catch {
    return null;
  }

  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) =>
    new RegExp(`^##\\s+v?${version.replace(/\./g, "\\.")}\\b`).test(line)
  );
  if (start === -1) return null;

  const notes = { version, intro: [], sections: [] };
  let current = null;

  for (const line of lines.slice(start + 1)) {
    if (/^##\s/.test(line)) break; // next version
    const heading = line.match(/^###\s+(.*)/);
    if (heading) {
      current = { title: heading[1].trim(), items: [] };
      notes.sections.push(current);
      continue;
    }
    const item = line.match(/^\s*[-*]\s+(.*)/);
    if (item) {
      if (!current) {
        current = { title: "Changes", items: [] };
        notes.sections.push(current);
      }
      current.items.push(item[1].trim());
      continue;
    }
    if (line.trim() && !current) notes.intro.push(line.trim());
  }

  return {
    version: notes.version,
    intro: notes.intro.join(" "),
    sections: notes.sections.filter((section) => section.items.length),
  };
}

async function main() {
  console.log("Generating build information…");

  // 1. Read package.json for version fallback
  let defaultVersion = "1.0.0";
  try {
    const pkgRaw = await readFile(join(ROOT, "package.json"), "utf8");
    const pkg = JSON.parse(pkgRaw);
    if (pkg.version) {
      defaultVersion = pkg.version;
    }
  } catch (err) {
    console.warn("Could not read package.json version, using fallback:", err.message);
  }

  // Allow environment override (APP_VERSION or NEXT_PUBLIC_APP_VERSION)
  const version =
    process.env.NEXT_PUBLIC_APP_VERSION ||
    process.env.APP_VERSION ||
    defaultVersion;

  // 2. Compute build date and git info
  const now = new Date();
  const dateStr = formatDateYYYYMMDD(now);
  const { commitCount, commitHash } = getGitInfo();

  // 3. Build number format: YYYYMMDD-<commit_count> (e.g. 20261009-173) or env override
  const defaultBuildNumber = `${dateStr}-${commitCount}`;
  const buildNumber =
    process.env.NEXT_PUBLIC_BUILD_NUMBER ||
    process.env.BUILD_NUMBER ||
    defaultBuildNumber;

  const releaseNotes = await readReleaseNotes(version);

  // buildInfo.json is bundled into the app, so it only carries a flag; the
  // notes themselves go to public/release-notes.json (step 5).
  const buildInfo = {
    version,
    buildNumber,
    commitCount: parseInt(commitCount, 10) || 0,
    commitHash,
    buildDate: now.toISOString(),
    hasReleaseNotes: Boolean(releaseNotes?.sections?.length),
  };

  // 4. Write to src/config/buildInfo.json
  await mkdir(dirname(TARGET_FILE), { recursive: true });
  await writeFile(TARGET_FILE, JSON.stringify(buildInfo, null, 2) + "\n", "utf8");

  // 5. Release notes as a static file, fetched only when the footer badge is
  // opened — keeps changelog text out of every page's indexed HTML.
  await writeFile(
    join(ROOT, "public", "release-notes.json"),
    JSON.stringify(
      {
        version: buildInfo.version,
        buildNumber: buildInfo.buildNumber,
        commitHash: buildInfo.commitHash,
        buildDate: buildInfo.buildDate,
        notes: releaseNotes,
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  console.log(
    `✓ Generated buildInfo.json: Version ${buildInfo.version}, Build ${buildInfo.buildNumber} (${buildInfo.commitHash})`
  );
}

main().catch((err) => {
  console.error("Failed to generate build info:", err);
  process.exit(1);
});
