import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";

export default async function sitemap() {
  const baseUrl = "https://mahbub.dev";

  try {
    await connectDB();

    // Get portfolio data for dynamic routes
    const portfolioData = await PortfolioData.find({}).lean();

    // Transform data to get project slugs
    const projects =
      portfolioData.find((item) => item.collectionName === "Projects")?.data ||
      [];

    // Static pages with enhanced SEO
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/projects`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/skills`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/#about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/#experience`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/#education`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/#contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];

    // Dynamic project pages with enhanced metadata
    const projectPages = projects.map((project, index) => ({
      url: `${baseUrl}/#projects`,
      lastModified: new Date(
        project.updatedAt || project.createdAt || Date.now()
      ),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    // Additional SEO-focused URLs
    const seoPages = [
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/experience`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/education`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ];

    return [...staticPages, ...projectPages, ...seoPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Fallback to static sitemap with enhanced URLs
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/projects`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/skills`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ];
  }
}
