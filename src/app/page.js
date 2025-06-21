import React, { Suspense } from "react";
import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";
import LoadingScreen from "@/components/LoadingScreen";

// Import components directly for better SSR
import Navbar from "@/components/navbar/Navbar";
import Banner from "@/components/banner/Banner";
import About from "@/components/about/About";
import Skills from "@/components/skills/Skills";
import Experience from "@/components/experiences/Experience";
import Educations from "@/components/educations/Educations";
import Projects from "@/components/projects/Projects";
import Contact from "@/components/contact/Contact";
import Footer from "@/components/Footer";

// Client-side only components (for analytics and tracking)
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
    title: "Mahbub Alam | Full Stack Developer Portfolio",
    description:
      profile.bio ||
      "Portfolio of Mahbub Alam - Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh.",
    keywords: [
      "Mahbub Alam",
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
      canonical: "/",
    },
    openGraph: {
      title: "Mahbub Alam | Full Stack Developer Portfolio",
      description:
        profile.bio ||
        "Portfolio of Mahbub Alam - Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies.",
      url: "https://mahbub.dev",
      siteName: "Mahbub Alam Portfolio",
      images: [
        {
          url: "/assets/img/profile.png",
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
      title: "Mahbub Alam | Full Stack Developer Portfolio",
      description:
        profile.bio ||
        "Portfolio of Mahbub Alam - Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies.",
      images: ["/assets/img/profile.png"],
      creator: "@mahbubcse96",
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
  const portfolioData = await getPortfolioData();
  const profile = portfolioData.profile?.data || {};

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name || "Mahbub Alam",
    jobTitle: profile.title || "Full Stack Developer",
    description:
      profile.bio ||
      "Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies",
    url: "https://mahbub.dev",
    image: profile.image || "/assets/img/profile.png",
    sameAs: [profile.github, profile.linkedin, profile.twitter].filter(Boolean),
    worksFor: {
      "@type": "Organization",
      name: "Brotecs Technologies Ltd",
      url: "https://brotecs.com",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dhaka",
      addressCountry: "Bangladesh",
    },
    knowsAbout: [
      "React.js",
      "Node.js",
      "PHP",
      "Laravel",
      "MongoDB",
      "MySQL",
      "AWS",
      "Docker",
      "VoIP Solutions",
      "System Architecture",
    ],
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
        <Banner data={portfolioData.Banner} />
        <About data={portfolioData.profile} />
        <Skills data={portfolioData.Skills} />
        <Experience data={portfolioData.Experiences} />
        <Educations data={portfolioData.Education} />
        <Projects data={portfolioData.projectsData} />
        <Contact data={portfolioData} />
        <Footer data={portfolioData} />
      </main>

      {/* Client-side only components */}
      <VisitorAnalytics />
      <VisitorCounter />
    </>
  );
}
