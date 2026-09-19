export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/_next/static/"],
        disallow: ["/api/", "/private/"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "PerplexityBot",
          "ClaudeBot",
          "anthropic-ai",
          "Google-Extended",
          "Applebot",
          "Applebot-Extended",
          "Meta-ExternalAgent",
          "Bytespider",
          "Cohere-ai",
          "Diffbot",
          "CCBot",
        ],
        allow: ["/", "/llms.txt", "/.well-known/llms.txt", "/_next/static/"],
        disallow: ["/api/", "/private/"],
      },
      {
        userAgent: ["AhrefsBot", "SemrushBot", "Screaming Frog SEO Spider"],
        allow: ["/", "/_next/static/"],
        disallow: ["/api/", "/private/"],
      },
      {
        userAgent: ["MJ12bot", "BLEXBot"],
        disallow: ["/"],
      },
    ],
    sitemap: "https://mahbub.dev/sitemap.xml",
    host: "https://mahbub.dev",
  };
}
