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
    default: "Mahbub Alam | Full Stack Developer Portfolio",
    template: "%s | Mahbub Alam Portfolio",
  },
  description:
    "Portfolio of Mahbub Alam - Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh.",
  metadataBase: new URL("https://mahbub.dev"),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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

        {/* Structured Data */}
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
              url: "https://mahbub.dev",
              image: "https://mahbub.dev/assets/img/profile.png",
              jobTitle: "Full Stack Developer",
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
                addressLocality: "Dhaka - 1230",
                addressCountry: "Bangladesh",
              },
              sameAs: [
                "https://github.com/mahbub96",
                "https://linkedin.com/in/md-mahbub-alam-6b751821b",
                "https://fb.me/MahbubCSE96",
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
