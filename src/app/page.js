import React, { Suspense } from "react";
import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";
import LoadingScreen from "@/components/LoadingScreen";

// Import server-side components for better SEO
import Navbar from "@/components/navbar/Navbar";
import BannerServer from "@/components/banner/BannerServer";
import SkillsServer from "@/components/skills/SkillsServer";
import Experience from "@/components/experiences/Experience";
import Educations from "@/components/educations/Educations";
import ProjectsServer from "@/components/projects/ProjectsServer";
import Contact from "@/components/contact/Contact";
import Footer from "@/components/Footer";

// Client-side only components (for analytics, tracking, and interactive features)
import dynamic from "next/dynamic";

const VisitorAnalytics = dynamic(
  () => import("@/components/VisitorAnalytics"),
  {
    ssr: false, // Client-side only for analytics
  }
);

const VisitorCounter = dynamic(() => import("@/components/VisitorCounter"), {
  ssr: false, // Client-side only for tracking
});

// Client-side components for interactive features
const BannerAnimation = dynamic(
  () => import("@/components/banner/BannerAnimation"),
  {
    ssr: false, // Client-side only for typing animation
  }
);

// Server-side data fetching with caching
async function getPortfolioData() {
  try {
    await connectDB();
    const portfolioData = await PortfolioData.find({}).lean();

    // Transform data to match the expected structure
    const transformedData = {};
    portfolioData.forEach((item) => {
      transformedData[item.collectionName] = {
        data: item.data,
        lastUpdate: item.lastUpdate,
      };
    });

    return transformedData;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return {};
  }
}

// Generate metadata for SEO
export async function generateMetadata() {
  const portfolioData = await getPortfolioData();
  const profile = portfolioData.profile?.data || {};

  return {
    title:
      "Mahbub Alam | Full Stack Developer Portfolio - React, Node.js, Next.js, React Native, PHP Expert",
    description:
      profile.bio ||
      "Mahbub Alam is a Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh. Contact: admin@mahbub.dev, support@mahbub.dev, mahbub@lunetsoft.com",
    keywords: [
      "Mahbub Alam",
      "Mahbub",
      "Full Stack Developer",
      "Web Developer",
      "React Developer",
      "PHP Developer",
      "Node.js Developer",
      "VoIP Solutions",
      "Bangladesh Developer",
      "Dhaka",
      "Brotecs Technologies",
      "Laravel",
      "CodeIgniter",
      "MongoDB",
      "MySQL",
      "AWS",
      "Docker",
      "DevSecOps",
      "admin@mahbub.dev",
      "support@mahbub.dev",
      "mahbub@lunetsoft.com",
      "System Architecture",
      "Cloud Computing",
      "Web Applications",
      "Mobile Development",
      "React Native",
      "JavaScript",
      "TypeScript",
      "Git",
      "CI/CD",
    ],
    authors: [{ name: "Mahbub Alam" }],
    creator: "Mahbub Alam",
    publisher: "Mahbub Alam",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://mahbub.dev"),
    alternates: {
      canonical: "https://mahbub.dev/",
    },
    openGraph: {
      title:
        "Mahbub Alam | Full Stack Developer Portfolio - React, Node.js, PHP Expert",
      description:
        profile.bio ||
        "Mahbub Alam is a Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh. Contact: admin@mahbub.dev, support@mahbub.dev, mahbub@lunetsoft.com",
      url: "https://mahbub.dev",
      siteName: "Mahbub Alam Portfolio",
      images: [
        {
          url: "https://mahbub.dev/assets/img/profile.png",
          width: 1200,
          height: 630,
          alt: "Mahbub Alam - Full Stack Developer",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title:
        "Mahbub Alam | Full Stack Developer Portfolio - React, Node.js, PHP Expert",
      description:
        profile.bio ||
        "Mahbub Alam is a Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh. Contact: admin@mahbub.dev, support@mahbub.dev, mahbub@lunetsoft.com",
      images: ["https://mahbub.dev/assets/img/profile.png"],
      creator: "@mahbubcse96",
      site: "@mahbubcse96",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
    },
  };
}

export default async function HomePage() {
  try {
    const portfolioData = await getPortfolioData();
    const profile = portfolioData.profile?.data || {};

    // Enhanced structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: profile.name || "Mahbub Alam",
      givenName: "Mahbub",
      familyName: "Alam",
      alternateName: ["Mahbub", "Mahbub Alam", "Md Mahbub Alam"],
      jobTitle: profile.title || "Full Stack Developer",
      description:
        profile.bio ||
        "Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies",
      url: "https://mahbub.dev",
      image: profile.image || "https://mahbub.dev/assets/img/profile.png",
      email: ["admin@mahbub.dev", "support@mahbub.dev", "mahbub@lunetsoft.com"],
      telephone: "+880-1XXX-XXXXXX",
      sameAs: [profile.github, profile.linkedin, profile.twitter].filter(
        Boolean
      ),
      worksFor: {
        "@type": "Organization",
        name: "Brotecs Technologies Ltd",
        url: "https://brotecs.com",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dhaka",
          addressCountry: "Bangladesh",
        },
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Stamford University Bangladesh",
        url: "https://stamforduniversity.edu.bd",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dhaka",
        addressCountry: "Bangladesh",
        addressRegion: "Dhaka",
      },
      knowsAbout: [
        "React.js",
        "Node.js",
        "PHP",
        "Laravel",
        "CodeIgniter",
        "MongoDB",
        "MySQL",
        "AWS",
        "Docker",
        "VoIP Solutions",
        "System Architecture",
        "DevSecOps",
        "Cloud Computing",
        "Web Development",
        "Mobile Development",
        "React Native",
        "JavaScript",
        "TypeScript",
      ],
      hasOccupation: {
        "@type": "Occupation",
        name: "Full Stack Developer",
        skills: [
          "React",
          "Node.js",
          "PHP",
          "Laravel",
          "AWS",
          "Docker",
          "MongoDB",
          "MySQL",
          "JavaScript",
          "TypeScript",
        ],
        occupationalCategory: "15-1250 Software Developers and Programmers",
      },
    };

    return (
      <>
        {/* Skip to content link for accessibility */}
        <a href="#about" className="skip-link">
          Skip to main content
        </a>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        <Navbar data={portfolioData} />

        <main className="home" role="main">
          {/* Server-side Banner with client-side animation overlay */}
          <BannerServer
            data={portfolioData.Banner}
            profileImage={profile.image}
            profile={portfolioData.profile}
            experiences={portfolioData.Experiences?.data}
            projects={portfolioData.Projects?.data}
          />

          {/* Server-side Skills section */}
          <SkillsServer data={portfolioData.Skills} />

          {/* Server-side Experience section */}
          <Experience data={portfolioData.Experiences} />

          {/* Server-side Education section */}
          <Educations data={portfolioData.Educations} />

          {/* Server-side Projects section */}
          <ProjectsServer data={portfolioData.Projects} />

          {/* Server-side Contact section */}
          <Contact data={portfolioData} />

          {/* Server-side Footer */}
          <Footer data={portfolioData} />
        </main>

        {/* Client-side only components */}
        <VisitorAnalytics />
        <VisitorCounter />
      </>
    );
  } catch (error) {
    console.error("Error rendering home page:", error);
    return <LoadingScreen />;
  }
}
