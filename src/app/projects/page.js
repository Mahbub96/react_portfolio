import { Suspense } from "react";
import dynamic from "next/dynamic";
import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";

const Navbar = dynamic(() => import("@/components/navbar/Navbar"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

const Projects = dynamic(() => import("@/components/projects/Projects"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

async function getProjectsData() {
  try {
    await connectDB();
    const projectsDoc = await PortfolioData.findOne({
      collectionName: "Projects",
    }).lean();
    return projectsDoc?.data || [];
  } catch (error) {
    console.error("Error fetching projects data:", error);
    return [];
  }
}

export async function generateMetadata() {
  const projects = await getProjectsData();

  return {
    title: "Projects",
    description: `Explore ${projects.length} projects by Mahbub Alam - Full Stack Developer. Web applications, mobile apps, and innovative solutions.`,
    keywords: [
      "Projects",
      "Portfolio",
      "Web Development",
      "React",
      "Node.js",
      "PHP",
      "Mahbub Alam",
    ],
    openGraph: {
      title: "Projects | Mahbub Alam Portfolio",
      description: `Explore ${projects.length} projects by Mahbub Alam - Full Stack Developer.`,
      url: "https://mahbub.dev/projects",
    },
    twitter: {
      title: "Projects | Mahbub Alam Portfolio",
      description: `Explore ${projects.length} projects by Mahbub Alam - Full Stack Developer.`,
    },
  };
}

export default async function ProjectsPage() {
  const projectsData = await getProjectsData();

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar />
      </Suspense>

      <main className="container">
        <Suspense fallback={<div>Loading...</div>}>
          <Projects data={projectsData} />
        </Suspense>
      </main>

      <Suspense fallback={<div>Loading...</div>}>
        <Footer />
      </Suspense>
    </div>
  );
}
