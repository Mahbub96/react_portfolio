import React from "react";
import { getPortfolioData } from "@/lib/getPortfolioData";
import LoadingScreen from "@/components/LoadingScreen";

import Navbar from "@/components/navbar/Navbar";
import HomeHero from "@/components/home/HomeHero";
import HomePrinciples from "@/components/home/HomePrinciples";
import HomeWork from "@/components/home/HomeWork";
import HomeCareer from "@/components/home/HomeCareer";
import HomeStack from "@/components/home/HomeStack";
import HomeEducationContact from "@/components/home/HomeEducationContact";
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
    const listOf = (key) =>
      Array.isArray(portfolioData[key]?.data) ? portfolioData[key].data : [];
    const experiences = listOf("Experiences");
    const educations = listOf("Educations");

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
          <HomeHero experiences={experiences} educations={educations} />
          <HomePrinciples />
          <HomeWork projects={listOf("Projects")} />
          <HomeCareer experiences={experiences} />
          <HomeStack skills={listOf("Skills")} />
          <HomeEducationContact educations={educations} />
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
