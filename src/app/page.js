import React, { Suspense } from "react";
import { getPortfolioData } from "@/lib/getPortfolioData";
import LoadingScreen from "@/components/LoadingScreen";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
import nextDynamic from "next/dynamic";

const VisitorAnalytics = nextDynamic(
  () => import("@/components/VisitorAnalytics"),
  {
    ssr: false, // Client-side only for analytics
  }
);

const VisitorCounter = nextDynamic(() => import("@/components/VisitorCounter"), {
  ssr: false, // Client-side only for tracking
});

// Generate metadata for SEO
export async function generateMetadata() {
  const portfolioData = await getPortfolioData();
  const profile = portfolioData.profile?.data || {};

  return {
    title:
      "Mahbub Alam | Software Engineer - Full-Stack, Backend & Applied AI",
    description:
      profile.bio ||
      "Mahbub Alam is a Software Engineer specializing in full-stack, backend, cloud-enabled, and applied AI solutions. Based in Dhaka, Bangladesh.",
    keywords: [
      "Mahbub Alam",
      "Mahbub",
      "Full Stack Developer",
      "Software Engineer",
      "Backend Developer",
      "Applied AI",
      "Web Developer",
      "React Developer",
      "PHP Developer",
      "Node.js Developer",
      "Python Developer",
      "FastAPI",
      "Machine Learning",
      "Computer Vision",
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
      "mahbubcse96@gmail.com",
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
        "Mahbub Alam | Software Engineer - Full-Stack, Backend & Applied AI",
      description:
        profile.bio ||
        "Mahbub Alam is a Software Engineer specializing in full-stack, backend, cloud-enabled, and applied AI solutions. Based in Dhaka, Bangladesh.",
      url: "https://mahbub.dev",
      siteName: "Mahbub Alam Portfolio",
      images: [
        {
          url: "https://mahbub.dev/assets/img/og-cover.jpg",
          width: 1200,
          height: 630,
          alt: "Mahbub Alam - Software Engineer",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title:
        "Mahbub Alam | Software Engineer - Full-Stack, Backend & Applied AI",
      description:
        profile.bio ||
        "Mahbub Alam is a Software Engineer specializing in full-stack, backend, cloud-enabled, and applied AI solutions. Based in Dhaka, Bangladesh.",
      images: ["https://mahbub.dev/assets/img/og-cover.jpg"],
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
      jobTitle: profile.title || "Software Engineer | Full-Stack, Backend & Applied AI",
      description:
        profile.bio ||
        "Software Engineer specializing in full-stack, backend, cloud-enabled, and applied AI solutions",
      url: "https://mahbub.dev",
      image: profile.image || "https://mahbub.dev/assets/img/profile.png",
      email: ["mahbubcse96@gmail.com"],
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
        "Next.js",
        "Python",
        "FastAPI",
        "PHP",
        "Laravel",
        "CodeIgniter",
        "MongoDB",
        "MySQL",
        "AWS",
        "Docker",
        "System Architecture",
        "DevSecOps",
        "Cloud Computing",
        "Web Development",
        "Mobile Development",
        "React Native",
        "JavaScript",
        "TypeScript",
        "Applied AI",
        "Machine Learning",
        "Computer Vision",
      ],
      hasOccupation: {
        "@type": "Occupation",
        name: "Software Engineer",
        skills: [
          "React",
          "Node.js",
          "Next.js",
          "Python",
          "FastAPI",
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
            profile={profile}
            experiences={portfolioData.Experiences?.data}
            projects={portfolioData.Projects?.data}
          />

          {/* Server-side Projects section */}
          <ProjectsServer data={portfolioData.Projects} />

          {/* Server-side Skills section */}
          <SkillsServer data={portfolioData.Skills} />

          {/* Server-side Experience section */}
          <Experience data={portfolioData.Experiences} />

          {/* Server-side Education section */}
          <Educations data={portfolioData.Educations} />

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
    console.log("Error rendering home page:", error);
    return <LoadingScreen />;
  }
}