import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";

const generateSitemap = async () => {
  try {
    const smStream = new SitemapStream({
      hostname: "https://mahbub.dev",
    });

    // List all your routes with detailed metadata
    const pages = [
      {
        url: "/",
        changefreq: "weekly",
        priority: 1.0,
        lastmod: new Date().toISOString(),
      },
      {
        url: "/projects",
        changefreq: "weekly",
        priority: 0.8,
        lastmod: new Date().toISOString(),
      },
      {
        url: "/skills",
        changefreq: "monthly",
        priority: 0.7,
        lastmod: new Date().toISOString(),
      },
      {
        url: "/contact",
        changefreq: "monthly",
        priority: 0.6,
        lastmod: new Date().toISOString(),
      },
    ];

    // Create each URL row
    pages.forEach((page) => {
      smStream.write(page);
    });

    // End sitemap stream
    smStream.end();

    // Generate sitemap and save to public folder
    const sitemap = await streamToPromise(smStream);
    createWriteStream("./public/sitemap.xml").write(sitemap.toString());

    console.log("Sitemap generated successfully");
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }
};

export default generateSitemap;
