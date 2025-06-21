import { NextResponse } from "next/server";
import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mahbub.dev";

    const sitemap = new SitemapStream({ hostname: baseUrl });

    // Add static pages
    sitemap.write({ url: "/", changefreq: "daily", priority: 1.0 });
    sitemap.write({ url: "/projects", changefreq: "weekly", priority: 0.8 });
    sitemap.write({ url: "/skills", changefreq: "weekly", priority: 0.8 });
    sitemap.write({ url: "/contact", changefreq: "monthly", priority: 0.6 });

    sitemap.end();

    const sitemapXML = await streamToPromise(sitemap);

    return new NextResponse(sitemapXML, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return NextResponse.json(
      { error: "Failed to generate sitemap" },
      { status: 500 }
    );
  }
}
