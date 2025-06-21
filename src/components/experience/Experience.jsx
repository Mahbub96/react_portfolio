"use client";
import React, { useEffect, useState } from "react";

const Experience = () => {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    // Fetch experiences from API
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await fetch("/api/experiences");
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error("Error fetching experiences:", error);
    }
  };

  return (
    <section>
      {experiences.map((experience, index) => (
        <div
          key={experience.id || `experience-${index}`}
          className="animate-in"
        >
          {/* experience content */}
        </div>
      ))}
    </section>
  );
};

export default Experience;
