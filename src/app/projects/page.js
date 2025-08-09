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
    title: "Projects by Mahbub Alam | Full Stack Developer Portfolio",
    description: `Explore ${projects.length} projects by Mahbub Alam - Full Stack Developer. Web applications, mobile apps, VoIP solutions, and innovative software projects. React, Node.js, PHP development portfolio.`,
    keywords: [
      "Projects by Mahbub Alam",
      "Mahbub Alam Portfolio",
      "Web Development Projects",
      "React Projects",
      "Node.js Projects",
      "PHP Projects",
      "Full Stack Developer Projects",
      "VoIP Solutions Projects",
      "Web Applications",
      "Mobile Apps",
      "Software Development",
      "Mahbub Alam Work",
      "Brotecs Technologies Projects",
      "Laravel Projects",
      "CodeIgniter Projects",
      "MongoDB Projects",
      "MySQL Projects",
      "AWS Projects",
      "Docker Projects",
    ],
    openGraph: {
      title: "Projects by Mahbub Alam | Full Stack Developer Portfolio",
      description: `Explore ${projects.length} projects by Mahbub Alam - Full Stack Developer. Web applications, mobile apps, and innovative solutions.`,
      url: "https://mahbub.dev/projects",
      siteName: "Mahbub Alam Portfolio",
      images: [
        {
          url: "/assets/img/profile.png",
          width: 1200,
          height: 630,
          alt: "Projects by Mahbub Alam - Full Stack Developer",
        },
      ],
    },
    twitter: {
      title: "Projects by Mahbub Alam | Full Stack Developer Portfolio",
      description: `Explore ${projects.length} projects by Mahbub Alam - Full Stack Developer. Web applications, mobile apps, and innovative solutions.`,
      images: ["/assets/img/profile.png"],
    },
    robots: {
      index: true,
      follow: true,
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
