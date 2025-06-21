"use client";
import React from "react";
import DataContextProvider from "../contexts/useAllContext";
import "./../App.css";
import Home from "./Home";
import useVisitorTracker from "../hooks/useVisitorTracker";
import VisitorCounter from "./VisitorCounter";
import VisitorAnalytics from "./VisitorAnalytics";
import SEOMetaTags from "./SEOMetaTags";
import { useEffect } from "react";
import { setupAdminCredentials } from "./utils/setupAdmin";
import ConfigButton from "./config/ConfigButton";

function App() {
  useVisitorTracker();

  useEffect(() => {
    // Set up admin credentials when app initializes
    setupAdminCredentials();
  }, []);

  // Since we're using a single page for now, we'll use static SEO data
  const seoData = {
    title: "Mahbub Alam | Full Stack Developer Portfolio",
    description:
      "Portfolio of Mahbub Alam - Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh.",
  };

  return (
    <div className="App">
      <SEOMetaTags title={seoData.title} description={seoData.description} />
      <DataContextProvider>
        <Home />
        <VisitorCounter />
        <VisitorAnalytics />
        <ConfigButton />
      </DataContextProvider>
    </div>
  );
}

export default App;
