import React from "react";
import styles from "./about.module.css";

// Client-side only components
import dynamic from "next/dynamic";
const AboutClient = dynamic(() => import("./AboutClient"), {
  ssr: false,
});

function About({ data }) {
  const profile = data?.data || {};
  const aboutData = data?.About?.data || {};

  // Default values if no data from database
  const name = profile.name || aboutData.name || "Mahbub Alam";
  const title = profile.title || "Full Stack Developer";
  const technicalSkills = aboutData.technicalSkills || {
    "Languages & Frameworks": [
      "JavaScript (ES6+)",
      "TypeScript",
      "PHP",
      "Python",
      "React.js",
      "Node.js",
      "Laravel",
      "CodeIgniter",
    ],
    "Database & Cloud": [
      "MySQL",
      "MongoDB",
      "PostgreSQL",
      "AWS",
      "Docker",
      "MongoDB",
    ],
    "Development Tools": [
      "Git",
      "VS Code",
      "Jira",
      "Postman",
      "Linux/Unix",
      "CI/CD",
    ],
    "Specialized Skills": [
      "RESTful APIs",
      "VoIP Solutions",
      "System Architecture",
      "Deep Learning",
      "Agile/Scrum",
      "TDD",
    ],
  };

  const location = aboutData.location || "Dhaka, Bangladesh";
  const company = aboutData.company || "Brotecs Technologies Ltd";
  const companyUrl = aboutData.companyUrl || "https://brotecs.com";
  const description =
    aboutData.description ||
    "I'm a Software Engineer at Brotecs Technologies Ltd, where I specialize in developing scalable web applications and enterprise-level VoIP solutions. With a strong foundation in both frontend and backend development, I focus on creating efficient, maintainable, and high-performance software solutions.";
  const achievements =
    aboutData.achievements ||
    "In my current role, I've successfully implemented microservices architecture for VoIP systems, improving scalability and reducing deployment time by 40%. I've also led the development of RESTful APIs that handle 100K+ daily requests, and contributed to reducing system downtime by 60% through implementing robust error handling and monitoring solutions.";
  const approach =
    aboutData.approach ||
    "My approach to software development emphasizes clean code principles, test-driven development, and continuous integration practices. I'm particularly passionate about system architecture, performance optimization, and implementing DevSecOps best practices.";

  return (
    <section
      id="about"
      className={styles.aboutSection}
      itemScope
      itemType="http://schema.org/Person"
    >
      <div className="container">
        <div className={`${styles.sectionHeader} ${styles.animateIn}`}>
          <h2>
            <span className={styles.sectionNumber}>01.</span>
            About Me
          </h2>
          <div className={styles.headerLine}></div>
        </div>

        <div className={styles.aboutContent}>
          <div className={`${styles.aboutText} ${styles.animateInLeft}`}>
            <div className={styles.location}>
              <span role="img" aria-label="location">
                📍
              </span>{" "}
              {location}
            </div>

            <p itemProp="description">
              {description.replace(company, "").replace(companyUrl, "").trim()}{" "}
              <a
                href={companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                itemProp="worksFor"
              >
                {company}
              </a>
              , where I specialize in developing scalable web applications and
              enterprise-level VoIP solutions. With a strong foundation in both
              frontend and backend development, I focus on creating efficient,
              maintainable, and high-performance software solutions.
            </p>

            <p>{achievements}</p>

            <p>{approach}</p>
          </div>

          <div
            className={`${styles.profileImageContainer} ${styles.animateInRight}`}
          >
            <div className={styles.profileImage}>
              <img
                src={profile.image || "/assets/img/profile.png"}
                alt={`${name} - ${title}`}
                loading="lazy"
                itemProp="image"
                width="300"
                height="300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Client-side interactive features */}
      <AboutClient profile={profile} technicalSkills={technicalSkills} />
    </section>
  );
}

export default About;
