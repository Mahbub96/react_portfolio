export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "images") {
      return generateImageSitemap();
    }

    return generateMainSitemap();
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}

async function generateMainSitemap() {
  const baseUrl = "https://mahbub.dev";

  try {
    await connectDB();
    const portfolioData = await PortfolioData.find({}).lean();

    const projects =
      portfolioData.find((item) => item.collectionName === "Projects")?.data ||
      [];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/profile.png</image:loc>
      <image:title>Mahbub Alam - Full Stack Developer Professional Headshot</image:title>
      <image:caption>Professional headshot of Mahbub Alam, Full Stack Developer based in Dhaka, Bangladesh</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/profile-image</image:license>
    </image:image>
    <image:image>
      <image:loc>${baseUrl}/assets/img/profile-og.png</image:loc>
      <image:title>Mahbub Alam Portfolio Open Graph Image</image:title>
      <image:caption>Mahbub Alam Portfolio Banner for Social Media</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/profile-image</image:license>
    </image:image>
  </url>
  
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/projects</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/skills</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/#about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/#experience</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/#education</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/#contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  ${projects
    .map(
      (project, index) => `
  <url>
    <loc>${baseUrl}/#projects</loc>
    <lastmod>${new Date(
      project.updatedAt || project.createdAt || Date.now()
    ).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    ${
      project.src
        ? `
    <image:image>
      <image:loc>${
        project.src.startsWith("http")
          ? project.src
          : `${baseUrl}${project.src}`
      }</image:loc>
      <image:title>${project.name} - Project Screenshot</image:title>
      <image:caption>${
        project.desc || `Screenshot of ${project.name} project`
      }</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/project-images</image:license>
    </image:image>
    `
        : ""
    }
  </url>
  `
    )
    .join("")}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error generating main sitemap:", error);

    // Fallback sitemap
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/profile.png</image:loc>
      <image:title>Mahbub Alam - Full Stack Developer Professional Headshot</image:title>
      <image:caption>Professional headshot of Mahbub Alam, Full Stack Developer</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/profile-image</image:license>
    </image:image>
  </url>
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }
}

async function generateImageSitemap() {
  const baseUrl = "https://mahbub.dev";

  const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Profile Images -->
  <url>
    <loc>${baseUrl}/assets/img/profile.png</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/profile.png</image:loc>
      <image:title>Mahbub Alam - Full Stack Developer Professional Headshot</image:title>
      <image:caption>Professional headshot of Mahbub Alam, Full Stack Developer based in Dhaka, Bangladesh. High-quality professional portrait for portfolio and business use.</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/profile-image</image:license>
    </image:image>
  </url>
  
  <url>
    <loc>${baseUrl}/assets/img/profile-og.png</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/profile-og.png</image:loc>
      <image:title>Mahbub Alam Portfolio Open Graph Image</image:title>
      <image:caption>Mahbub Alam Portfolio Banner optimized for social media sharing and Open Graph protocol</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/profile-image</image:license>
    </image:image>
  </url>
  
  <url>
    <loc>${baseUrl}/assets/img/profile-twitter.png</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/profile-twitter.png</image:loc>
      <image:title>Mahbub Alam Portfolio Twitter Card</image:title>
      <image:caption>Mahbub Alam Portfolio optimized for Twitter sharing and Twitter Cards</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/profile-image</image:license>
    </image:image>
  </url>
  
  <url>
    <loc>${baseUrl}/assets/img/profile-thumbnail.png</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/profile-thumbnail.png</image:loc>
      <image:title>Mahbub Alam Profile Thumbnail</image:title>
      <image:caption>Thumbnail version of Mahbub Alam's professional headshot for use in lists and previews</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/profile-image</image:license>
    </image:image>
  </url>
  
  <!-- Technology Icons -->
  <url>
    <loc>${baseUrl}/assets/img/tech/react.png</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/tech/react.png</image:loc>
      <image:title>React.js Technology Icon</image:title>
      <image:caption>React.js logo and technology icon representing React development skills</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/tech-icons</image:license>
    </image:image>
  </url>
  
  <url>
    <loc>${baseUrl}/assets/img/tech/nodejs.png</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/tech/nodejs.png</image:loc>
      <image:title>Node.js Technology Icon</image:title>
      <image:caption>Node.js logo and technology icon representing Node.js development skills</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/tech-icons</image:license>
    </image:image>
  </url>
  
  <url>
    <loc>${baseUrl}/assets/img/tech/php.png</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/tech/php.png</image:loc>
      <image:title>PHP Technology Icon</image:title>
      <image:caption>PHP logo and technology icon representing PHP development skills</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/tech-icons</image:license>
    </image:image>
  </url>
  
  <url>
    <loc>${baseUrl}/assets/img/tech/laravel.png</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/tech/laravel.png</image:loc>
      <image:title>Laravel Technology Icon</image:title>
      <image:caption>Laravel logo and technology icon representing Laravel framework skills</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/tech-icons</image:license>
    </image:image>
  </url>
  
  <url>
    <loc>${baseUrl}/assets/img/tech/mongodb.png</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/tech/mongodb.png</image:loc>
      <image:title>MongoDB Technology Icon</image:title>
      <image:caption>MongoDB logo and technology icon representing MongoDB database skills</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/tech-icons</image:license>
    </image:image>
  </url>
  
  <url>
    <loc>${baseUrl}/assets/img/tech/aws.png</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/tech/aws.png</image:loc>
      <image:title>AWS Technology Icon</image:title>
      <image:caption>AWS logo and technology icon representing Amazon Web Services cloud skills</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/tech-icons</image:license>
    </image:image>
  </url>
  
  <url>
    <loc>${baseUrl}/assets/img/tech/docker.png</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${baseUrl}/assets/img/tech/docker.png</image:loc>
      <image:title>Docker Technology Icon</image:title>
      <image:caption>Docker logo and technology icon representing Docker containerization skills</image:caption>
      <image:geo_location>Dhaka, Bangladesh</image:geo_location>
      <image:license>${baseUrl}/licenses/tech-icons</image:license>
    </image:image>
  </url>
</urlset>`;

  return new NextResponse(imageSitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
