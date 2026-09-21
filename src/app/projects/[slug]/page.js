/**
 * Project detail page -> /projects/<slug>/
 *
 * These pages are the reason the site can rank for anything beyond the owner's
 * name: each one is a distinct URL about a distinct piece of engineering, with
 * its own title, description and SoftwareSourceCode schema. Previously all ten
 * projects lived as cards on a single route and competed for one listing.
 *
 * Content comes from the same portfolio source as everything else — adding a
 * project to the database creates its page, its sitemap entry and its llms.txt
 * line with no code change here.
 */

import { notFound } from "next/navigation";
import { Suspense } from "react";
import NextDynamic from "next/dynamic";

import { getPortfolioData } from "@/lib/getPortfolioData";
import { canonicalFor } from "@/lib/seo/urls.mjs";
import {
  findProjectBySlug,
  indexableProjects,
  projectPath,
} from "@/lib/seo/projectCatalog.mjs";
import {
  buildProjectJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/structuredData.mjs";

import ProjectDetail from "@/components/projects/detail/ProjectDetail";

export const dynamic = "force-dynamic";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), {
  ssr: true,
});

const Footer = NextDynamic(() => import("@/components/Footer"), {
  ssr: true,
});

async function loadProjects() {
  const portfolioData = await getPortfolioData();
  return portfolioData?.Projects?.data || [];
}

/**
 * Pre-declare the indexable slugs.
 *
 * Keeps the route enumerable for the build even though rendering is dynamic —
 * without it, a detail URL only exists once something links to it.
 */
export async function generateStaticParams() {
  try {
    const projects = await loadProjects();
    return indexableProjects(projects).map((project) => ({
      slug: project.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const projects = await loadProjects();
  const project = findProjectBySlug(projects, params?.slug);

  if (!project) {
    // Tell crawlers not to index a URL that resolves to the not-found page.
    return {
      title: "Project not found",
      robots: { index: false, follow: true },
    };
  }

  const url = canonicalFor(projectPath(project));
  const stack = project.stack.slice(0, 6).join(", ");
  const description = project.description
    ? `${project.description}${stack ? ` Built with ${stack}.` : ""}`.slice(0, 300)
    : `${project.name} — a project by Mahbub Alam.`;

  return {
    title: `${project.name} | Project by Mahbub Alam`,
    description,
    alternates: { canonical: url },
    keywords: [
      project.name,
      ...project.stack,
      "Mahbub Alam",
      "Software Engineer",
      "Portfolio Project",
    ],
    openGraph: {
      type: "article",
      title: `${project.name} | Project by Mahbub Alam`,
      description,
      url,
      siteName: "Mahbub Alam Portfolio",
      images: [
        {
          url: project.image || "/assets/img/og-cover.jpg",
          width: 1200,
          height: 630,
          alt: `${project.name} — project screenshot`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} | Project by Mahbub Alam`,
      description,
      images: [project.image || "/assets/img/og-cover.jpg"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProjectDetailPage({ params }) {
  const projects = await loadProjects();
  const project = findProjectBySlug(projects, params?.slug);

  if (!project) notFound();

  const jsonLd = [
    buildProjectJsonLd(project),
    buildBreadcrumbJsonLd(project),
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main>
        <ProjectDetail project={project} />
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
