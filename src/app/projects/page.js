import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import { getPortfolioData } from "@/lib/getPortfolioData";

export const dynamic = "force-dynamic";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

const Projects = NextDynamic(() => import("@/components/projects/Projects"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

const Footer = NextDynamic(() => import("@/components/Footer"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

// Returns the Projects collection in the wrapper shape ({ data, lastUpdate })
// that the Projects component expects, sharing the homepage's db.json fallback
// so this page never renders empty when MongoDB is unreachable.
async function getProjectsData() {
  const portfolioData = await getPortfolioData();
  return portfolioData?.Projects || { data: [] };
}

export async function generateMetadata() {
  const projects = (await getProjectsData())?.data || [];

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
          url: "/assets/img/og-cover.jpg",
          width: 1200,
          height: 630,
          alt: "Projects by Mahbub Alam - Full Stack Developer",
        },
      ],
    },
    twitter: {
      title: "Projects by Mahbub Alam | Full Stack Developer Portfolio",
      description: `Explore ${projects.length} projects by Mahbub Alam - Full Stack Developer. Web applications, mobile apps, and innovative solutions.`,
      images: ["/assets/img/og-cover.jpg"],
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
          <Projects data={projectsData} headingLevel="h1" />
        </Suspense>
      </main>

      <Suspense fallback={<div>Loading...</div>}>
        <Footer />
      </Suspense>
    </div>
  );
}