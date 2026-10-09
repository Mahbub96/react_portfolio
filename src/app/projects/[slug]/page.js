/**
 * Project detail page -> /projects/<slug>/
 *
 * Projects with a written case study (lib/seo/caseStudies.mjs) are indexable
 * long-form pages with their own title, description, image and
 * SoftwareSourceCode schema — these are what let the site rank for technical
 * queries beyond the owner's name. Projects without one still render here,
 * but with `noindex`, so a ~100-word page never competes as thin content.
 */

import { notFound } from "next/navigation";
import { Suspense } from "react";
import NextDynamic from "next/dynamic";

import { getPortfolioData } from "@/lib/getPortfolioData";
import {
  findProjectBySlug,
  isIndexableProject,
  projectPath,
} from "@/lib/seo/projectCatalog.mjs";
import { caseStudyFor } from "@/lib/seo/caseStudies.mjs";
import { buildPageGraph, projectNode } from "@/lib/seo/structuredData.mjs";
import { clampDescription, pageMetadata } from "@/lib/seo/metadata.mjs";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/siteConfig.mjs";
import { absoluteUrl } from "@/lib/seo/urls.mjs";

import ProjectDetail from "@/components/projects/detail/ProjectDetail";
import JsonLd from "@/components/seo/JsonLd";

export const dynamic = "force-dynamic";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), {
  ssr: true,
});

const Footer = NextDynamic(() => import("@/components/Footer"), {
  ssr: true,
});

/** All project images are 1024×576 (16:9); declare the real size. */
const PROJECT_IMAGE_SIZE = { width: 1024, height: 576 };

async function loadProjects() {
  const portfolioData = await getPortfolioData();
  return portfolioData?.Projects?.data || [];
}

function shortName(name = "") {
  return String(name).split(/\s+[\u2013\u2014:]\s+/)[0].trim() || name;
}

function describe(project, caseStudy) {
  return clampDescription(caseStudy?.summary || project.description || `${project.name} — a project by Mahbub Alam.`);
}

export async function generateMetadata({ params }) {
  const projects = await loadProjects();
  const project = findProjectBySlug(projects, params?.slug);

  if (!project) {
    return { title: "Project not found", robots: { index: false, follow: true } };
  }

  const caseStudy = caseStudyFor(project.slug);
  const image = project.image
    ? {
        url: project.image,
        ...PROJECT_IMAGE_SIZE,
        alt: `${shortName(project.name)} — project screenshot`,
      }
    : DEFAULT_OG_IMAGE;

  return pageMetadata({
    path: projectPath(project),
    title: caseStudy?.title || project.name,
    description: describe(project, caseStudy),
    image,
    ogType: "article",
    noindex: !isIndexableProject(project),
  });
}

export default async function ProjectDetailPage({ params }) {
  const projects = await loadProjects();
  const project = findProjectBySlug(projects, params?.slug);

  if (!project) notFound();

  const caseStudy = caseStudyFor(project.slug);
  const path = projectPath(project);
  const name = caseStudy?.headline || project.name;

  const graph = buildPageGraph({
    path,
    name,
    description: describe(project, caseStudy),
    type: "WebPage",
    breadcrumb: [
      { name: "Projects", path: "/projects/" },
      { name: shortName(project.name), path },
    ],
    mainEntity: { "@id": `${absoluteUrl(path)}#project` },
    nodes: [
      projectNode({
        ...project,
        summary: caseStudy?.summary,
        keywords: caseStudy?.keywords,
      }),
    ],
  });

  return (
    <div>
      <JsonLd data={graph} />

      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main>
        <ProjectDetail project={project} caseStudy={caseStudy} />
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
