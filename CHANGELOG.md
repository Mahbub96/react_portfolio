# Changelog

Versioning: `A.M.m`
- **A**: architectural change
- **M**: major update
- **m**: minor update

Build number: `YYYYMMDD-<commit count>` (generated at build time by `scripts/generate-build-info.mjs`).

## 1.4.1

### Added
- `/blog/` has topic filters with post counts, a search box, and a choice of list or grid view.
- The editor has a formatting bar that stays in view (headings, bold, italic, code, lists, quote, code block, image, table, YouTube), and an empty post shows starting points for adding images and blocks.
- Several images can be uploaded or dropped at once; they are added in order where they were dropped.

### Changed
- Blog cards are more compact: topic, date and reading time on one line, the excerpt, and the cover image beside the text. Posts without a cover show no placeholder.
- Post pages and the editor use a tighter layout and updated typography.
- The cover image in the editor has floating Replace, Alt text & caption, and Remove buttons. "New post" shows a progress screen while the draft is created.

### Fixes
- AI suggestions for short fields (title, URL, tags) work from the title alone, before the post has any body text.

## 1.4.0

### Added
- AI writing help in the blog editor. A ✨ button next to the title, excerpt, URL, tags, search title, meta description and image descriptions suggests a value based on what the post already says. Nothing changes until you choose "Use it".
- Help with the article itself: turn your notes into an outline, expand a passage, or improve its wording, with a preview before anything is added.
- Suggestions stay close to what you wrote: links that are not in your post are removed, and numbers that are not in your notes are flagged for checking.

## 1.3.1

### Changed
- Blog posts have a cleaner header with a link back to all articles, a compact author line and a slightly narrower cover image.

### Fixes
- The Analytics button on the homepage shows its label without hovering, and follows the light and dark themes.

## 1.3.0

### Added
- A blog: write, schedule and publish articles from a new admin area, with a block editor for headings, lists, quotes, callouts, code, tables, images, galleries and videos, plus autosave and preview.
- Every post automatically gets search-friendly metadata, a social sharing image, an RSS feed entry and a sitemap entry, and renamed posts keep their old links working.
- Uploaded images are resized and optimised automatically.
- When you are signed in, blog pages show shortcuts to write or edit posts.

### Changed
- The navbar links to the Blog in place of the duplicate Contact item; "Get in Touch" stays.
- A simpler footer without the repeated page links.
- Faster blog pages on mobile.

## 1.2.1

### Changed
- Admin sign-in is more secure.
- The light theme no longer flashes dark while a page loads, and theme colours are consistent across the site.

## 1.2.0

### Added
- **Blog** (`/blog/`): posts are Markdown files in `content/blog/`. They are rendered to static HTML at build time, so no Markdown library reaches the server or the browser. Each post has `BlogPosting` structured data linked to the Person, a self-canonical, article Open Graph tags, reading time, and published and updated dates.
- RSS feed at `/feed.xml`, with autodiscovery links on every page. Published posts are added to the sitemap and llms.txt automatically.
- Drafts (`draft: true`) never reach production. Review builds can include them with `BLOG_INCLUDE_DRAFTS=1`; they render with a draft banner and `noindex`.
- While no post is published, `/blog/` returns 404 and the footer shows no Writing link.

### Changed
- The release notes dialog now lists every version up to the running one, newest first, in a scrollable view. The running version is marked "Current", and **bold** text in the changelog renders as bold.

## 1.1.0

### Added
- New `/about/` page covering identity, focus areas, engineering approach, experience, education and links to all case studies. It uses `AboutPage` structured data with the Person as its main entity, and appears in the sitemap, footer and llms.txt.
- The Person structured data now also lists speech-recognition and mobile topics, each backed by a project or the thesis.

### Fixes
- Shortened the meta descriptions on `/projects/`, `/skills/` and `/resume/` to under 160 characters so Google does not truncate them.

## 1.0.1

### Fixes
- `www.mahbub.dev` now redirects to `mahbub.dev` in a single 301 that keeps the exact path and trailing slash. Before, it took two redirects and dropped the trailing slash.

## 1.0.0

Versioning restarts at 1.0.0 with this release.

### SEO and structured data
- One JSON-LD `@graph` per page, with a single `Person` and `WebSite` entity referenced by `@id`. Removed the conflicting duplicate Person blocks, `LocalBusiness`, `FAQPage`, standalone `ImageObject`s and the `JobPosting` markup on work history. Removed all microdata attributes.
- `pageMetadata()` builds the metadata for every page: self-referencing canonical, robots, Open Graph and Twitter card with real image sizes. The layout no longer sets a site-wide canonical or robots tag.
- New `not-found.js` (a single `noindex` and no canonical). `/analytics/` is `noindex` and disallowed in robots.txt.
- Project detail pages for LinkLens, Bangla & English ASR Studio, Local Vocal Agent and Advanced Finance Tracker are now full case studies. Projects without a case study render with `noindex`.
- `/skills/` maps each technology to the projects that use it. The skill categories now come from one shared module.
- `robots.txt`, `sitemap.xml`, `llms.txt`, `/.well-known/llms.txt` and the new `llms-full.txt` are all generated at build time from one source. AI search and training crawlers are explicitly allowed. Sitemap `lastmod` comes from git history.
- Public identity (name, title, email, profile links) comes from `src/lib/seo/siteConfig.mjs` and is not editable from the CMS. No phone number is published, and there is one public email address.

### Performance
- Removed the custom webpack `splitChunks` config. The homepage's first-load JS dropped from 594 kB to 168 kB, and the CSS-as-script console error is gone.
- Project screenshots and the profile photo are served as pre-optimised WebP (about 650 KB in total instead of about 8.4 MB of PNG/JPEG). `images.unoptimized` is on because the runtime optimizer cannot load `sharp` on the Linux server when the build comes from macOS.
- Removed the Google Fonts stylesheet, which the CSP was blocking, and the manual image preloads. The CSP now allows the Cloudflare Web Analytics beacon.

### Other
- IndexNow key file and `pnpm seo:indexnow`, which submit the sitemap URLs to Bing and other IndexNow engines after a production deploy.
- `deploy-local.sh` no longer writes to MongoDB unless asked: the portfolio content sync runs only with `UPDATE_CONTENT=1`.
- The version badge in the footer opens the release notes for the running build. The notes come from this changelog at build time and are fetched only when the badge is opened, so they never appear in the page HTML.
- Navbar section links work from sub-pages (`/#section`).
- Version and build number come only from the generated `buildInfo.json`; the hardcoded defaults in `next.config.js` are removed.
