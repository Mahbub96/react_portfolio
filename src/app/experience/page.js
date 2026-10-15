import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import { getPortfolioData } from "@/lib/getPortfolioData";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import { buildPageGraph } from "@/lib/seo/structuredData.mjs";

export const dynamic = "force-dynamic";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), {
  ssr: true,
});

const Experience = NextDynamic(
  () => import("@/components/experiences/Experience"),
  {
    ssr: true,
  }
);

const Footer = NextDynamic(() => import("@/components/Footer"), {
  ssr: true,
});

const TITLE = "Work Experience";
const DESCRIPTION = `Professional engineering experience and career history of ${SITE_AUTHOR.name}, ${SITE_AUTHOR.jobTitle}.`;

export const metadata = pageMetadata({
  path: "/experience/",
  title: TITLE,
  description: DESCRIPTION,
});

export default async function ExperiencePage() {
  const portfolioData = await getPortfolioData();
  const experiencesData = portfolioData?.Experiences || { data: [] };

  const graph = buildPageGraph({
    path: "/experience/",
    name: `${TITLE} — ${SITE_AUTHOR.name}`,
    description: DESCRIPTION,
    type: "WebPage",
    breadcrumb: [{ name: "Experience", path: "/experience/" }],
  });

  return (
    <div>
      <JsonLd data={graph} />

      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main role="main" style={{ paddingTop: "5rem" }}>
        <Suspense fallback={null}>
          <Experience data={experiencesData} headingLevel="h1" />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer data={portfolioData} />
      </Suspense>
    </div>
  );
}
