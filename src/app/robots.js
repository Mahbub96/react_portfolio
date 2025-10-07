export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/_next/", "/private/"],
    },
    sitemap: [
      "https://mahbub.dev/sitemap.xml",
      "https://mahbub.dev/api/sitemap?type=images",
    ],
    host: "https://mahbub.dev",
    crawlDelay: 1,
  };
}
