import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import { getPortfolioData } from "@/lib/getPortfolioData";
import { canonicalFor } from "@/lib/seo/urls.mjs";

export const dynamic = "force-dynamic";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

const Skills = NextDynamic(() => import("@/components/skills/Skills"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

const Footer = NextDynamic(() => import("@/components/Footer"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

// Returns the Skills collection in the wrapper shape ({ data, lastUpdate })
// that the Skills component expects, sharing the homepage's db.json fallback
// so this page never renders empty when MongoDB is unreachable.
async function getSkillsData() {
  const portfolioData = await getPortfolioData();
  return portfolioData?.Skills || { data: [] };
}

export async function generateMetadata() {
  const skills = (await getSkillsData())?.data || [];

  return {
    title: "Skills & Technologies | Mahbub Alam - Full Stack Developer",
    description: `Mahbub Alam's technical skills include ${skills.length} technologies: React, Next.js, Node.js, Python, FastAPI, PHP, Laravel, MongoDB, MySQL, Docker, and more. Software Engineer expertise across backend, full-stack and applied AI.`,
    alternates: {
      // Overrides the site-wide canonical in app/layout.js — see projects page.
      canonical: canonicalFor("/skills/"),
    },
    keywords: [
      "Mahbub Alam Skills",
      "Full Stack Developer Skills",
      "Technical Skills",
      "React Skills",
      "Next.js Skills",
      "Node.js Skills",
      "Python Skills",
      "FastAPI Skills",
      "PHP Skills",
      "Laravel Skills",
      "MongoDB Skills",
      "MySQL Skills",
      "PostgreSQL Skills",
      "Docker Skills",
      "JavaScript Skills",
      "TypeScript Skills",
      "Web Development Skills",
      "Mobile Development Skills",
      "Applied AI Skills",
      "System Architecture Skills",
      "DevSecOps Skills",
      "Cloud Computing Skills",
      "Mahbub Alam Technologies",
      "Programming Languages",
      "Frameworks",
      "Databases",
      "Cloud Platforms",
    ],
    openGraph: {
      title: "Skills & Technologies | Mahbub Alam - Full Stack Developer",
      description: `Mahbub Alam's technical skills include ${skills.length} technologies. Software Engineer expertise across backend, full-stack and applied AI.`,
      url: canonicalFor("/skills/"),
      siteName: "Mahbub Alam Portfolio",
      images: [
        {
          url: "/assets/img/og-cover.jpg",
          width: 1200,
          height: 630,
          alt: "Skills & Technologies - Mahbub Alam Full Stack Developer",
        },
      ],
    },
    twitter: {
      title: "Skills & Technologies | Mahbub Alam - Full Stack Developer",
      description: `Mahbub Alam's technical skills include ${skills.length} technologies. Full Stack Developer expertise in web and mobile development.`,
      images: ["/assets/img/og-cover.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SkillsPage() {
  const skillsData = await getSkillsData();

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar />
      </Suspense>

      <main className="container">
        <Suspense fallback={<div>Loading...</div>}>
          <Skills data={skillsData} headingLevel="h1" />
        </Suspense>
      </main>

      <Suspense fallback={<div>Loading...</div>}>
        <Footer />
      </Suspense>
    </div>
  );
}