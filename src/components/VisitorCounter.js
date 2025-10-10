"use client";
import { useEffect } from "react";

const VisitorCounter = () => {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Check if we're in browser environment
        if (typeof window === "undefined" || typeof navigator === "undefined") {
          return;
        }

        // Get visitor info
        const page = window.location.pathname;
        const userAgent = navigator.userAgent;
        const language = navigator.language || navigator.userLanguage;
        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        const referrer = document.referrer || "direct";

        // Basic IP detection (this is just for demo - in production you'd get this from server)
        // Fetch IP address from a public API (client-side)
        let ip = "unknown";
        try {
          const res = await fetch("https://api.ipify.org?format=json");
          if (res.ok) {
            const data = await res.json();
            ip = data.ip || "unknown";
          }
        } catch (e) {
          // Ignore errors, keep ip as "unknown"
        }

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
            referrer,
            screenResolution,
            language,
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
