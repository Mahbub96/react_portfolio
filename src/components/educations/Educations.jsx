import React from "react";
import styles from "./educations.module.css";
import ThreeDots from "../ThreeDots";

// Server-side Educations component for better SEO
function Educations({ data }) {
  // Use server data for rendering
  const education = Array.isArray(data?.data) ? [...data.data].reverse() : [];

  // Enhanced structured data for education section
  const educationStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://mahbub.dev#education",
    name: "Mahbub Alam Education",
    description: "Academic background and educational qualifications",
    numberOfItems: education.length,
    itemListElement: education.map((edu, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "EducationalOccupationalCredential",
        "@id": `https://mahbub.dev#education-${edu.id || index}`,
        name: edu.degName,
        description: edu.name,
        credentialCategory: "Degree",
        educationalLevel: "Bachelor's Degree",
        recognizedBy: {
          "@type": "CollegeOrUniversity",
          name: edu.name,
          url: "https://stamforduniversity.edu.bd",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Dhaka",
            addressCountry: "Bangladesh",
          },
        },
        dateIssued: edu.time,
        validIn: {
          "@type": "Country",
          name: "Bangladesh",
        },
        credentialCategory: "Degree",
        educationalLevel: "Bachelor's Degree",
        ...(edu.cgpa && {
          credentialCategory: "Academic Degree",
          educationalLevel: "Bachelor's Degree",
          additionalProperty: {
            "@type": "PropertyValue",
            name: "CGPA",
            value: edu.cgpa,
          },
        }),
        ...(edu.Department && {
          educationalProgramMode: "Full-time",
          educationalProgramType: "Bachelor's Program",
          educationalProgramName: edu.Department,
        }),
        ...(edu.Thesis && {
          educationalProgramMode: "Full-time",
          educationalProgramType: "Bachelor's Program",
          educationalProgramName: edu.Department,
          additionalProperty: {
            "@type": "PropertyValue",
            name: "Thesis",
            value: edu.Thesis,
          },
        }),
      },
    })),
  };

  return (
    <>
      {/* Structured Data for Education */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(educationStructuredData),
        }}
      />

      <section
        id="education"
        className={styles.educationSection}
        itemScope
        itemType="https://schema.org/ItemList"
        aria-labelledby="education-heading"
      >
        <div className="container">
          <header className={`${styles.sectionHeader} ${styles.animateIn}`}>
            <h2 id="education-heading">
              Education
              <span
                className={styles.educationCount}
                aria-label={`${education.length} degrees`}
              >
                ({education.length})
              </span>
            </h2>
            <div className={styles.headerLine} aria-hidden="true"></div>
          </header>

          <div className={styles.timelineContainer}>
            <div className={styles.verticalLine} aria-hidden="true"></div>

            {education.length > 0 ? (
              education.map((edu, index) => (
                <div
                  key={edu.id || `education-${index}`}
                  className={`${styles.timelineItem} ${
                    index % 2 === 0 ? styles.left : styles.right
                  } ${styles.animateInTimeline}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                  itemScope
                  itemType="https://schema.org/EducationalOccupationalCredential"
                >
                  <div className={styles.timelineContent}>
                    <div
                      className={styles.timelineDot}
                      aria-hidden="true"
                    ></div>

                    {/* Education Date */}
                    <time
                      className={styles.date}
                      itemProp="dateIssued"
                      dateTime={edu.time}
                    >
                      {edu.time}
                    </time>

                    {/* Institution Name */}
                    <h3
                      className={styles.title}
                      itemProp="recognizedBy"
                      id={`education-${edu.id || index}-title`}
                    >
                      {edu.name}
                    </h3>

                    {/* Degree Name */}
                    <p className={styles.degree} itemProp="name">
                      {edu.degName}
                    </p>

                    {/* Department */}
                    {edu.Department && (
                      <p
                        className={styles.department}
                        itemProp="educationalProgramName"
                      >
                        {edu.Department}
                      </p>
                    )}

                    {/* CGPA */}
                    {edu.cgpa && (
                      <p className={styles.cgpa}>
                        <span className={styles.cgpaLabel}>CGPA:</span>
                        <span
                          className={styles.cgpaValue}
                          itemProp="additionalProperty"
                        >
                          {edu.cgpa}
                        </span>
                      </p>
                    )}

                    {/* Thesis */}
                    {edu.Thesis && (
                      <p className={styles.thesis}>
                        <span className={styles.thesisLabel}>Thesis:</span>
                        <span
                          className={styles.thesisValue}
                          itemProp="additionalProperty"
                        >
                          {edu.Thesis}
                        </span>
                      </p>
                    )}

                    {/* Institution Details */}
                    <div className={styles.institutionDetails}>
                      <a
                        href={edu.url}
                        className={styles.institutionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Visit Stamford University Bangladesh website"
                      >
                        {edu.url}
                      </a>
                    </div>

                    {/* Additional Metadata */}
                    <div
                      className={styles.educationMetadata}
                      style={{ display: "none" }}
                    >
                      <meta itemProp="credentialCategory" content="Degree" />
                      <meta
                        itemProp="educationalLevel"
                        content="Bachelor's Degree"
                      />
                      <meta itemProp="validIn" content="Bangladesh" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noEducation}>
                <div className={styles.noEducationIcon}>🎓</div>
                <h3>Education Details Coming Soon</h3>
                <p>I'm updating my educational background. Check back soon!</p>
                <div className={styles.placeholderEducation}>
                  <div className={styles.placeholderTimeline}>
                    <div className={styles.placeholderDot}></div>
                    <div className={styles.placeholderContent}>
                      <div className={styles.placeholderTitle}></div>
                      <div className={styles.placeholderDegree}></div>
                      <div className={styles.placeholderDepartment}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Educations;
