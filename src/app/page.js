import React from "react";
import { getPortfolioData } from "@/lib/getPortfolioData";
import LoadingScreen from "@/components/LoadingScreen";

import Navbar from "@/components/navbar/Navbar";
import BannerServer from "@/components/banner/BannerServer";
import SkillsServer from "@/components/skills/SkillsServer";
import Experience from "@/components/experiences/Experience";
import Educations from "@/components/educations/Educations";
import ProjectsServer from "@/components/projects/ProjectsServer";
import Contact from "@/components/contact/Contact";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";

import VisitorAnalytics from "@/components/VisitorAnalytics";
import VisitorCounter from "@/components/VisitorCounter";

import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { buildPageGraph } from "@/lib/seo/structuredData.mjs";
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
} from "@/lib/seo/siteConfig.mjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const HOME_TITLE = `${SITE_AUTHOR.name} — ${SITE_AUTHOR.jobTitle} (${SITE_AUTHOR.tagline})`;

export const metadata = pageMetadata({
  path: "/",
  title: HOME_TITLE,
  absoluteTitle: true,
  description: SITE_DESCRIPTION,
  ogType: "profile",
});

export default async function HomePage() {
  try {
    const portfolioData = await getPortfolioData();
    const profile = portfolioData.profile?.data || {};

    const graph = buildPageGraph({
      path: "/",
      name: HOME_TITLE,
      description: SITE_DESCRIPTION,
      type: "ProfilePage",
    });

    return (
      <>
        {/* Skip to content link for accessibility */}
        <a href="#about" className="skip-link">
          Skip to main content
        </a>

        <JsonLd data={graph} />

        <Navbar />

        <main className="home" role="main">
          <BannerServer
            data={portfolioData.Banner}
            profileImage={profile.image}
            profile={profile}
            experiences={portfolioData.Experiences?.data}
            projects={portfolioData.Projects?.data}
          />

          <ProjectsServer data={portfolioData.Projects} />

          <SkillsServer data={portfolioData.Skills} />

          <Experience data={portfolioData.Experiences} />

          <Educations data={portfolioData.Educations} />

          <Contact />

          <Footer data={portfolioData} />
        </main>

        {/* Client-side only components */}
        <VisitorAnalytics />
        <VisitorCounter />
      </>
    );
  } catch (error) {
    console.log("Error rendering home page:", error);
    return <LoadingScreen />;
  }
}
