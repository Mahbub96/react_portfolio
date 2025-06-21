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
    title: "Skills",
    description: `Mahbub Alam's technical skills include ${skills.length} technologies: React, Node.js, PHP, Laravel, and more. Full Stack Developer expertise.`,
    keywords: [
      "Skills",
      "Technical Skills",
      "React",
      "Node.js",
      "PHP",
      "Laravel",
      "Full Stack Developer",
      "Mahbub Alam",
    ],
    openGraph: {
      title: "Skills | Mahbub Alam Portfolio",
      description: `Mahbub Alam's technical skills include ${skills.length} technologies.`,
      url: "https://mahbub.dev/skills",
    },
    twitter: {
      title: "Skills | Mahbub Alam Portfolio",
      description: `Mahbub Alam's technical skills include ${skills.length} technologies.`,
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
