import React from "react";
import styles from "./experience.module.css";
import ThreeDots from "../ThreeDots";

function Experience({ data }) {
  // Use server data for rendering
  const experiences = data?.data || [];

  // Helper to get total experience in years and months or decimal years
  const getTotalExperienceDisplay = () => {
    if (!experiences || experiences.length === 0) return null;
    
    // Find the earliest start and latest end (or today if any are present)
    let minStart = null;
    let maxEnd = null;
    
    experiences.forEach((exp) => {
      // Parse start
      let startRaw = exp.startDate || exp.time?.split("-")[0] || exp.time;
      let endRaw = exp.endDate || exp.time?.split("-")[1] || exp.time;
      
      // Helper to parse YYYY-MM or YYYY/MM or YYYY
      function parseDate(str) {
        if (!str) return null;
        str = str.trim();
        if (/present/i.test(str)) return new Date();
        
        // Try YYYY-MM or YYYY/MM
        let match = str.match(/^(\d{4})[-/](\d{1,2})$/);
        if (match) {
          // Month is 0-based in JS Date
          return new Date(Number(match[1]), Number(match[2]) - 1);
        }
        
        // Try YYYY
        match = str.match(/^(\d{4})$/);
        if (match) {
          return new Date(Number(match[1]), 0);
        }
        
        // Fallback to Date constructor
        let d = new Date(str);
        if (!isNaN(d)) return d;
        return null;
      }
      
      let start = parseDate(startRaw);
      let end = parseDate(endRaw);
      if (!end) end = new Date();

      // Only use valid dates
      if (
        start instanceof Date &&
        !isNaN(start) &&
        end instanceof Date &&
        !isNaN(end)
      ) {
        if (!minStart || start < minStart) minStart = start;
        if (!maxEnd || end > maxEnd) maxEnd = end;
      }
    });
    
    if (!minStart || !maxEnd) return null;
    
    let years = maxEnd.getFullYear() - minStart.getFullYear();
    let months = maxEnd.getMonth() - minStart.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    const decimalYears = (years + months / 12).toFixed(1);
    const fullText = `${years} year${years !== 1 ? "s" : ""} ${months} month${
      months !== 1 ? "s" : ""
    }`;
    
    return {
      decimal: `${decimalYears} year${decimalYears !== "1.0" ? "s" : ""}`,
      full: fullText,
    };
  };

  // Enhanced structured data for experience section
  const experienceStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://mahbub.dev#experience",
    name: "Mahbub Alam Work Experience",
    description: "Professional work experience in software development and technology",
    numberOfItems: experiences.length,
    itemListElement: experiences.map((experience, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "JobPosting",
        "@id": `https://mahbub.dev#job-${experience.id || index}`,
        title: experience.name,
        description: experience.how,
        datePosted: experience.startDate || experience.time?.split("-")[0] || experience.time,
        validThrough: experience.endDate || experience.time?.split("-")[1] || "Present",
        employmentType: "FULL_TIME",
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Dhaka",
            addressCountry: "Bangladesh",
          },
        },
        hiringOrganization: {
          "@type": "Organization",
          name: experience.company || "Technology Company",
          url: experience.companyUrl || "https://mahbub.dev",
        },
        applicantLocationRequirements: {
          "@type": "Country",
          name: "Bangladesh",
        },
        jobBenefits: [
          "Professional Development",
          "Technology Exposure",
          "Team Collaboration",
        ],
      },
    })),
  };

  return (
    <>
      {/* Structured Data for Experience */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(experienceStructuredData),
        }}
      />

      <section 
        id="experience" 
        className={styles.experienceSection}
        itemScope
        itemType="https://schema.org/ItemList"
        aria-labelledby="experience-heading"
      >
        <div className="container">
          <header className={`${styles.sectionHeader} ${styles.animateIn}`}>
            <h2 id="experience-heading">
              <span className={styles.sectionNumber} aria-label="Section 3">03.</span> 
              Where I've Worked
              <span className={styles.experienceCount} aria-label={`${experiences.length} experiences`}>
                ({experiences.length})
              </span>
            </h2>
            <div className={styles.headerLine} aria-hidden="true"></div>
            
            {/* Show total experience */}
            {experiences.length > 0 && getTotalExperienceDisplay() && (
              <div
                className={styles.totalExperience}
                style={{
                  color: "var(--heading_color)",
                  transition: "background 0.3s, color 0.3s",
                }}
              >
                <span className={styles.showOnMobile}>
                  <span className={styles.date}>
                    {getTotalExperienceDisplay()?.decimal}
                  </span>
                </span>
                <span className={styles.showOnDesktop}>
                  <span className={styles.date}>
                    Total Experience: {getTotalExperienceDisplay()?.full}
                  </span>
                </span>
              </div>
            )}
          </header>

          <div className={styles.timelineContainer}>
            <div className={styles.verticalLine} aria-hidden="true"></div>
            
            {experiences.length > 0 ? (
              experiences.map((experience, index) => (
                <div
                  key={experience.id || `experience-${index}`}
                  className={`${styles.timelineItem} ${
                    index % 2 === 0 ? styles.left : styles.right
                  } ${styles.animateInTimeline}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                  itemScope
                  itemType="https://schema.org/JobPosting"
                >
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineDot} aria-hidden="true"></div>
                    
                    {/* Experience Date */}
                    <time 
                      className={styles.date}
                      itemProp="datePosted"
                      dateTime={experience.startDate || experience.time?.split("-")[0] || experience.time}
                    >
                      {experience.time}
                    </time>
                    
                    {/* Job Title */}
                    <h3 
                      className={styles.title}
                      itemProp="title"
                      id={`experience-${experience.id || index}-title`}
                    >
                      {experience.name}
                    </h3>
                    
                    {/* Job Description */}
                    <p 
                      className={styles.description}
                      itemProp="description"
                    >
                      {experience.how}
                    </p>

                    {/* Company Information */}
                    {experience.company && (
                      <div className={styles.companyInfo}>
                        <span 
                          className={styles.companyName}
                          itemProp="hiringOrganization"
                        >
                          {experience.company}
                        </span>
                        {experience.companyUrl && (
                          <a 
                            href={experience.companyUrl}
                            className={styles.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Visit ${experience.company} website`}
                          >
                            Company Website
                          </a>
                        )}
                      </div>
                    )}

                    {/* Additional Metadata */}
                    <div className={styles.experienceMetadata} style={{ display: 'none' }}>
                      <meta itemProp="employmentType" content="FULL_TIME" />
                      <meta itemProp="jobLocation" content="Dhaka, Bangladesh" />
                      <meta itemProp="applicantLocationRequirements" content="Bangladesh" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noExperience}>
                <div className={styles.noExperienceIcon}>💼</div>
                <h3>Experience Coming Soon</h3>
                <p>I'm building my professional experience. Check back soon!</p>
                <div className={styles.placeholderExperience}>
                  <div className={styles.placeholderTimeline}>
                    <div className={styles.placeholderDot}></div>
                    <div className={styles.placeholderContent}>
                      <div className={styles.placeholderTitle}></div>
                      <div className={styles.placeholderDesc}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Experience Summary */}
          {experiences.length > 0 && (
            <footer className={styles.experienceFooter}>
              <div className={styles.experienceStats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{experiences.length}</span>
                  <span className={styles.statLabel}>Total Positions</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>
                    {experiences.filter(exp => exp.company).length}
                  </span>
                  <span className={styles.statLabel}>Companies</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>
                    {getTotalExperienceDisplay()?.decimal || "0 years"}
                  </span>
                  <span className={styles.statLabel}>Total Experience</span>
                </div>
              </div>
            </footer>
          )}
        </div>
      </section>
    </>
  );
}

export default Experience;
