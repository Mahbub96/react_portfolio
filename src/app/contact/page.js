import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { buildPageGraph } from "@/lib/seo/structuredData.mjs";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";

export const dynamic = "force-dynamic";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), {
  ssr: true,
});

const Contact = NextDynamic(() => import("@/components/contact/Contact"), {
  ssr: true,
});

const Footer = NextDynamic(() => import("@/components/Footer"), {
  ssr: true,
});

const TITLE = "Contact";
// Neutral on purpose: no availability, hiring or freelance wording.
const DESCRIPTION = `Get in touch with ${SITE_AUTHOR.name}, ${SITE_AUTHOR.jobTitle} in ${SITE_AUTHOR.location} — email or send a message through the contact form.`;

export const metadata = pageMetadata({
  path: "/contact/",
  title: TITLE,
  description: DESCRIPTION,
});

export default function ContactPage() {
  const graph = buildPageGraph({
    path: "/contact/",
    name: `${TITLE} — ${SITE_AUTHOR.name}`,
    description: DESCRIPTION,
    type: "ContactPage",
    breadcrumb: [{ name: TITLE, path: "/contact/" }],
  });

  return (
    <div>
      <JsonLd data={graph} />

      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main className="container">
        <Suspense fallback={null}>
          <Contact headingLevel="h1" />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
