import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";
import { getPortfolioFallback } from "@/lib/portfolioFallback";

export default async function sitemap() {
  const baseUrl = "https://mahbub.dev";

  try {
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
      // If DB is unreachable, use fallback projects
      const fallback = getPortfolioFallback();
      projects = fallback.Projects?.data || [];
    }

    // Collect valid project image URLs to associate with the projects page
    const projectImages = projects
      .filter((project) => Boolean(project?.src))
      .map((project) => ({
        loc: project.src.startsWith("http")
          ? project.src
          : `${baseUrl}${project.src}`,
      }));

    // All valid, canonical, navigable routes (with trailing slash per next.config.js)
    return [
      {
        url: `${baseUrl}/`,
        lastModified: new Date("2025-01-01"),
        changeFrequency: "weekly",
        priority: 1.0,
        images: [
          { loc: `${baseUrl}/assets/img/profile.png` },
          { loc: `${baseUrl}/assets/img/og-cover.jpg` },
        ],
      },
      {
        url: `${baseUrl}/projects/`,
        lastModified: new Date("2025-01-01"),
        changeFrequency: "weekly",
        priority: 0.9,
        ...(projectImages.length > 0 ? { images: projectImages } : {}),
      },
      {
        url: `${baseUrl}/skills/`,
        lastModified: new Date("2025-01-01"),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/contact/`,
        lastModified: new Date("2025-01-01"),
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return [
      {
        url: `${baseUrl}/`,
        lastModified: new Date("2025-01-01"),
        changeFrequency: "weekly",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/projects/`,
        lastModified: new Date("2025-01-01"),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/skills/`,
        lastModified: new Date("2025-01-01"),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/contact/`,
        lastModified: new Date("2025-01-01"),
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ];
  }
}
