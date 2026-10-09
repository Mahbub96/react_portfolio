/**
 * Live XML for /blog/feed.xml (RSS 2.0) and /blog/sitemap.xml.
 */
import { SITE_AUTHOR, SITE_NAME, SITE_ORIGIN } from "../seo/siteConfig.mjs";
import { absoluteAssetUrl, absoluteUrl } from "../seo/urls.mjs";
import { renderSitemapXml } from "../seo/sitemapBuilder.mjs";
import { BLOG_PATH, FEED_PATH } from "./posts.mjs";

const xml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const cdata = (value = "") => `<![CDATA[${String(value).replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

/** Feed readers need absolute URLs for images and site-relative links. */
export function absolutizeHtml(html = "") {
  return html
    .replace(/(\s(?:src|href))="\/(?!\/)/g, `$1="${SITE_ORIGIN}/`)
    .replace(/\ssrcset="([^"]*)"/g, (match, set) =>
      ` srcset="${set.replace(/(^|,\s*)\/(?!\/)/g, `$1${SITE_ORIGIN}/`)}"`
    );
}

export const BLOG_DESCRIPTION = `Engineering articles by ${SITE_AUTHOR.name} on backend systems, applied AI, speech recognition and shipping software.`;

/** @param posts full posts (with html), newest first */
export function renderRss(posts) {
  const items = posts
    .map((post) => {
      const url = absoluteUrl(post.path);
      const image = post.coverImage
        ? `<p><img src="${xml(absoluteAssetUrl(post.coverImage.src))}" alt="${xml(post.coverImage.alt)}"></p>`
        : "";
      return [
        "    <item>",
        `      <title>${xml(post.title)}</title>`,
        `      <link>${xml(url)}</link>`,
        `      <guid isPermaLink="true">${xml(url)}</guid>`,
        `      <pubDate>${new Date(post.datePublished).toUTCString()}</pubDate>`,
        `      <dc:creator>${xml(SITE_AUTHOR.name)}</dc:creator>`,
        `      <description>${xml(post.description)}</description>`,
        ...post.tags.map((tag) => `      <category>${xml(tag)}</category>`),
        `      <content:encoded>${cdata(image + absolutizeHtml(post.html))}</content:encoded>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const lastBuild = posts[0]?.dateModified ? new Date(posts[0].dateModified) : new Date();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xml(`${SITE_NAME} — Blog`)}</title>
    <link>${xml(absoluteUrl(BLOG_PATH))}</link>
    <atom:link href="${xml(`${SITE_ORIGIN}${FEED_PATH}`)}" rel="self" type="application/rss+xml"/>
    <description>${xml(BLOG_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

/** Blog index + every indexable post. Empty <urlset> while nothing is published. */
export function renderBlogSitemap(posts) {
  if (!posts.length) return renderSitemapXml([]);
  return renderSitemapXml([
    {
      url: absoluteUrl(BLOG_PATH),
      lastModified: posts[0].dateModified,
      changeFrequency: "weekly",
      priority: 0.8,
      images: [],
    },
    ...posts.map((post) => ({
      url: absoluteUrl(post.path),
      lastModified: post.dateModified,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [absoluteAssetUrl(post.image)].filter(Boolean),
    })),
  ]);
}
