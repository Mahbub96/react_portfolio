import { useEffect } from "react";
import { doc, getDoc, setDoc, increment } from "firebase/firestore";
import { db } from "../DB/DB_init";

const useVisitorTracker = () => {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const visitorRef = doc(db, "analytics", "visitors");
        const visitorDoc = await getDoc(visitorRef);

        if (visitorDoc.exists()) {
          // Increment visitor count
          await setDoc(
            visitorRef,
            {
              count: increment(1),
              lastVisit: new Date().toISOString(),
            },
            { merge: true }
          );
        } else {
          // Create initial visitor document
          await setDoc(visitorRef, {
            count: 1,
            lastVisit: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error tracking visitor:", error);
      }
    };

    trackVisitor();
  }, []); // Run once when component mounts
};

export default useVisitorTracker;
