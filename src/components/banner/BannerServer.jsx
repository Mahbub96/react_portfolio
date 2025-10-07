import React from "react";
import styles from "./banner.module.css";
import {
  FaMapMarkerAlt,
  FaCode,
  FaEnvelope,
  FaGithub,
  FaFacebook,
  FaLinkedin,
  FaBuilding,
  FaBriefcase,
  FaStar,
} from "react-icons/fa";
import BannerAnimation from "./BannerAnimation";

// Server-side Banner + About merged component for better SEO
const BannerServer = ({
  data,
  profileImage,
  profile,
  experiences,
  projects,
}) => {
  const bannerData = data?.data || {};
  const profileData = profile || {};

  // Calculate real experience years from experiences data
  const calculateExperience = () => {
    if (!experiences || !Array.isArray(experiences))
      return { years: 0, months: 0 };

    const now = new Date();
    let totalMonths = 0;

    // Find earliest start date from all experiences
    let earliestStartDate = now;
    experiences.forEach((exp) => {
      if (exp.time) {
        const startYear = exp.time.split(" - ")[0];
        if (startYear) {
          const startDate = new Date(startYear);
          if (!isNaN(startDate.getTime())) {
            if (startDate < earliestStartDate) {
              earliestStartDate = startDate;
            }
          }
        }
      }
    });

    // Calculate months from earliest job to now
    totalMonths =
      (now.getFullYear() - earliestStartDate.getFullYear()) * 12 +
      (now.getMonth() - earliestStartDate.getMonth());

    return {
      years: (totalMonths / 12).toFixed(1),
    };
  };

  // Calculate real project count from projects data
  const calculateProjectCount = () => {
    if (!projects || !Array.isArray(projects)) return 0;
    return projects.length;
  };

  // Get real calculated values
  const experience = calculateExperience();
  const projectCount = calculateProjectCount();

  // Default values if no data from database
  const roles = bannerData.roles || [
    "Full Stack Developer",
    1500,
    "Mobile App Developer",
    1500,
    "ML Engineer",
    1500,
    "Data Scientist",
    1500,
    "DevSecOps Engineer",
    1500,
  ];

  const name = bannerData.name || profileData.name || "Mahbub Alam";
  const jobTitle =
    bannerData.jobTitle || profileData.title || "Full Stack Developer";
  const location =
    bannerData.location || profileData.location || "Dhaka, Bangladesh";
  const company = profileData.company || "Brotecs Technologies Ltd";
  const companyUrl = profileData.companyUrl || "https://brotecs.com";
  const bio =
    bannerData.bio ||
    profileData.description ||
    "I'm a Software Engineer specializing in scalable web applications and enterprise-level VoIP solutions. With expertise in both frontend and backend development, I focus on creating efficient, maintainable, and high-performance software solutions.";

  const socialLinks = bannerData.socialLinks || {
    email: "support@mahbub.dev",
    github: "https://github.com/mahbub96",
    facebook: "https://fb.me/MahbubCSE96",
    linkedin: "https://www.linkedin.com/in/md-mahbub-alam-6b751821b",
  };

  // Enhanced structured data for merged banner + about section
  const mergedStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://mahbub.dev#banner-about",
    name: name,
    jobTitle: jobTitle,
    description: bio,
    image: profileImage || "https://mahbub.dev/assets/img/profile.png",
    url: "https://mahbub.dev",
    email: socialLinks.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: location,
      addressCountry: "Bangladesh",
      addressRegion: "Dhaka",
    },
    sameAs: [socialLinks.github, socialLinks.linkedin, socialLinks.facebook],
    worksFor: {
      "@type": "Organization",
      name: company,
      url: companyUrl,
      description:
        "Technology company specializing in VoIP solutions and software development",
    },
    knowsAbout: [
      "Full Stack Development",
      "React.js",
      "Node.js",
      "PHP",
      "Laravel",
      "CodeIgniter",
      "MongoDB",
      "MySQL",
      "Cloud Computing",
      "VoIP Solutions",
      "System Architecture",
      "DevSecOps",
      "Docker",
      "AWS",
    ],
  };

  return (
    <>
      {/* Structured Data for merged Banner + About */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(mergedStructuredData),
        }}
      />

      <section className={styles.bannerSection} id="about">
        {/* Animated background */}
        <div className={styles.techBackground}></div>

        <div className={styles.bannerContainer}>
          {/* Section Header */}
          <div className={styles.sectionHeader}>
            <h2 id="about-heading">About Me</h2>
            <div className={styles.headerLine} aria-hidden="true"></div>
          </div>

          {/* Profile Section */}
          <div className={styles.profileSection}>
            <div className={styles.profileImageContainer}>
              <div
                className={styles.profileImage}
                style={{
                  backgroundImage: `url('${
                    profileImage || "/assets/img/profile.png"
                  }')`,
                }}
                aria-label={`Profile photo of ${name}`}
              />
              <div className={styles.profileGlow}></div>
            </div>

            <div className={styles.profileInfo}>
              <h1 className={styles.name}>
                {name}
                <span className={styles.cursor}>_</span>
              </h1>
              <p className={styles.jobTitle}>{jobTitle}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.contentSection}>
            {/* Typing Animation */}
            <div className={styles.animationContainer}>
              <BannerAnimation roles={roles} />
            </div>

            {/* Location */}
            <div className={styles.locationContainer}>
              <FaMapMarkerAlt className={styles.locationIcon} />
              <span>{location}</span>
            </div>

            {/* Bio */}
            <p className={styles.bioText}>{bio}</p>

            {/* Company Info */}
            <div className={styles.companySection}>
              <FaBuilding className={styles.companyIcon} />
              <span className={styles.companyLabel}>Currently at </span>
              <a
                href={companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.companyLink}
              >
                {company}
              </a>
            </div>

            {/* Stats */}
            <div className={styles.statsSection}>
              {[
                {
                  icon: FaBriefcase,
                  number: `${experience.years}+`,
                  label: "Years Experience",
                },
                {
                  icon: FaCode,
                  number: `${projectCount}+`,
                  label: "Projects Completed",
                },
                { icon: FaStar, number: "100%", label: "Client Satisfaction" },
              ].map((stat, index) => (
                <div key={index} className={styles.statItem}>
                  <stat.icon className={styles.statIcon} />
                  <div className={styles.statNumber}>{stat.number}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button className={styles.ctaButton}>
              <FaCode />
              <span>Get in Touch</span>
            </button>
          </div>

          {/* Social Links */}
          <div className={styles.socialLinks}>
            {[
              {
                icon: FaEnvelope,
                href: `mailto:${socialLinks.email}`,
                label: "Email",
              },
              { icon: FaGithub, href: socialLinks.github, label: "GitHub" },
              {
                icon: FaFacebook,
                href: socialLinks.facebook,
                label: "Facebook",
              },
              {
                icon: FaLinkedin,
                href: socialLinks.linkedin,
                label: "LinkedIn",
              },
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                title={social.label}
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BannerServer;
