import React from "react";
import { Helmet } from "react-helmet-async";

const EnhancedSEO = ({
  title = "Mahbub Alam | Full Stack Developer Portfolio - React, Node.js, PHP Expert",
  description = "Mahbub Alam is a Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh. Contact: admin@mahbub.dev, support@mahbub.dev, mahbub@lunetsoft.com",
  keywords = "Mahbub Alam, Mahbub, Full Stack Developer, Web Developer, React Developer, PHP Developer, Node.js Developer, Bangladesh Developer, Dhaka, admin@mahbub.dev, support@mahbub.dev, mahbub@lunetsoft.com, VoIP Solutions, Laravel Developer, CodeIgniter Developer",
  image = "https://mahbub.dev/assets/img/profile.png",
  url = "https://mahbub.dev",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "Mahbub Alam",
  section = "Technology",
  tags = ["Web Development", "Full Stack", "React", "Node.js", "PHP"],
}) => {
  const emailAddresses = [
    "admin@mahbub.dev",
    "support@mahbub.dev",
    "mahbub@lunetsoft.com",
  ];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Enhanced Meta Tags */}
      <meta name="subject" content="Full Stack Development Portfolio" />
      <meta
        name="classification"
        content="Technology, Web Development, Software Engineering"
      />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />
      <meta name="revisit-after" content="7 days" />
      <meta name="target" content="all" />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />

      {/* Language and Region */}
      <meta name="language" content="English" />
      <meta name="geo.region" content="BD" />
      <meta name="geo.placename" content="Dhaka" />
      <meta name="geo.position" content="23.8103;90.4125" />
      <meta name="ICBM" content="23.8103, 90.4125" />

      {/* Links */}
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="bn" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Mahbub Alam Portfolio" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="bn_BD" />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      <meta property="article:author" content={author} />
      <meta property="article:section" content={section} />
      {tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@mahbubcse96" />
      <meta name="twitter:site" content="@mahbubcse96" />

      {/* Enhanced Person Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": url,
          name: "Mahbub Alam",
          givenName: "Mahbub",
          familyName: "Alam",
          alternateName: ["Mahbub", "Mahbub Alam", "Md Mahbub Alam"],
          url: url,
          image: image,
          jobTitle: "Full Stack Developer",
          description:
            "Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies",
          email: emailAddresses,
          telephone: "+880-1XXX-XXXXXX",
          worksFor: {
            "@type": "Organization",
            name: "Brotecs Technologies Ltd",
            description:
              "Technology company specializing in VoIP solutions and software development",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Dhaka",
              addressCountry: "Bangladesh",
            },
          },
          alumniOf: {
            "@type": "CollegeOrUniversity",
            name: "Stamford University Bangladesh",
            url: "https://stamforduniversity.edu.bd",
          },
          address: {
            "@type": "PostalAddress",
            addressLocality: "Dhaka",
            addressCountry: "Bangladesh",
            addressRegion: "Dhaka",
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
          hasOccupation: {
            "@type": "Occupation",
            name: "Full Stack Developer",
            skills: [
              "React",
              "Node.js",
              "PHP",
              "Laravel",
              "AWS",
              "Docker",
              "MongoDB",
              "MySQL",
            ],
            occupationalCategory: "15-1250 Software Developers and Programmers",
          },
          sameAs: [
            "https://github.com/mahbub96",
            "https://linkedin.com/in/md-mahbub-alam-6b751821b",
            "https://fb.me/MahbubCSE96",
          ],
        })}
      </script>

      {/* Local Business Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": `${url}#business`,
          name: "Mahbub Alam - Full Stack Developer",
          description:
            "Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies",
          url: url,
          telephone: "+880-1XXX-XXXXXX",
          email: emailAddresses,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Dhaka",
            addressCountry: "Bangladesh",
            addressRegion: "Dhaka",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 23.8103,
            longitude: 90.4125,
          },
          areaServed: {
            "@type": "Country",
            name: "Bangladesh",
          },
          serviceArea: {
            "@type": "Country",
            name: "Worldwide",
          },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Web Development Services",
            itemListElement: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Full Stack Web Development",
                  description: "React, Node.js, PHP development services",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "VoIP Solutions",
                  description: "Voice over IP system development",
                },
              },
            ],
          },
        })}
      </script>

      {/* FAQ Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Who is Mahbub Alam?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Mahbub Alam is a Full Stack Developer based in Dhaka, Bangladesh, specializing in React, Node.js, PHP, and modern web technologies. He works at Brotecs Technologies Ltd and has expertise in VoIP solutions and system architecture.",
              },
            },
            {
              "@type": "Question",
              name: "What technologies does Mahbub Alam work with?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Mahbub Alam works with React.js, Node.js, PHP, Laravel, CodeIgniter, MongoDB, MySQL, AWS, Docker, and various other modern web technologies for full stack development.",
              },
            },
            {
              "@type": "Question",
              name: "How can I contact Mahbub Alam?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "You can contact Mahbub Alam via email at admin@mahbub.dev, support@mahbub.dev, or mahbub@lunetsoft.com. He is based in Dhaka, Bangladesh and available for freelance projects and full-time opportunities.",
              },
            },
          ],
        })}
      </script>

      {/* Breadcrumb Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: url,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Mahbub Alam",
              item: `${url}#about`,
            },
          ],
        })}
      </script>
    </Helmet>
  );
};

export default EnhancedSEO;
