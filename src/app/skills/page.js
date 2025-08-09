import { Suspense } from "react";
import dynamic from "next/dynamic";
import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";

const Navbar = dynamic(() => import("@/components/navbar/Navbar"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

const Skills = dynamic(() => import("@/components/skills/Skills"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

async function getSkillsData() {
  try {
    await connectDB();
    const skillsDoc = await PortfolioData.findOne({
      collectionName: "Skills",
    }).lean();
    return skillsDoc?.data || [];
  } catch (error) {
    console.error("Error fetching skills data:", error);
    return [];
  }
}

export async function generateMetadata() {
  const skills = await getSkillsData();

  return {
    title: "Skills & Technologies | Mahbub Alam - Full Stack Developer",
    description: `Mahbub Alam's technical skills include ${skills.length} technologies: React, Node.js, PHP, Laravel, CodeIgniter, MongoDB, MySQL, AWS, Docker, and more. Full Stack Developer expertise in web and mobile development.`,
    keywords: [
      "Mahbub Alam Skills",
      "Full Stack Developer Skills",
      "Technical Skills",
      "React Skills",
      "Node.js Skills",
      "PHP Skills",
      "Laravel Skills",
      "CodeIgniter Skills",
      "MongoDB Skills",
      "MySQL Skills",
      "AWS Skills",
      "Docker Skills",
      "JavaScript Skills",
      "TypeScript Skills",
      "Web Development Skills",
      "Mobile Development Skills",
      "VoIP Skills",
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
      description: `Mahbub Alam's technical skills include ${skills.length} technologies. Full Stack Developer expertise in web and mobile development.`,
      url: "https://mahbub.dev/skills",
      siteName: "Mahbub Alam Portfolio",
      images: [
        {
          url: "/assets/img/profile.png",
          width: 1200,
          height: 630,
          alt: "Skills & Technologies - Mahbub Alam Full Stack Developer",
        },
      ],
    },
    twitter: {
      title: "Skills & Technologies | Mahbub Alam - Full Stack Developer",
      description: `Mahbub Alam's technical skills include ${skills.length} technologies. Full Stack Developer expertise in web and mobile development.`,
      images: ["/assets/img/profile.png"],
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
          <Skills data={skillsData} />
        </Suspense>
      </main>

      <Suspense fallback={<div>Loading...</div>}>
        <Footer />
      </Suspense>
    </div>
  );
}
