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

    // Static pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: `${baseUrl}/#about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/#skills`,
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
        url: `${baseUrl}/#projects`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/#contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];

    // Dynamic project pages
    const projectPages = projects.map((project) => ({
      url: `${baseUrl}/#projects`,
      lastModified: new Date(project.updatedAt || project.createdAt),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [...staticPages, ...projectPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Fallback to static sitemap
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
      },
    ];
  }
}
