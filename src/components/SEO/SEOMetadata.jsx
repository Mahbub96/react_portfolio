import React from "react";

// Comprehensive SEO metadata component
const SEOMetadata = ({
  title = "Mahbub Alam | Full Stack Developer Portfolio - React, Node.js, Next.js, React Native, PHP Expert",
  description = "Mahbub Alam is a Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh. Contact: admin@mahbub.dev, support@mahbub.dev, mahbub@lunetsoft.com",
  keywords = "Mahbub Alam, Full Stack Developer, React Developer, Node.js Developer, PHP Developer, Bangladesh Developer, Dhaka, Web Development, Software Engineering",
  image = "https://mahbub.dev/assets/img/profile.png",
  url = "https://mahbub.dev",
  type = "website",
  profile = {},
  structuredData = {},
}) => {
  const name = profile?.name || "Mahbub Alam";
  const jobTitle = profile?.title || "Full Stack Developer";
  const bio = profile?.bio || description;
  const location = profile?.location || "Dhaka, Bangladesh";

  // Enhanced structured data for better SEO
  const enhancedStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": url,
    name: name,
    givenName: "Mahbub",
    familyName: "Alam",
    alternateName: ["Mahbub", "Mahbub Alam", "Md Mahbub Alam"],
    url: url,
    image: {
      "@type": "ImageObject",
      "@id": `${url}#profile-image`,
      url: image,
      contentUrl: image,
      width: 400,
      height: 400,
      caption: `${name} - ${jobTitle} Professional Headshot`,
      description: `Professional headshot of ${name}, a ${jobTitle} based in ${location}`,
      encodingFormat: "image/png",
      representativeOfPage: true,
      inLanguage: "en",
      license: `${url}/licenses/profile-image`,
      creditText: name,
      creator: {
        "@type": "Person",
        name: name,
        url: url,
      },
      publisher: {
        "@type": "Person",
        name: name,
        url: url,
      },
    },
    jobTitle: jobTitle,
    description: bio,
    email: ["admin@mahbub.dev", "support@mahbub.dev", "mahbub@lunetsoft.com"],
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
      addressLocality: location,
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
      name: jobTitle,
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
    ...structuredData,
  };

  return (
    <>
      {/* Enhanced Image SEO Meta Tags */}
      <meta name="image" content={image} />
      <meta name="image:width" content="400" />
      <meta name="image:height" content="400" />
      <meta
        name="image:alt"
        content={`${name} - ${jobTitle} Professional Headshot`}
      />
      <meta name="image:type" content="image/png" />
      <meta name="image:secure_url" content={image} />

      {/* Google Image Search Optimization */}
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />

      {/* Image Sitemap and Indexing */}
      <meta name="image:license" content={`${url}/licenses/profile-image`} />
      <meta name="image:credit" content={name} />
      <meta
        name="image:caption"
        content={`${name} - ${jobTitle} Professional Headshot`}
      />

      {/* Additional Image Formats for Better Indexing */}
      <link rel="image_src" href={image} />
      <link rel="image_src" href={`${url}/assets/img/profile-og.png`} />
      <link rel="image_src" href={`${url}/assets/img/profile-twitter.png`} />

      {/* Preload Critical Images */}
      <link rel="preload" as="image" href={image} />
      <link
        rel="preload"
        as="image"
        href={`${url}/assets/img/profile-og.png`}
      />

      {/* DNS Prefetch for Image CDN */}
      <link rel="dns-prefetch" href={url} />

      {/* Structured Data for Person */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(enhancedStructuredData),
        }}
      />

      {/* Additional Profile Image Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageObject",
            "@id": `${url}#profile-image-detailed`,
            name: `${name} Professional Headshot`,
            description: `Professional headshot of ${name}, ${jobTitle} and Software Engineer based in ${location}. High-quality professional portrait for portfolio and business use.`,
            url: image,
            contentUrl: image,
            width: 400,
            height: 400,
            caption: `${name} - ${jobTitle} Professional Headshot`,
            encodingFormat: "image/png",
            uploadDate: "2024-01-01",
            thumbnailUrl: `${url}/assets/img/profile-thumbnail.png`,
            representativeOfPage: true,
            inLanguage: "en",
            contentSize: "150KB",
            license: `${url}/licenses/profile-image`,
            acquireLicensePage: `${url}/contact`,
            creditText: name,
            creator: {
              "@type": "Person",
              name: name,
              url: url,
            },
            publisher: {
              "@type": "Person",
              name: name,
              url: url,
            },
            subjectOf: {
              "@type": "WebPage",
              "@id": `${url}#about`,
              name: `About ${name}`,
              url: `${url}#about`,
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": url,
              name: `${name} Portfolio`,
              url: url,
            },
          }),
        }}
      />

      {/* Local Business Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `${url}#business`,
            name: `${name} - ${jobTitle}`,
            description: bio,
            url: url,
            telephone: "+880-1XXX-XXXXXX",
            email: [
              "admin@mahbub.dev",
              "support@mahbub.dev",
              "mahbub@lunetsoft.com",
            ],
            address: {
              "@type": "PostalAddress",
              addressLocality: location,
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
          }),
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `Who is ${name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${name} is a ${jobTitle} based in ${location}, specializing in React, Node.js, PHP, and modern web technologies. He works at Brotecs Technologies Ltd and has expertise in VoIP solutions and system architecture.`,
                },
              },
              {
                "@type": "Question",
                name: `What technologies does ${name} work with?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${name} works with React.js, Node.js, PHP, Laravel, CodeIgniter, MongoDB, MySQL, AWS, Docker, and various other modern web technologies for full stack development.`,
                },
              },
              {
                "@type": "Question",
                name: `How can I contact ${name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `You can contact ${name} via email at admin@mahbub.dev, support@mahbub.dev, or mahbub@lunetsoft.com. He is based in ${location} and available for freelance projects and full-time opportunities.`,
                },
              },
            ],
          }),
        }}
      />

      {/* WebSite Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": `${url}#website`,
            name: `${name} Portfolio`,
            description: bio,
            url: url,
            author: {
              "@type": "Person",
              name: name,
              url: url,
            },
            publisher: {
              "@type": "Person",
              name: name,
              url: url,
            },
            inLanguage: "en",
            isAccessibleForFree: true,
            hasPart: [
              {
                "@type": "WebPage",
                "@id": `${url}#about`,
                name: `About ${name}`,
                url: `${url}#about`,
              },
              {
                "@type": "WebPage",
                "@id": `${url}#skills`,
                name: `${name} Skills`,
                url: `${url}#skills`,
              },
              {
                "@type": "WebPage",
                "@id": `${url}#projects`,
                name: `${name} Projects`,
                url: `${url}#projects`,
              },
              {
                "@type": "WebPage",
                "@id": `${url}#contact`,
                name: `Contact ${name}`,
                url: `${url}#contact`,
              },
            ],
          }),
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
                name: name,
                item: `${url}#about`,
              },
            ],
          }),
        }}
      />
    </>
  );
};

export default SEOMetadata;
