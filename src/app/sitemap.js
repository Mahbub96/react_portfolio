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

    // Get profile data for image sitemap
    const profile =
      portfolioData.find((item) => item.collectionName === "profile")?.data ||
      {};

    // Static pages with enhanced SEO
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
        images: [
          {
            loc: `${baseUrl}/assets/img/profile.png`,
            title: "Mahbub Alam - Full Stack Developer Professional Headshot",
            caption:
              "Professional headshot of Mahbub Alam, Full Stack Developer",
            geoLocation: "Dhaka, Bangladesh",
            license: `${baseUrl}/licenses/profile-image`,
          },
          {
            loc: `${baseUrl}/assets/img/profile-og.png`,
            title: "Mahbub Alam Portfolio Open Graph Image",
            caption: "Mahbub Alam Portfolio Banner for Social Media",
            geoLocation: "Dhaka, Bangladesh",
            license: `${baseUrl}/licenses/profile-image`,
          },
        ],
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

    // Dynamic project pages with enhanced metadata and images
    const projectPages = projects.map((project, index) => ({
      url: `${baseUrl}/#projects`,
      lastModified: new Date(
        project.updatedAt || project.createdAt || Date.now()
      ),
      changeFrequency: "monthly",
      priority: 0.7,
      ...(project.src && {
        images: [
          {
            loc: project.src.startsWith("http")
              ? project.src
              : `${baseUrl}${project.src}`,
            title: `${project.name} - Project Screenshot`,
            caption: project.desc || `Screenshot of ${project.name} project`,
            geoLocation: "Dhaka, Bangladesh",
            license: `${baseUrl}/licenses/project-images`,
          },
        ],
      }),
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
      {
        url: `${baseUrl}/resume`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/services`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];

    // Image sitemap entries
    const imagePages = [
      {
        url: `${baseUrl}/assets/img/profile.png`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
        images: [
          {
            loc: `${baseUrl}/assets/img/profile.png`,
            title: "Mahbub Alam - Full Stack Developer Professional Headshot",
            caption:
              "Professional headshot of Mahbub Alam, Full Stack Developer based in Dhaka, Bangladesh",
            geoLocation: "Dhaka, Bangladesh",
            license: `${baseUrl}/licenses/profile-image`,
          },
        ],
      },
      {
        url: `${baseUrl}/assets/img/profile-og.png`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
        images: [
          {
            loc: `${baseUrl}/assets/img/profile-og.png`,
            title: "Mahbub Alam Portfolio Open Graph Image",
            caption:
              "Mahbub Alam Portfolio Banner optimized for social media sharing",
            geoLocation: "Dhaka, Bangladesh",
            license: `${baseUrl}/licenses/profile-image`,
          },
        ],
      },
      {
        url: `${baseUrl}/assets/img/profile-twitter.png`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
        images: [
          {
            loc: `${baseUrl}/assets/img/profile-twitter.png`,
            title: "Mahbub Alam Portfolio Twitter Card",
            caption: "Mahbub Alam Portfolio optimized for Twitter sharing",
            geoLocation: "Dhaka, Bangladesh",
            license: `${baseUrl}/licenses/profile-image`,
          },
        ],
      },
    ];

    return [...staticPages, ...projectPages, ...seoPages, ...imagePages];
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Fallback to static sitemap with enhanced URLs and images
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1,
        images: [
          {
            loc: `${baseUrl}/assets/img/profile.png`,
            title: "Mahbub Alam - Full Stack Developer Professional Headshot",
            caption:
              "Professional headshot of Mahbub Alam, Full Stack Developer",
            geoLocation: "Dhaka, Bangladesh",
            license: `${baseUrl}/licenses/profile-image`,
          },
        ],
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
