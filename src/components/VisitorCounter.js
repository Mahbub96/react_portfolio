import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../DB/DB_init";

const VisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  // get the auth from the local storage
  const auth = localStorage.getItem("auth");
  console.log(auth);

  useEffect(() => {
    const visitorRef = doc(db, "analytics", "visitors");

    const unsubscribe = onSnapshot(visitorRef, (doc) => {
      if (doc.exists()) {
        setVisitorCount(doc.data().count);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!auth) return null;

  return (
    <div className="visitor-counter">
      <p>Total Visitors: {visitorCount}</p>
    </div>
  );
};

export default VisitorCounter;
