import React, { memo, useMemo } from "react";
import dynamic from "next/dynamic";
import styles from "./about.module.css";

// Client-side only components with proper loading fallback
const AboutClient = dynamic(() => import("./AboutClient"), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingFallback}>
      <div className={styles.loadingSpinner} aria-hidden="true"></div>
      <span className={styles.loadingText}>Loading skills...</span>
    </div>
  ),
});

// Memoized default skills data to prevent unnecessary re-renders
const DEFAULT_TECHNICAL_SKILLS = {
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
  "Database & Cloud": ["MySQL", "MongoDB", "PostgreSQL", "AWS", "Docker"],
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

// Memoized About component for performance optimization
const About = memo(function About({ data }) {
  // Memoized data extraction to prevent unnecessary recalculations
  const {
    profile,
    aboutData,
    name,
    title,
    technicalSkills,
    location,
    company,
    companyUrl,
    description,
    achievements,
    approach,
  } = useMemo(() => {
    const profileData = data?.data || {};
    const aboutDataFromProps = data?.About?.data || {};

    return {
      profile: profileData,
      aboutData: aboutDataFromProps,
      name: profileData.name || aboutDataFromProps.name || "Mahbub Alam",
      title: profileData.title || "Full Stack Developer",
      technicalSkills:
        aboutDataFromProps.technicalSkills || DEFAULT_TECHNICAL_SKILLS,
      location: aboutDataFromProps.location || "Dhaka, Bangladesh",
      company: aboutDataFromProps.company || "Brotecs Technologies Ltd",
      companyUrl: aboutDataFromProps.companyUrl || "https://brotecs.com",
      description:
        aboutDataFromProps.description ||
        "I'm a Software Engineer at Brotecs Technologies Ltd, where I specialize in developing scalable web applications and enterprise-level VoIP solutions. With a strong foundation in both frontend and backend development, I focus on creating efficient, maintainable, and high-performance software solutions.",
      achievements:
        aboutDataFromProps.achievements ||
        "In my current role, I've successfully implemented microservices architecture for VoIP systems, improving scalability and reducing deployment time by 40%. I've also led the development of RESTful APIs that handle 100K+ daily requests, and contributed to reducing system downtime by 60% through implementing robust error handling and monitoring solutions.",
      approach:
        aboutDataFromProps.approach ||
        "My approach to software development emphasizes clean code principles, test-driven development, and continuous integration practices. I'm particularly passionate about system architecture, performance optimization, and implementing DevSecOps best practices.",
    };
  }, [data]);

  // Memoized description processing
  const processedDescription = useMemo(() => {
    const cleanDescription = description
      .replace(company, "")
      .replace(companyUrl, "")
      .trim();

    return { cleanDescription, company };
  }, [description, company, companyUrl]);

  return (
    <section
      id="about"
      className={styles.aboutSection}
      aria-labelledby="about-heading"
      role="region"
    >
      <div className="container">
        {/* Section Header */}
        <header className={`${styles.sectionHeader} ${styles.animateIn}`}>
          <h2 id="about-heading" className={styles.sectionTitle}>
            <span className={styles.sectionNumber} aria-label="Section 1">
              01.
            </span>
            <span className={styles.sectionText}>About Me</span>
          </h2>
          <div className={styles.headerLine} aria-hidden="true"></div>
        </header>

        {/* Main Content - Single Column Layout */}
        <div className={styles.aboutContent}>
          {/* About Text Content */}
          <article className={`${styles.aboutText} ${styles.animateInLeft}`}>
            {/* Location Badge */}
            <div
              className={styles.location}
              role="text"
              aria-label={`Location: ${location}`}
            >
              <span
                role="img"
                aria-label="location pin"
                className={styles.locationIcon}
              >
                📍
              </span>
              <span className={styles.locationText}>{location}</span>
            </div>

            {/* Main Description */}
            <div className={styles.descriptionSection}>
              <p
                className={styles.mainDescription}
                itemProp="description"
                aria-label="Professional description"
              >
                {processedDescription.cleanDescription}{" "}
                <a
                  href={companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  itemProp="worksFor"
                  className={styles.companyLink}
                  aria-label={`Visit ${company} website`}
                >
                  {processedDescription.company}
                </a>
                , where I specialize in developing scalable web applications and
                enterprise-level VoIP solutions. With a strong foundation in
                both frontend and backend development, I focus on creating
                efficient, maintainable, and high-performance software
                solutions.
              </p>

              {/* Achievements */}
              <p
                className={styles.achievements}
                aria-label="Professional achievements"
              >
                {achievements}
              </p>

              {/* Approach */}
              <p className={styles.approach} aria-label="Development approach">
                {approach}
              </p>
            </div>
          </article>
        </div>
      </div>

      {/* Client-side interactive features */}
      <AboutClient profile={profile} technicalSkills={technicalSkills} />
    </section>
  );
});

// Add display name for debugging
About.displayName = "About";

export default About;
