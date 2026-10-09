import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";

import "./globals.css";
import DataContextProvider from "@/contexts/useAllContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import {
  DEFAULT_OG_IMAGE,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
} from "@/lib/seo/siteConfig.mjs";

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

/**
 * Site-wide defaults only.
 *
 * Deliberately absent here:
 *  - `alternates.canonical` — a layout canonical is inherited by every page
 *    that forgets to override it (that is how /projects/, /skills/ and
 *    /contact/ ended up canonicalised to the homepage). Each page sets its own
 *    via pageMetadata().
 *  - `robots` — an inherited "index, follow" was emitted next to Next's own
 *    "noindex" on 404 pages, giving crawlers contradictory directives.
 *  - JSON-LD — each page renders exactly one graph (see lib/seo/structuredData).
 *  - `keywords` — ignored by Google; it only leaked the email address.
 */
export const metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: `${SITE_AUTHOR.name} — ${SITE_AUTHOR.jobTitle}`,
    template: `%s — ${SITE_AUTHOR.name}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_AUTHOR.name, url: `${SITE_ORIGIN}/` }],
  creator: SITE_AUTHOR.name,
  publisher: SITE_AUTHOR.name,
  ...(Object.keys(siteVerification).length > 0
    ? { verification: siteVerification }
    : {}),
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_AUTHOR.xHandle,
    creator: SITE_AUTHOR.xHandle,
    images: [{ url: DEFAULT_OG_IMAGE.url, alt: DEFAULT_OG_IMAGE.alt }],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  other: {
    "msapplication-TileColor": "#0a192f",
  },
};

// Runs before first paint so a saved light theme never flashes dark.
// Mirrors ThemeProvider: dark unless localStorage says "light".
const THEME_SCRIPT = `try{document.documentElement.setAttribute("data-theme",localStorage.getItem("theme")==="light"?"light":"dark")}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
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
