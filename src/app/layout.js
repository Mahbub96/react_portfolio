import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";

import "./globals.css";
import DataContextProvider from "@/contexts/useAllContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AnalyticsTracker from "@/components/AnalyticsTracker";
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const siteVerification = Object.fromEntries(
  [
    ["google", process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION],
    ["yandex", process.env.NEXT_PUBLIC_YANDEX_VERIFICATION],
    ["bing", process.env.NEXT_PUBLIC_BING_VERIFICATION],
  ].filter(([, value]) => Boolean(value))
);

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a192f",
};

export const metadata = {
  title: {
    default:
      "Mahbub Alam | Software Engineer - Full-Stack, Backend & Applied AI",
    template: "%s | Mahbub Alam Portfolio",
  },
  description:
    "Mahbub Alam is a Software Engineer specializing in full-stack, backend, cloud-enabled, and applied AI solutions. Based in Dhaka, Bangladesh. Contact: mahbubcse96@gmail.com",
  keywords: [
    "Mahbub Alam",
    "Software Engineer",
    "Full Stack Developer",
    "Backend Developer",
    "Applied AI Engineer",
    "React Developer",
    "Next.js Developer",
    "Node.js Developer",
    "Python Developer",
    "FastAPI",
    "PHP Developer",
    "Laravel Developer",
    "MongoDB",
    "MySQL",
    "AWS",
    "Docker",
    "DevSecOps",
    "Bangladesh Software Engineer",
    "Dhaka Developer",
    "Brotecs Technologies",
    "Software Architecture",
    "Web Application Development",
  ],
  authors: [{ name: "Mahbub Alam" }],
  creator: "Mahbub Alam",
  publisher: "Mahbub Alam",
  metadataBase: new URL("https://mahbub.dev"),
  alternates: {
    canonical: "https://mahbub.dev/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  ...(Object.keys(siteVerification).length > 0
    ? { verification: siteVerification }
    : {}),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mahbub.dev",
    title:
      "Mahbub Alam | Software Engineer - Full-Stack, Backend & Applied AI",
    description:
      "Mahbub Alam is a Software Engineer specializing in full-stack, backend, cloud-enabled, and applied AI solutions. Based in Dhaka, Bangladesh. Contact: mahbubcse96@gmail.com",
    siteName: "Mahbub Alam Portfolio",
    images: [
      {
        url: "https://mahbub.dev/assets/img/profile.png",
        width: 400,
        height: 400,
        alt: "Mahbub Alam - Software Engineer Professional Headshot",
        type: "image/png",
        secureUrl: "https://mahbub.dev/assets/img/profile.png",
      },
      {
        url: "https://mahbub.dev/assets/img/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Mahbub Alam - Software Engineer Portfolio Banner",
        type: "image/jpeg",
        secureUrl: "https://mahbub.dev/assets/img/og-cover.jpg",
      },
      {
        url: "https://mahbub.dev/assets/img/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Mahbub Alam - Software Engineer Twitter Card",
        type: "image/jpeg",
        secureUrl: "https://mahbub.dev/assets/img/og-cover.jpg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Mahbub Alam | Software Engineer - Full-Stack, Backend & Applied AI",
    description:
      "Mahbub Alam is a Software Engineer specializing in full-stack, backend, cloud-enabled, and applied AI solutions. Based in Dhaka, Bangladesh. Contact: mahbubcse96@gmail.com",
    images: [
      {
        url: "https://mahbub.dev/assets/img/profile.png",
        alt: "Mahbub Alam - Software Engineer Professional Headshot",
      },
      {
        url: "https://mahbub.dev/assets/img/og-cover.jpg",
        alt: "Mahbub Alam - Software Engineer Twitter Card",
      },
    ],
    creator: "@mahbubcse96",
    site: "@mahbubcse96",
    imageAlt: "Mahbub Alam - Software Engineer Professional Headshot",
  },
  other: {
    "msapplication-TileColor": "#0a192f",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Mahbub Portfolio",
    "application-name": "Mahbub Portfolio",
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no, email=no, address=no",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="https://mahbub.dev/favicon.ico" />
        <link rel="apple-touch-icon" href="https://mahbub.dev/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="format-detection" content="telephone=no" />

        {/* Enhanced Image SEO Meta Tags */}
        <meta
          name="image"
          content="https://mahbub.dev/assets/img/profile.png"
        />
        <meta name="image:width" content="400" />
        <meta name="image:height" content="400" />
        <meta
          name="image:alt"
          content="Mahbub Alam - Software Engineer Professional Headshot"
        />
        <meta name="image:type" content="image/png" />
        <meta
          name="image:secure_url"
          content="https://mahbub.dev/assets/img/profile.png"
        />

        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        {/* Image Sitemap and Indexing */}
        <meta
          name="image:license"
          content="https://mahbub.dev/licenses/profile-image"
        />
        <meta name="image:credit" content="Mahbub Alam" />
        <meta
          name="image:caption"
          content="Mahbub Alam - Software Engineer Professional Headshot"
        />

        {/* Additional Image Formats for Better Indexing */}
        <link
          rel="image_src"
          href="https://mahbub.dev/assets/img/profile.png"
        />
        <link
          rel="image_src"
          href="https://mahbub.dev/assets/img/og-cover.jpg"
        />
        <link
          rel="image_src"
          href="https://mahbub.dev/assets/img/og-cover.jpg"
        />

        {/* Preload Critical Images */}
        <link
          rel="preload"
          as="image"
          href="https://mahbub.dev/assets/img/profile.png"
        />
        <link
          rel="preload"
          as="image"
          href="https://mahbub.dev/assets/img/og-cover.jpg"
        />

        {/* DNS Prefetch for Image CDN */}
        <link rel="dns-prefetch" href="https://mahbub.dev" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Enhanced Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "@id": "https://mahbub.dev",
              name: "Mahbub Alam",
              givenName: "Mahbub",
              familyName: "Alam",
              alternateName: ["Mahbub", "Mahbub Alam", "Md Mahbub Alam"],
              url: "https://mahbub.dev",
              image: {
                "@type": "ImageObject",
                "@id": "https://mahbub.dev#profile-image",
                url: "https://mahbub.dev/assets/img/profile.png",
                contentUrl: "https://mahbub.dev/assets/img/profile.png",
                width: 400,
                height: 400,
                caption:
                  "Mahbub Alam - Software Engineer Professional Headshot",
                description:
                  "Professional headshot of Mahbub Alam, a Software Engineer based in Dhaka, Bangladesh",
                encodingFormat: "image/png",
                uploadDate: "2024-01-01",
                thumbnailUrl:
                  "https://mahbub.dev/assets/img/profile-thumbnail.png",
                representativeOfPage: true,
                inLanguage: "en",
                contentSize: "150KB",
                license: "https://mahbub.dev/licenses/profile-image",
                acquireLicensePage: "https://mahbub.dev/contact",
                creditText: "Mahbub Alam",
                creator: {
                  "@type": "Person",
                  name: "Mahbub Alam",
                  url: "https://mahbub.dev",
                },
                publisher: {
                  "@type": "Person",
                  name: "Mahbub Alam",
                  url: "https://mahbub.dev",
                },
              },
              jobTitle: "Software Engineer | Full-Stack, Backend & Applied AI",
              description:
                "Software Engineer specializing in full-stack, backend, cloud-enabled, and applied AI solutions",
              email: ["mahbubcse96@gmail.com"],
              telephone: "+880-1784-310996",
              worksFor: {
                "@type": "Organization",
                name: "Brotecs Technologies Ltd",
                description:
                  "Technology company specializing in software development and backend systems",
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
                addressLocality: "Dhaka - 1230",
                addressCountry: "Bangladesh",
                addressRegion: "Dhaka",
              },
              knowsAbout: [
                "Full Stack Development",
                "Software Engineering",
                "Backend Development",
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
                "Backend Systems",
                "System Architecture",
                "DevSecOps",
                "Docker",
                "AWS",
                "Oracle Cloud",
                "Google Cloud Platform",
                "Applied AI",
                "Machine Learning",
                "Computer Vision",
              ],
              hasOccupation: {
                "@type": "Occupation",
                name: "Software Engineer",
                skills: [
                  "React",
                  "Node.js",
                  "Next.js",
                  "Python",
                  "FastAPI",
                  "PHP",
                  "Laravel",
                  "AWS",
                  "Docker",
                  "MongoDB",
                  "MySQL",
                ],
                occupationalCategory:
                  "15-1250 Software Developers and Programmers",
              },
              sameAs: [
                "https://github.com/mahbub96",
                "https://linkedin.com/in/md-mahbub-alam-6b751821b",
                "https://fb.me/MahbubCSE96",
              ],
            }),
          }}
        />

        {/* Additional Profile Image Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ImageObject",
              "@id": "https://mahbub.dev#profile-image-detailed",
              name: "Mahbub Alam Professional Headshot",
              description:
                "Professional headshot of Mahbub Alam, Software Engineer and Software Engineer based in Dhaka, Bangladesh. High-quality professional portrait for portfolio and business use.",
              url: "https://mahbub.dev/assets/img/profile.png",
              contentUrl: "https://mahbub.dev/assets/img/profile.png",
              width: 400,
              height: 400,
              caption:
                "Mahbub Alam - Software Engineer Professional Headshot",
              encodingFormat: "image/png",
              uploadDate: "2024-01-01",
              thumbnailUrl:
                "https://mahbub.dev/assets/img/profile-thumbnail.png",
              representativeOfPage: true,
              inLanguage: "en",
              contentSize: "150KB",
              license: "https://mahbub.dev/licenses/profile-image",
              acquireLicensePage: "https://mahbub.dev/contact",
              creditText: "Mahbub Alam",
              creator: {
                "@type": "Person",
                name: "Mahbub Alam",
                url: "https://mahbub.dev",
              },
              publisher: {
                "@type": "Person",
                name: "Mahbub Alam",
                url: "https://mahbub.dev",
              },
              subjectOf: {
                "@type": "WebPage",
                "@id": "https://mahbub.dev#about",
                name: "About Mahbub Alam",
                url: "https://mahbub.dev#about",
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": "https://mahbub.dev",
                name: "Mahbub Alam Portfolio",
                url: "https://mahbub.dev",
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
              "@id": "https://mahbub.dev#business",
              name: "Mahbub Alam - Software Engineer",
              description:
                "Software Engineer specializing in full-stack, backend, cloud-enabled, and applied AI solutions",
              url: "https://mahbub.dev",
              telephone: "+880-1784-310996",
              email: ["mahbubcse96@gmail.com"],
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
                name: "Software Engineering Services",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Full-Stack and Backend Development",
                      description:
                        "React, Next.js, Node.js, Python, PHP, and Laravel development",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Backend Systems",
                      description:
                        "Backend APIs, integrations, data workflows, and cloud-enabled systems",
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
                  name: "Who is Mahbub Alam?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Mahbub Alam is a Software Engineer based in Dhaka, Bangladesh, specializing in full-stack development, backend systems, cloud-enabled applications, and applied AI. He works at Brotecs Technologies Ltd.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What technologies does Mahbub Alam work with?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Mahbub Alam works with React.js, Next.js, Node.js, Python, FastAPI, PHP, Laravel, MongoDB, MySQL, Docker, and modern cloud-enabled development workflows.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How can I contact Mahbub Alam?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You can contact Mahbub Alam via email at mahbubcse96@gmail.com. He is based in Dhaka, Bangladesh and available for professional technical communication and project discussions.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <DataContextProvider>
          <ThemeProvider>
            {children}
            <AnalyticsTracker />
          </ThemeProvider>
        </DataContextProvider>
      </body>
    </html>
  );
}