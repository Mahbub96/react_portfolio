import { Suspense } from "react";
import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("@/components/navbar/Navbar"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

const Contact = dynamic(() => import("@/components/contact/Contact"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div>Loading...</div>,
  ssr: true,
});

export const metadata = {
  title: "Contact Mahbub Alam | Full Stack Developer - Get in Touch",
  description:
    "Contact Mahbub Alam - Full Stack Developer for freelance projects and full-time opportunities. Email: admin@mahbub.dev, support@mahbub.dev, mahbub@lunetsoft.com. Based in Dhaka, Bangladesh.",
  keywords: [
    "Contact Mahbub Alam",
    "Hire Mahbub Alam",
    "Freelance Developer",
    "Full Stack Developer",
    "Mahbub Alam Contact",
    "Dhaka Developer",
    "Bangladesh Developer",
    "admin@mahbub.dev",
    "support@mahbub.dev",
    "mahbub@lunetsoft.com",
    "React Developer Contact",
    "PHP Developer Contact",
    "Node.js Developer Contact",
    "Web Development Services",
    "VoIP Solutions Contact",
  ],
  openGraph: {
    title: "Contact Mahbub Alam | Full Stack Developer - Get in Touch",
    description:
      "Contact Mahbub Alam - Full Stack Developer for freelance projects and full-time opportunities. Email: admin@mahbub.dev, support@mahbub.dev, mahbub@lunetsoft.com",
    url: "https://mahbub.dev/contact",
    siteName: "Mahbub Alam Portfolio",
    images: [
      {
        url: "/assets/img/profile.png",
        width: 1200,
        height: 630,
        alt: "Contact Mahbub Alam - Full Stack Developer",
      },
    ],
  },
  twitter: {
    title: "Contact Mahbub Alam | Full Stack Developer - Get in Touch",
    description:
      "Contact Mahbub Alam - Full Stack Developer for freelance projects and full-time opportunities.",
    images: ["/assets/img/profile.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar />
      </Suspense>

      <main className="container">
        <Suspense fallback={<div>Loading...</div>}>
          <Contact />
        </Suspense>
      </main>

      <Suspense fallback={<div>Loading...</div>}>
        <Footer />
      </Suspense>
    </div>
  );
}
