import React from "react";
import Image from "next/image";
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
import DownloadResumeButton from "./DownloadResumeButton";
import { getResumeConfig } from "@/lib/resumeConfig";

// Server-side Banner + About merged component for better SEO
const BannerServer = ({
  data,
  profileImage,
  profile,
  experiences,
  projects,
}) => {
  const bannerData = data?.data || {};
  const profileData = profile?.data || profile || {};

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
  const { mode: resumeMode } = getResumeConfig();
  const premiumCapabilities = [
    "Backend APIs",
    "Full-stack products",
    "Cloud deployment",
    "Applied AI systems",
  ];

  const name = bannerData.name || profileData.name || "Mahbub Alam";
  const jobTitle =
    bannerData.jobTitle ||
    profileData.title ||
    "Software Engineer | Full-Stack, Backend & Applied AI";
  const location =
    bannerData.location || profileData.location || "Dhaka, Bangladesh";
  const company = profileData.company || "Brotecs Technologies Ltd";
  const companyUrl = profileData.companyUrl || "https://brotecs.com";
  const bio =
    bannerData.bio ||
    profileData.description ||
    "Software Engineer building full-stack, backend, cloud-enabled, and applied AI solutions across enterprise, healthcare, education, and automation-focused systems.";
  const heroPromise =
    bannerData.headline ||
    "I build maintainable web applications, backend APIs, and practical AI-enabled systems for real business workflows.";
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
      "Next.js",
      "Python",
      "FastAPI",
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
      "Google Cloud Platform",
      "Oracle Cloud",
      "Applied AI",
      "Machine Learning",
      "Computer Vision",
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

      <section
        className={styles.bannerSection}
        id="about"
        aria-labelledby="hero-heading"
      >
        {/* Animated background */}
        <div className={styles.techBackground}></div>

        <div className={styles.bannerContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>
              <p className={styles.heroEyebrow}>
                Software Engineering | Backend Systems | Applied AI
              </p>

              <h1 id="hero-heading" className={styles.name}>
                {name}
              </h1>

              <p className={styles.jobTitle}>{jobTitle}</p>

              <p className={styles.heroIntro}>{heroPromise}</p>

              <div className={styles.capabilityPills} aria-label="Core capabilities">
                {premiumCapabilities.map((capability) => (
                  <span key={capability}>{capability}</span>
                ))}
              </div>

              <div
                className={styles.heroHighlights}
                aria-label="Key career highlights"
              >
                <div className={styles.highlightItem}>
                  <FaMapMarkerAlt
                    className={styles.highlightIcon}
                    aria-hidden="true"
                  />
                  <span>{location}</span>
                </div>
                <div className={styles.highlightItem}>
                  <FaBuilding
                    className={styles.highlightIcon}
                    aria-hidden="true"
                  />
                  <a
                    href={companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {company}
                  </a>
                </div>
                <div className={styles.highlightItem}>
                  <FaStar className={styles.highlightIcon} aria-hidden="true" />
                  <span>{experience.years}+ years engineering</span>
                </div>
              </div>

              <div className={styles.heroActions}>
                <DownloadResumeButton
                  resumeMode={resumeMode}
                  fileName={`${name.replace(/[^a-zA-Z0-9_-]/g, "_")}_Resume.pdf`}
                />
                <a className={styles.secondaryCta} href="#projects">
                  View Projects
                </a>
              </div>
            </div>

            <aside
              className={styles.profileCard}
              aria-label={`${name} portfolio snapshot`}
            >
              <div className={styles.profileImageContainer}>
                <Image
                  className={styles.profileImage}
                  src={profileImage || "/assets/img/profile.png"}
                  alt={`${name} - ${jobTitle}`}
                  width={220}
                  height={220}
                  priority
                />
                <div className={styles.profileGlow} aria-hidden="true"></div>
              </div>

              <div className={styles.profileIdentity}>
                <h2>{name}</h2>
                <p>{jobTitle}</p>
              </div>

              <div
                className={styles.statsSection}
                aria-label="Portfolio highlights"
              >
                {[
                  {
                    icon: FaBriefcase,
                    number: `${experience.years}+`,
                    label: "Years Engineering",
                  },
                  {
                    icon: FaCode,
                    number: `${projectCount}+`,
                    label: "Shipped Projects",
                  },
                  {
                    icon: FaBuilding,
                    number: company,
                    label: "Currently At",
                    href: companyUrl,
                  },
                ].map((stat) => (
                  <div key={stat.label} className={styles.statItem}>
                    <stat.icon className={styles.statIcon} aria-hidden="true" />
                    {stat.href ? (
                      <a
                        href={stat.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.statNumber}
                      >
                        {stat.number}
                      </a>
                    ) : (
                      <div className={styles.statNumber}>{stat.number}</div>
                    )}
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>

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
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    title={social.label}
                    aria-label={`${name} on ${social.label}`}
                  >
                    <social.icon aria-hidden="true" />
                  </a>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

export default BannerServer;
