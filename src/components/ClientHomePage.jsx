"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const LoadingScreen = dynamic(() => import("./LoadingScreen"), {
  ssr: false, // Client-side only for loading
});

const ClientHomePage = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Show loading screen for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return <>{children}</>;
};

export default ClientHomePage;
