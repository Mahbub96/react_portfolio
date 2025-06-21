import React from "react";
import styles from "./about.module.css";

// Client-side only components
import dynamic from "next/dynamic";
const AboutClient = dynamic(() => import("./AboutClient"), {
  ssr: false,
});

function About({ data }) {
  const profile = data?.data || {};

  const technicalSkills = {
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
      "Firebase",
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
              Dhaka, Bangladesh
            </div>

            <p itemProp="description">
              I'm a Software Engineer at{" "}
              <a
                href="https://brotecs.com"
                target="_blank"
                rel="noopener noreferrer"
                itemProp="worksFor"
              >
                Brotecs Technologies Ltd
              </a>
              , where I specialize in developing scalable web applications and
              enterprise-level VoIP solutions. With a strong foundation in both
              frontend and backend development, I focus on creating efficient,
              maintainable, and high-performance software solutions.
            </p>

            <p>
              In my current role, I've successfully implemented microservices
              architecture for VoIP systems, improving scalability and reducing
              deployment time by 40%. I've also led the development of RESTful
              APIs that handle 100K+ daily requests, and contributed to reducing
              system downtime by 60% through implementing robust error handling
              and monitoring solutions.
            </p>

            <p>
              My approach to software development emphasizes clean code
              principles, test-driven development, and continuous integration
              practices. I'm particularly passionate about system architecture,
              performance optimization, and implementing DevSecOps best
              practices.
            </p>
          </div>

          <div
            className={`${styles.profileImageContainer} ${styles.animateInRight}`}
          >
            <div className={styles.profileImage}>
              <img
                src={profile.image || "/assets/img/profile.png"}
                alt="Mahbub Alam - Full Stack Developer"
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
      <AboutClient profile={profile} />
    </section>
  );
}

export default About;
