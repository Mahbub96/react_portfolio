export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";
import { getPortfolioFallback } from "@/lib/portfolioFallback";

export async function GET() {
  try {
    return await generateMainSitemap();
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}

async function generateMainSitemap() {
  const baseUrl = "https://mahbub.dev";
  let projects = [];

  try {
    const db = await connectDB();
    if (db) {
      const portfolioData = await PortfolioData.find({}).lean();
      projects =
        portfolioData.find((item) => item.collectionName === "Projects")
          ?.data || [];
    }
  } catch {
    const fallback = getPortfolioFallback();
    projects = fallback.Projects?.data || [];
  }

  const projectImagesXml = projects
    .filter((project) => Boolean(project?.src))
    .map((project) => {
      const imageLoc = project.src.startsWith("http")
        ? project.src
        : `${baseUrl}${project.src}`;
      return `      <image:image>
        <image:loc>${imageLoc}</image:loc>
      </image:image>`;
    })
    .join("\n");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>2025-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/profile.png</image:loc>
    </image:image>
    <image:image>
      <image:loc>${baseUrl}/assets/img/og-cover.jpg</image:loc>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/projects/</loc>
    <lastmod>2025-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
${projectImagesXml}
  </url>
  <url>
    <loc>${baseUrl}/skills/</loc>
    <lastmod>2025-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact/</loc>
    <lastmod>2025-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  return new NextResponse(sitemapXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
