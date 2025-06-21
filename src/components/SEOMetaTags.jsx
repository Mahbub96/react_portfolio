import React from "react";
import { Helmet } from "react-helmet-async";

const SEOMetaTags = ({
  data,
  title = "Mahbub Alam | Full Stack Developer Portfolio",
  description = "Portfolio of Mahbub Alam - Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh.",
  keywords = "Mahbub Alam, Mahbub, Full Stack Developer, Web Developer, React Developer, PHP Developer, Bangladesh Developer, Dhaka",
  image = "/assets/img/profile.png", // Update with your actual OG image path
  url = "https://mahbub.dev", // Replace with your actual domain
}) => {
  // Extract data from database
  const profile = data?.profile?.data || {};
  const bannerData = data?.Banner?.data || {};
  const contactData = data?.Contact?.data || {};

  // Use database data with fallbacks
  const name = profile.name || bannerData.name || "Mahbub Alam";
  const jobTitle = profile.title || "Full Stack Developer";
  const bio = profile.bio || description;
  const location = contactData.contactInfo?.location || "Dhaka, Bangladesh";
  const email = contactData.contactInfo?.email || "mahbubcse96@gmail.com";
  const socialLinks = bannerData.socialLinks || {
    github: "https://github.com/mahbub96",
    linkedin: "https://linkedin.com/in/md-mahbub-alam-6b751821b",
    facebook: "https://fb.me/MahbubCSE96",
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={bio} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={name} />
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={bio} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={`${name} Portfolio`} />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={bio} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@mahbubcse96" />{" "}
      {/* Add your Twitter handle */}
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="BD" />
      <meta name="geo.placename" content="Dhaka" />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="en" href={url} />
      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": url,
          name: name,
          givenName: name.split(" ")[0] || "Mahbub",
          familyName: name.split(" ").slice(1).join(" ") || "Alam",
          url: url,
          image: image,
          jobTitle: jobTitle,
          worksFor: {
            "@type": "Organization",
            name: "Brotecs Technologies Ltd",
          },
          alumniOf: {
            "@type": "CollegeOrUniversity",
            name: "Stamford University Bangladesh",
          },
          address: {
            "@type": "PostalAddress",
            addressLocality: location,
            addressCountry: "Bangladesh",
          },
          sameAs: [
            socialLinks.github,
            socialLinks.linkedin,
            socialLinks.facebook,
          ].filter(Boolean),
        })}
      </script>
      {/* Professional Profile Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: name,
            description: bio,
            knowsAbout: [
              "Full Stack Development",
              "React.js",
              "Node.js",
              "PHP",
              "Laravel",
              "CodeIgniter",
              "Cloud Computing",
              "VoIP Solutions",
            ],
            hasOccupation: {
              "@type": "Occupation",
              name: jobTitle,
              skills: ["React", "Node.js", "PHP", "Laravel", "AWS", "Docker"],
            },
          },
        })}
      </script>
    </Helmet>
  );
};

export default SEOMetaTags;
