# Changelog

Versioning: `A.M.m`
- **A**: architectural change
- **M**: major update
- **m**: minor update

Build number: `YYYYMMDD-<commit count>` (generated at build time by `scripts/generate-build-info.mjs`).

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
- The version badge in the footer opens the release notes for the running build. The notes come from this changelog at build time and are fetched only when the badge is opened, so they never appear in the page HTML.
- Navbar section links work from sub-pages (`/#section`).
- Version and build number come only from the generated `buildInfo.json`; the hardcoded defaults in `next.config.js` are removed.
