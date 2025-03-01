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
      platform: window.navigator.platform,
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
        // Update total visitor count
        const visitorCountRef = doc(db, "analytics", "visitors");
        const visitorDoc = await getDoc(visitorCountRef);

        if (visitorDoc.exists()) {
          await setDoc(
            visitorCountRef,
            {
              count: increment(1),
              lastVisit: new Date().toISOString(),
            },
            { merge: true }
          );
        } else {
          await setDoc(visitorCountRef, {
            count: 1,
            lastVisit: new Date().toISOString(),
          });
        }

        // Store detailed visitor information
        const visitorInfo = getVisitorInfo();
        const visitsCollection = collection(
          db,
          "analytics",
          "visitors",
          "details"
        );
        await addDoc(visitsCollection, visitorInfo);
      } catch (error) {
        console.error("Error tracking visitor:", error);
      }
    };

    trackVisitor();
  }, []); // Run once when component mounts
};

export default useVisitorTracker;
