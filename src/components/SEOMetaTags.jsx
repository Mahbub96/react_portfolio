import React from "react";
import { Helmet } from "react-helmet-async";

const SEOMetaTags = ({
  title = "Mahbub's Portfolio",
  description = "Full Stack Developer specializing in React, Node.js, and modern web technologies. View my projects, skills, and experience.",
  keywords = "web developer, full stack developer, react developer, javascript developer, portfolio",
  image = "/og-image.jpg", // Add your OG image
  url = "https://your-domain.com", // Replace with your domain
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="Mahbub" />
      <link rel="canonical" href={url} />

      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Mahbub",
          url: url,
          sameAs: [
            "https://github.com/your-github",
            "https://linkedin.com/in/your-linkedin",
            // Add your social profiles
          ],
          jobTitle: "Full Stack Developer",
          worksFor: {
            "@type": "Organization",
            name: "Your Company/Freelance",
          },
        })}
      </script>
    </Helmet>
  );
};

export default SEOMetaTags;
