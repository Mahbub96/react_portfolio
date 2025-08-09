import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import DataContextProvider from "@/contexts/useAllContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: {
    default:
      "Mahbub Alam | Full Stack Developer Portfolio - React, Node.js,Next.js,React Native, PHP Expert",
    template: "%s | Mahbub Alam Portfolio",
  },
  description:
    "Mahbub Alam is a Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh. Contact: admin@mahbub.dev, support@mahbub.dev, mahbub@lunetsoft.com",
  keywords: [
    "Mahbub Alam",
    "Mahbub",
    "Full Stack Developer",
    "Web Developer",
    "React Developer",
    "PHP Developer",
    "Node.js Developer",
    "Bangladesh Developer",
    "Dhaka",
    "admin@mahbub.dev",
    "support@mahbub.dev",
    "mahbub@lunetsoft.com",
    "Brotecs Technologies",
    "VoIP Solutions",
    "Laravel Developer",
    "CodeIgniter Developer",
  ],
  authors: [{ name: "Mahbub Alam" }],
  creator: "Mahbub Alam",
  publisher: "Mahbub Alam",
  metadataBase: new URL("https://mahbub.dev"),
  alternates: {
    canonical: "/",
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
  verification: {
    google: "your-google-verification-code-here", // Replace with actual Google Search Console verification code
    yandex: "your-yandex-verification-code-here", // Optional: Yandex verification
    bing: "your-bing-verification-code-here", // Optional: Bing verification
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mahbub.dev",
    title:
      "Mahbub Alam | Full Stack Developer Portfolio - React, Node.js, PHP Expert",
    description:
      "Mahbub Alam is a Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh.",
    siteName: "Mahbub Alam Portfolio",
    images: [
      {
        url: "/assets/img/profile.png",
        width: 1200,
        height: 630,
        alt: "Mahbub Alam - Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Mahbub Alam | Full Stack Developer Portfolio - React, Node.js, PHP Expert",
    description:
      "Mahbub Alam is a Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh.",
    images: ["/assets/img/profile.png"],
    creator: "@mahbubcse96",
    site: "@mahbubcse96",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a192f" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />

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
              image: "https://mahbub.dev/assets/img/profile.png",
              jobTitle: "Full Stack Developer",
              description:
                "Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies",
              email: [
                "admin@mahbub.dev",
                "support@mahbub.dev",
                "mahbub@lunetsoft.com",
              ],
              telephone: "+880-1XXX-XXXXXX",
              worksFor: {
                "@type": "Organization",
                name: "Brotecs Technologies Ltd",
                url: "https://brotecs.com",
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

        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://mahbub.dev#business",
              name: "Mahbub Alam - Full Stack Developer",
              description:
                "Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies",
              url: "https://mahbub.dev",
              telephone: "+880-1XXX-XXXXXX",
              email: [
                "admin@mahbub.dev",
                "support@mahbub.dev",
                "mahbub@lunetsoft.com",
              ],
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
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <DataContextProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </DataContextProvider>
      </body>
    </html>
  );
}
