import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";

const generateSitemap = async () => {
  try {
    const smStream = new SitemapStream({
      hostname: "https://your-domain.com", // Replace with your domain
    });

    // List all your routes
    const pages = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      { url: "/projects", changefreq: "weekly", priority: 0.8 },
      { url: "/skills", changefreq: "monthly", priority: 0.7 },
      { url: "/contact", changefreq: "monthly", priority: 0.6 },
      // Add all your routes
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
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }
};

export default generateSitemap;
