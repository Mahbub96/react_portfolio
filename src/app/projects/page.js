import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import { getPortfolioData } from "@/lib/getPortfolioData";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import {
  buildPageGraph,
  projectListNode,
} from "@/lib/seo/structuredData.mjs";
import { indexableProjects } from "@/lib/seo/projectCatalog.mjs";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";

export const dynamic = "force-dynamic";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), {
  ssr: true,
});

const Projects = NextDynamic(() => import("@/components/projects/Projects"), {
  ssr: true,
});

const Footer = NextDynamic(() => import("@/components/Footer"), {
  ssr: true,
});

// Returns the Projects collection in the wrapper shape ({ data, lastUpdate })
// that the Projects component expects, sharing the homepage's db.json fallback
// so this page never renders empty when MongoDB is unreachable.
async function getProjectsData() {
  const portfolioData = await getPortfolioData();
  return portfolioData?.Projects || { data: [] };
}

const TITLE = "Projects";
const DESCRIPTION = `Software projects by ${SITE_AUTHOR.name}: backend platforms, applied AI and speech recognition, full-stack web apps and mobile apps built with NestJS, Python, Next.js and React.`;

export const metadata = pageMetadata({
  path: "/projects/",
  title: TITLE,
  description: DESCRIPTION,
});

export default async function ProjectsPage() {
  const projectsData = await getProjectsData();

  const graph = buildPageGraph({
    path: "/projects/",
    name: `${TITLE} — ${SITE_AUTHOR.name}`,
    description: DESCRIPTION,
    type: "CollectionPage",
    breadcrumb: [{ name: TITLE, path: "/projects/" }],
    nodes: [projectListNode(indexableProjects(projectsData?.data || []))],
  });

  return (
    <div>
      <JsonLd data={graph} />

      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main className="container">
        <Suspense fallback={null}>
          <Projects data={projectsData} headingLevel="h1" />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
