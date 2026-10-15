import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import { getPortfolioData } from "@/lib/getPortfolioData";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { buildPageGraph, PERSON_ID } from "@/lib/seo/structuredData.mjs";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import {
  ABOUT_TITLE,
  ABOUT_DESCRIPTION,
} from "@/lib/seo/aboutProfile.mjs";

export const dynamic = "force-dynamic";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), {
  ssr: true,
});

const BannerServer = NextDynamic(
  () => import("@/components/banner/BannerServer"),
  {
    ssr: true,
  }
);

const Footer = NextDynamic(() => import("@/components/Footer"), {
  ssr: true,
});

const PATH = "/about/";

export const metadata = pageMetadata({
  path: PATH,
  title: `${ABOUT_TITLE} — ${SITE_AUTHOR.jobTitle}`,
  absoluteTitle: true,
  description: ABOUT_DESCRIPTION,
});

export default async function AboutPage() {
  const portfolioData = await getPortfolioData();
  const profile = portfolioData?.profile?.data || {};

  const graph = buildPageGraph({
    path: PATH,
    name: `${ABOUT_TITLE} — ${SITE_AUTHOR.name}`,
    description: ABOUT_DESCRIPTION,
    type: "AboutPage",
    breadcrumb: [{ name: "About", path: PATH }],
    mainEntity: { "@id": PERSON_ID },
  });

  return (
    <div>
      <JsonLd data={graph} />

      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main role="main" style={{ paddingTop: "5rem" }}>
        <Suspense fallback={null}>
          <BannerServer
            data={portfolioData.Banner}
            profileImage={profile.image}
            profile={profile}
            experiences={portfolioData.Experiences?.data}
            projects={portfolioData.Projects?.data}
          />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer data={portfolioData} />
      </Suspense>
    </div>
  );
}
