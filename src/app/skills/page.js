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

const SkillsServer = NextDynamic(
  () => import("@/components/skills/SkillsServer"),
  {
    ssr: true,
  }
);

const Footer = NextDynamic(() => import("@/components/Footer"), {
  ssr: true,
});

const TITLE = "Skills & Technologies";
const DESCRIPTION = `Languages, frameworks and tools ${SITE_AUTHOR.name} uses — Node.js, NestJS, Python, FastAPI, React, Next.js, PostgreSQL, Docker — and core technical strengths.`;

export const metadata = pageMetadata({
  path: "/skills/",
  title: TITLE,
  description: DESCRIPTION,
});

export default async function SkillsPage() {
  const portfolioData = await getPortfolioData();
  const skillsData = portfolioData?.Skills || { data: [] };

  const graph = buildPageGraph({
    path: "/skills/",
    name: `${TITLE} — ${SITE_AUTHOR.name}`,
    description: DESCRIPTION,
    type: "WebPage",
    breadcrumb: [{ name: "Skills", path: "/skills/" }],
  });

  return (
    <div>
      <JsonLd data={graph} />

      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main role="main" style={{ paddingTop: "5rem" }}>
        <Suspense fallback={null}>
          <SkillsServer
            data={skillsData}
            coreStrengths={portfolioData?.CoreStrengths}
            headingLevel="h1"
          />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer data={portfolioData} />
      </Suspense>
    </div>
  );
}
