import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../DB/DB_init";
import { FaEye } from "react-icons/fa";

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        const visitorRef = doc(db, "analytics", "visitors");
        const visitorDoc = await getDoc(visitorRef);
        if (visitorDoc.exists()) {
          setVisitorCount(visitorDoc.data().count);
        }
      } catch (error) {
        console.error("Error fetching visitor count:", error);
      }
    };

    fetchVisitorCount();
    // Set up real-time updates if needed
    const interval = setInterval(fetchVisitorCount, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="visitor-counter-float">
      <FaEye size={20} />
      <span>{visitorCount} visitors</span>
    </div>
  );
};

export default VisitorCounter;
