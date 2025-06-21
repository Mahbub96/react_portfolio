"use client";
import { useEffect } from "react";

const VisitorCounter = () => {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Get visitor info
        const page = window.location.pathname;
        const userAgent = navigator.userAgent;

        // Basic IP detection (this is just for demo - in production you'd get this from server)
        const ip = "unknown"; // In real implementation, this would come from server-side

        // Track the visit
        await fetch("/api/visitors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ip,
            userAgent,
            page,
            country: "Unknown",
            city: "Unknown",
            region: "Unknown",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        });
      } catch (error) {
        console.error("Error tracking visit:", error);
      }
    };

    // Track visit when component mounts
    trackVisit();
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default VisitorCounter;
