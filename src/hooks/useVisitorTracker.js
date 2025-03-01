import { useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
  increment,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "../DB/DB_init";

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

        // Check if this IP has visited today
        const today = new Date().toISOString().split("T")[0];
        const visitorRef = doc(db, "analytics", "visitors");
        const uniqueVisitorRef = doc(
          db,
          "analytics",
          "unique_visitors",
          "daily",
          today
        );

        // Get the unique visitor document for today
        const uniqueVisitorDoc = await getDoc(uniqueVisitorRef);
        const visitorInfo = getVisitorInfo();

        if (
          !uniqueVisitorDoc.exists() ||
          !uniqueVisitorDoc.data().ips?.includes(ip)
        ) {
          // New unique visitor for today
          await setDoc(
            uniqueVisitorRef,
            {
              ips: uniqueVisitorDoc.exists()
                ? [...uniqueVisitorDoc.data().ips, ip]
                : [ip],
              count: increment(1),
            },
            { merge: true }
          );

          // Increment total visitor count
          await setDoc(
            visitorRef,
            {
              count: increment(1),
              lastVisit: new Date().toISOString(),
            },
            { merge: true }
          );
        }

        // Always store visit details
        const visitsCollection = collection(
          db,
          "analytics",
          "visitors",
          "details"
        );
        await addDoc(visitsCollection, {
          ...visitorInfo,
          ip: ip, // Store IP for analytics
          isUnique:
            !uniqueVisitorDoc.exists() ||
            !uniqueVisitorDoc.data().ips?.includes(ip),
        });
      } catch (error) {
        console.error("Error tracking visitor:", error);
      }
    };

    trackVisitor();
  }, []); // Run once when component mounts
};

export default useVisitorTracker;
