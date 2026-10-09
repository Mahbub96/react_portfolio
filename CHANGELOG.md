# Changelog

Versioning: `A.M.m`
- **A**: architectural change
- **M**: major update
- **m**: minor update

Build number: `YYYYMMDD-<commit count>` (generated at build time by `scripts/generate-build-info.mjs`).

## 1.3.0

### Added
- Blog content store in MongoDB: each post has an autosaved working copy and a separately published live snapshot, with version numbers so two editor tabs cannot overwrite each other, URL slug history for 301 redirects, and the last 30 published revisions.
- Admin blog API under `/api/admin/blog/` (list, create, autosave, publish, schedule, unpublish, delete, slug check, tags, publish checklist), all behind the admin session.
- Image uploads: the browser sends pre-resized sizes; the server checks each file's real type and dimensions, rejects SVG, names files by content hash and serves them from `/uploads/blog/` with year-long immutable caching. Uploads are stored outside the build so deploys keep them. YouTube embeds copy the thumbnail locally and link out, so posts load nothing from YouTube.
- An allow-list renderer turns editor content into the public HTML: unknown blocks and attributes are dropped, text is escaped, links are limited to http(s)/mailto/relative and images to this site's uploads. Code is highlighted on the server.
- Publishing checks title, slug, description length, alt text on every image, heading order and canonical URL, and pings IndexNow from production only.
- Test and development data use prefixed collections (`test_`, `dev_`), so nothing written outside production can appear on mahbub.dev.
- Public blog rebuilt on the live posts: `/blog/` shows the newest post as a featured card and the rest as a grid, with a designed empty state (noindex until the first post). Post pages have a cover image, byline, reading time, a table of contents (sidebar on very wide screens), wide, full-width and floated images with text wrap, galleries, callouts, highlighted code, tables, share links, an author box, related posts and a reading-progress bar.
- Automatic SEO for every post: self canonical (or a custom one for cross-posts), Open Graph article tags with a 1200x630 social image, BlogPosting structured data, a live RSS feed with full content at `/blog/feed.xml` and a live `/blog/sitemap.xml`. Renamed posts redirect permanently from their old URLs, and scheduled posts appear at exactly their publish time.
- `pnpm blog:import <site>` moves Markdown posts into the CMS as drafts through the admin API.
- When you are signed in, blog pages show shortcuts to write a new post, edit the post you are reading, or open all posts. Visitors never see them.
- Admin at `/admin/` (signed-in only, checked on the server): a posts dashboard with Draft / Scheduled / Published tabs, search and delete, and a full-screen block editor in the style of Ghost and Medium.
- Block editor: type `/` or press `+` on an empty line to insert headings, lists, quotes, callouts (info, tip, warning, note), code with a language picker, tables, dividers, images, galleries and YouTube embeds. Selected text gets a toolbar for bold, italic, strikethrough, code, links (⌘K), headings, alignment and font/size presets (Sans, Serif, Mono; small, normal, large). Images can be inline, wide, full-width or floated left/right with text wrap; images and pasted or dropped files are resized and converted to WebP in the browser before upload.
- Autosave 1.5 seconds after you stop typing, with a local backup that survives a closed tab or lost connection, ⌘S to save now, and a conflict notice instead of overwriting when another tab saved first. Preview shows unpublished changes with the public template; publish, update, schedule and unpublish from one menu.
- Post settings: URL (follows the title until set by hand, with availability check), excerpt, tags, body font, search title and meta description with counters, a Google result preview, a social card preview, a live SEO checklist, and a canonical URL for cross-posts. Publishing is blocked while an image has no alt text or the description is missing or too long.

### Changed
- The top navbar has a **06. Blog** link in place of "06. Contact", which duplicated the "Get in Touch" button (both opened the contact section). Signed in, the navbar also shows Analytics (07) and Write (08, the blog admin). The profile card's "Get In Touch" link now works from every page.
- `/sitemap.xml` is now a sitemap index pointing to the static `/sitemap-pages.xml` and the live blog sitemap; `llms.txt` links the blog and its full-text feed. robots.txt disallows `/admin/`.
- The footer no longer repeats the site navigation; it keeps the social links, bio and version badge. The RSS feed is announced to feed readers in every page's head but is not shown on the page.
- Blog posts are no longer built from Markdown files; `scripts/generate-blog.mjs` is removed. The hardcoded-colour check now runs on every build.
- The serif font is loaded only when a post uses it, and the byline uses a 3 KB avatar, which brought mobile Lighthouse performance on a post from 85 to 92.

## 1.2.1

### Security
- Admin login now uses an httpOnly session cookie (`__Host-` prefixed, Secure, SameSite=Strict) instead of a token kept in localStorage. Each login is a revocable server-side session: logging out invalidates the cookie immediately, not just in the browser.
- Every admin API checks that session, including the portfolio edit, delete and image upload routes and the login history, which previously only compared the `Host` header. Cookie-authenticated writes must also carry a same-site `Origin`.
- Removed the built-in fallback admin password hash and the default JWT signing secret. Login is disabled until `ADMIN_PASSWORD_HASH` is set, and production refuses to sign or accept tokens without a real `JWT_SECRET` of 32+ characters.
- Runtime secrets now live only on each server in `.env.runtime`, which deploys load and check before starting the app. `.env.production` is no longer tracked in git. `pnpm admin:hash` generates the password hash and a JWT secret.
- The strict login rate limit now applies to the login endpoint only; `/admin` responses are `noindex` and never cached.

### Changed
- Light and dark theme colours are now CSS tokens in `globals.css` (`:root` and `[data-theme="light"]`) instead of inline styles set from JavaScript. A saved light theme is applied before the first paint, so it no longer flashes dark on load.
- New shared tokens for upcoming blog and admin UI: serif font, prose widths, focus ring, accent tints and code highlighting. `scripts/check-theme-tokens.mjs` rejects hardcoded colours in blog and admin code.

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
