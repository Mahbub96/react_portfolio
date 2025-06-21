"use client";
import { useEffect } from "react";

const useVisitorTracker = () => {
  const getVisitorInfo = () => {
    return {
      userAgent: window.navigator.userAgent,
      language: window.navigator.language,
      platform: navigator.userAgentData?.platform || "Unknown",
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || "direct",
      pathname: window.location.pathname,
      timestamp: new Date().toISOString(),
    };
  };

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Get visitor's IP address
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const { ip } = await ipResponse.json();

        const visitorInfo = getVisitorInfo();

        // Track visitor using MongoDB API
        await fetch("/api/visitors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...visitorInfo,
            ip: ip,
          }),
        });
      } catch (error) {
        console.error("Error tracking visitor:", error);
      }
    };

    trackVisitor();
  }, []); // Run once when component mounts
};

export default useVisitorTracker;
