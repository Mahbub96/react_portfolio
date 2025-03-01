import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
        <motion.div
          key={experience.id || `experience-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* experience content */}
        </motion.div>
      ))}
    </section>
  );
};

export default Experience;
