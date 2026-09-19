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
    "Mahbub",
    "Full Stack Developer",
    "Software Engineer",
    "Backend Developer",
    "Applied AI",
    "Web Developer",
    "React Developer",
    "PHP Developer",
    "Node.js Developer",
    "Next.js Developer",
    "React Native Developer",
    "Bangladesh Developer",
    "Dhaka Developer",
    "mahbubcse96@gmail.com",
    "Brotecs Technologies",
    "Backend Systems",
    "Laravel Developer",
    "CodeIgniter Developer",
    "MongoDB Developer",
    "MySQL Developer",
    "AWS Developer",
    "Docker Developer",
    "DevSecOps Engineer",
    "System Architect",
    "Cloud Computing Expert",
    "Web Application Development",
    "Mobile App Development",
    "API Development",
    "Microservices Architecture",
    "Agile Development",
    "Test Driven Development",
    "Continuous Integration",
    "Software Engineering",
    "Computer Science",
    "Stamford University Bangladesh",
    "Freelance Developer",
    "Remote Developer",
    "Bangladesh IT Services",
    "Dhaka IT Solutions",
    "Web Design",
    "UI/UX Development",
    "Frontend Development",
    "Backend Development",
    "Database Design",
    "Server Administration",
    "Linux Administration",
    "Git Version Control",
    "CI/CD Pipeline",
    "DevOps Engineer",
    "Software Consultant",
    "Technical Lead",
    "Project Manager",
    "Team Lead",
    "Code Review",
    "Performance Optimization",
    "Security Implementation",
    "Scalable Architecture",
    "Enterprise Solutions",
    "Startup Development",
    "E-commerce Development",
    "CMS Development",
    "WordPress Development",
    "Shopify Development",
    "Custom Software Development",
    "Legacy System Migration",
    "Database Migration",
    "API Integration",
    "Third-party Integration",
    "Payment Gateway Integration",
    "Social Media Integration",
    "Analytics Integration",
    "SEO Optimization",
    "Performance Testing",
    "Load Testing",
    "Security Testing",
    "Unit Testing",
    "Integration Testing",
    "End-to-End Testing",
    "Bug Fixing",
    "Code Refactoring",
    "Technical Documentation",
    "User Manuals",
    "API Documentation",
    "System Architecture Documentation",
    "Database Schema Design",
    "Data Modeling",
    "Business Logic Implementation",
    "User Authentication",
    "Authorization Systems",
    "Role-based Access Control",
    "Multi-factor Authentication",
    "OAuth Implementation",
    "JWT Tokens",
    "Session Management",
    "Cookie Management",
    "Data Validation",
    "Input Sanitization",
    "SQL Injection Prevention",
    "XSS Prevention",
    "CSRF Protection",
    "HTTPS Implementation",
    "SSL Certificates",
    "Domain Management",
    "Hosting Management",
    "Server Monitoring",
    "Log Management",
    "Error Tracking",
    "Performance Monitoring",
    "Uptime Monitoring",
    "Backup Management",
    "Disaster Recovery",
    "Data Backup",
    "Version Control",
    "Code Deployment",
    "Environment Management",
    "Development Environment",
    "Staging Environment",
    "Production Environment",
    "Configuration Management",
    "Environment Variables",
    "Secrets Management",
    "API Keys Management",
    "Database Credentials",
    "Server Credentials",
    "SSL Certificates Management",
    "Domain SSL",
    "Wildcard SSL",
    "Multi-domain SSL",
    "Email Configuration",
    "SMTP Setup",
    "IMAP Setup",
    "POP3 Setup",
    "Email Templates",
    "Email Automation",
    "Email Marketing",
    "Newsletter Management",
    "Contact Form",
    "Feedback System",
    "Support Ticket System",
    "Live Chat Integration",
    "Customer Support",
    "Technical Support",
    "Bug Reporting",
    "Feature Request",
    "User Feedback",
    "Analytics Dashboard",
    "Google Analytics",
    "Google Search Console",
    "Bing Webmaster Tools",
    "Yandex Webmaster",
    "SEO Tools",
    "Keyword Research",
    "On-page SEO",
    "Off-page SEO",
    "Technical SEO",
    "Local SEO",
    "Mobile SEO",
    "Page Speed Optimization",
    "Core Web Vitals",
    "Lighthouse Score",
    "GTmetrix Score",
    "PageSpeed Insights",
    "WebPageTest",
    "Performance Budget",
    "Critical CSS",
    "CSS Minification",
    "JavaScript Minification",
    "Image Optimization",
    "WebP Images",
    "Responsive Images",
    "Lazy Loading",
    "Preloading",
    "Prefetching",
    "Service Workers",
    "Progressive Web App",
    "Offline Support",
    "Push Notifications",
    "App-like Experience",
    "Mobile-first Design",
    "Responsive Design",
    "Cross-browser Compatibility",
    "Accessibility",
    "WCAG Guidelines",
    "ARIA Labels",
    "Screen Reader Support",
    "Keyboard Navigation",
    "Color Contrast",
    "Font Size",
    "Readability",
    "User Experience",
    "User Interface",
    "Design Systems",
    "Component Libraries",
    "Design Tokens",
    "CSS Variables",
    "CSS Grid",
    "CSS Flexbox",
    "CSS Animations",
    "CSS Transitions",
    "CSS Transforms",
    "CSS Filters",
    "CSS Custom Properties",
    "CSS Modules",
    "Styled Components",
    "Emotion",
    "Tailwind CSS",
    "Bootstrap",
    "Material-UI",
    "Ant Design",
    "Chakra UI",
    "Semantic UI",
    "Foundation",
    "Bulma",
    "Pure CSS",
    "Skeleton",
    "Milligram",
    "Spectre.css",
    "UIkit",
    "Element UI",
    "Vuetify",
    "Quasar",
    "Nuxt.js",
    "Gatsby",
    "Next.js",
    "Create React App",
    "Vite",
    "Webpack",
    "Rollup",
    "Parcel",
    "ESBuild",
    "SWC",
    "Babel",
    "TypeScript",
    "Flow",
    "ESLint",
    "Prettier",
    "Husky",
    "Lint-staged",
    "Commitizen",
    "Conventional Commits",
    "Semantic Release",
    "Changelog Generation",
    "Release Notes",
    "Version Management",
    "Semantic Versioning",
    "Git Tags",
    "Git Branches",
    "Git Flow",
    "GitHub Flow",
    "GitLab Flow",
    "Feature Branches",
    "Hotfix Branches",
    "Release Branches",
    "Main Branch",
    "Develop Branch",
    "Pull Requests",
    "Code Review",
    "Merge Conflicts",
    "Rebasing",
    "Squashing",
    "Cherry-picking",
    "Git Hooks",
    "Pre-commit Hooks",
    "Post-commit Hooks",
    "Pre-push Hooks",
    "Post-merge Hooks",
    "Git Aliases",
    "Git Config",
    "Git Ignore",
    "Git Attributes",
    "Git Submodules",
    "Git Worktrees",
    "Git LFS",
    "Git Bisect",
    "Git Blame",
    "Git Log",
    "Git Show",
    "Git Diff",
    "Git Status",
    "Git Add",
    "Git Commit",
    "Git Push",
    "Git Pull",
    "Git Fetch",
    "Git Clone",
    "Git Init",
    "Git Remote",
    "Git Branch",
    "Git Checkout",
    "Git Merge",
    "Git Rebase",
    "Git Reset",
    "Git Revert",
    "Git Cherry-pick",
    "Git Stash",
    "Git Clean",
    "Git Archive",
    "Git Bundle",
    "Git Notes",
    "Git Replace",
    "Git Filter-branch",
    "Git Subtree",
    "Git Worktree",
    "Git LFS",
    "Git Credential",
    "Git Config",
    "Git Help",
    "Git Documentation",
    "Git Tutorials",
    "Git Best Practices",
    "Git Workflows",
    "Git Strategies",
    "Git Tools",
    "Git GUI",
    "Git CLI",
    "Git IDE Integration",
    "VS Code Git",
    "IntelliJ Git",
    "Eclipse Git",
    "Atom Git",
    "Sublime Text Git",
    "Vim Git",
    "Emacs Git",
    "GitHub Desktop",
    "GitKraken",
    "SourceTree",
    "SmartGit",
    "TortoiseGit",
    "Git Extensions",
    "Git Cola",
    "Gitg",
    "Giggle",
    "QGit",
    "GitNub",
    "GitBox",
    "GitUp",
    "Fork",
    "GitAhead",
    "GitKraken",
    "SourceTree",
    "SmartGit",
    "TortoiseGit",
    "Git Extensions",
    "Git Cola",
    "Gitg",
    "Giggle",
    "QGit",
    "GitNub",
    "GitBox",
    "GitUp",
    "Fork",
    "GitAhead",
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
              telephone: "+880-1XXX-XXXXXX",
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
              telephone: "+880-1XXX-XXXXXX",
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