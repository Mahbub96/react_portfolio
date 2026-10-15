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

const Educations = NextDynamic(
  () => import("@/components/educations/Educations"),
  {
    ssr: true,
  }
);

const Footer = NextDynamic(() => import("@/components/Footer"), {
  ssr: true,
});

const TITLE = "Education";
const DESCRIPTION = `Academic background, degree and certifications of ${SITE_AUTHOR.name}, ${SITE_AUTHOR.jobTitle}.`;

export const metadata = pageMetadata({
  path: "/education/",
  title: TITLE,
  description: DESCRIPTION,
});

export default async function EducationPage() {
  const portfolioData = await getPortfolioData();
  const educationsData = portfolioData?.Educations || { data: [] };

  const graph = buildPageGraph({
    path: "/education/",
    name: `${TITLE} — ${SITE_AUTHOR.name}`,
    description: DESCRIPTION,
    type: "WebPage",
    breadcrumb: [{ name: "Education", path: "/education/" }],
  });

  return (
    <div>
      <JsonLd data={graph} />

      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main role="main" style={{ paddingTop: "5rem" }}>
        <Suspense fallback={null}>
          <Educations data={educationsData} headingLevel="h1" />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer data={portfolioData} />
      </Suspense>
    </div>
  );
}
