import React from "react";

const AboutSEO = ({
  name = "Mahbub Alam",
  title = "Full Stack Developer",
  description = "Software Engineer specializing in scalable web applications and enterprise-level VoIP solutions",
  location = "Dhaka, Bangladesh",
  company = "Brotecs Technologies Ltd",
  image = "/assets/img/profile.png",
  skills = [],
  url = "",
}) => {
  // Generate comprehensive meta description
  const metaDescription = `${name} is a ${title} based in ${location}, working at ${company}. ${description}`;

  // Generate keywords from skills
  const keywords = [
    name,
    title,
    "software engineer",
    "full stack developer",
    "web development",
    "VoIP solutions",
    "React.js",
    "Node.js",
    "Laravel",
    "Python",
    "JavaScript",
    "TypeScript",
    "AWS",
    "Docker",
    "microservices",
    "RESTful APIs",
    "system architecture",
    "DevSecOps",
    ...skills,
  ].join(", ");

  // Structured data for rich snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: name,
    jobTitle: title,
    description: metaDescription,
    image: image,
    address: {
      "@type": "PostalAddress",
      addressLocality: location.split(",")[0]?.trim(),
      addressCountry: location.split(",")[1]?.trim() || "Bangladesh",
    },
    worksFor: {
      "@type": "Organization",
      name: company,
      url: "https://brotecs.com",
    },
    knowsAbout: skills,
    url: url || (typeof window !== "undefined" ? window.location.href : ""),
    sameAs: [
      "https://github.com/mahbub96",
      "https://linkedin.com/in/md-mahbub-alam-6b751821b",
      "https://fb.me/MahbubCSE96",
    ],
    hasOccupation: {
      "@type": "Occupation",
      name: title,
      occupationLocation: {
        "@type": "Place",
        name: location,
      },
    },
  };

  // Open Graph data
  const openGraphData = {
    title: `${name} - ${title}`,
    description: metaDescription,
    type: "profile",
    url: url || (typeof window !== "undefined" ? window.location.href : ""),
    images: [
      {
        url: image,
        width: 300,
        height: 300,
        alt: `${name} professional headshot`,
      },
    ],
    siteName: `${name}'s Portfolio`,
    locale: "en_US",
  };

  // Twitter Card data
  const twitterCardData = {
    card: "summary_large_image",
    title: `${name} - ${title}`,
    description: metaDescription,
    image: image,
    creator: "@mahbubcse96",
    site: "@mahbubcse96",
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Additional Schema.org markup for better SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `${name} - ${title}`,
            description: metaDescription,
            url:
              url ||
              (typeof window !== "undefined" ? window.location.href : ""),
            mainEntity: {
              "@type": "Person",
              name: name,
              jobTitle: title,
              description: description,
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item:
                    url ||
                    (typeof window !== "undefined" ? window.location.href : ""),
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "About",
                  item: `${
                    url ||
                    (typeof window !== "undefined" ? window.location.href : "")
                  }#about`,
                },
              ],
            },
          }),
        }}
      />
    </>
  );
};

export default AboutSEO;
