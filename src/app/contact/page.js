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
  title: "Contact",
  description:
    "Get in touch with Mahbub Alam - Full Stack Developer. Available for freelance projects and full-time opportunities in Dhaka, Bangladesh.",
  keywords: [
    "Contact",
    "Hire",
    "Freelance",
    "Full Stack Developer",
    "Mahbub Alam",
    "Dhaka",
    "Bangladesh",
  ],
  openGraph: {
    title: "Contact | Mahbub Alam Portfolio",
    description: "Get in touch with Mahbub Alam - Full Stack Developer.",
    url: "https://mahbub.dev/contact",
  },
  twitter: {
    title: "Contact | Mahbub Alam Portfolio",
    description: "Get in touch with Mahbub Alam - Full Stack Developer.",
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
