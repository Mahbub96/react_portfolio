import { Suspense } from "react";
import NextDynamic from "next/dynamic";
import Link from "next/link";
import { getPortfolioData } from "@/lib/getPortfolioData";
import JsonLd from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata.mjs";
import { buildPageGraph, PERSON_ID } from "@/lib/seo/structuredData.mjs";
import { SITE_AUTHOR } from "@/lib/seo/siteConfig.mjs";
import {
  ABOUT_TITLE,
  ABOUT_DESCRIPTION,
} from "@/lib/seo/aboutProfile.mjs";
import {
  LuBriefcase,
  LuMapPin,
  LuArrowUpRight,
  LuFileText,
  LuServer,
  LuAppWindow,
  LuBrain,
  LuContainer,
  LuZap,
  LuShieldCheck,
  LuCpu,
} from "react-icons/lu";
import { FaGithub, FaLinkedinIn, FaEnvelope } from "react-icons/fa";
import styles from "./about.module.css";

export const dynamic = "force-dynamic";

const Navbar = NextDynamic(() => import("@/components/navbar/Navbar"), {
  ssr: true,
});

const Experience = NextDynamic(
  () => import("@/components/experiences/Experience"),
  { ssr: true }
);

const Educations = NextDynamic(
  () => import("@/components/educations/Educations"),
  { ssr: true }
);

const Footer = NextDynamic(() => import("@/components/Footer"), {
  ssr: true,
});

const PATH = "/about/";

export const metadata = pageMetadata({
  path: PATH,
  title: `${ABOUT_TITLE} — ${SITE_AUTHOR.jobTitle}`,
  absoluteTitle: true,
  description: ABOUT_DESCRIPTION,
});

export default async function AboutPage() {
  const portfolioData = await getPortfolioData();
  const profile = portfolioData?.profile?.data || {};

  const graph = buildPageGraph({
    path: PATH,
    name: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    type: "AboutPage",
    breadcrumb: [{ name: "About", path: PATH }],
    mainEntity: { "@id": PERSON_ID },
  });

  return (
    <div>
      <JsonLd data={graph} />

      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <main role="main" className={styles.aboutSection}>
        <div className="container">
          {/* ===============================================================
              1. HERO / BIOGRAPHY SECTION
              =============================================================== */}
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowBar} aria-hidden="true" />
                <span className={styles.eyebrowText}>ENGINEER PROFILE</span>
              </div>

              <h1 className={styles.mainTitle}>{SITE_AUTHOR.name}</h1>

              <div className={styles.badgesRow}>
                <span className={styles.badge}>
                  <LuBriefcase className={styles.badgeIcon} />
                  {SITE_AUTHOR.jobTitle} · {SITE_AUTHOR.company}
                </span>
                <span className={styles.badge}>
                  <LuMapPin className={styles.badgeIcon} />
                  {SITE_AUTHOR.location}
                </span>
              </div>

              <p className={styles.bioLead}>
                Software engineer specialized in architecting resilient backend services, high-throughput REST APIs, and production full-stack systems. Driven by clean architecture, deep observability, and applied AI.
              </p>

              <p className={styles.bioSecondary}>
                My professional work covers enterprise systems, healthcare platforms, automated ERP workflows, and applied machine learning — including automatic speech recognition with Whisper fine-tuning and offline-first mobile applications.
              </p>

              {/* Quick Metrics Bento */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>4+</span>
                  <span className={styles.metricLabel}>Years Exp</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>20+</span>
                  <span className={styles.metricLabel}>Projects</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>3.70</span>
                  <span className={styles.metricLabel}>B.Sc. CGPA</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>100%</span>
                  <span className={styles.metricLabel}>Production</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.heroActions}>
                <Link href="/contact/" className={styles.btnPrimary}>
                  Get in Touch
                  <LuArrowUpRight />
                </Link>
                <Link href="/resume/" className={styles.btnSecondary}>
                  <LuFileText />
                  View Resume
                </Link>

                <div className={styles.socialRow}>
                  <a
                    href={SITE_AUTHOR.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    aria-label="GitHub Profile"
                  >
                    <FaGithub />
                  </a>
                  <a
                    href={SITE_AUTHOR.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                    aria-label="LinkedIn Profile"
                  >
                    <FaLinkedinIn />
                  </a>
                  <a
                    href={`mailto:${SITE_AUTHOR.email}`}
                    className={styles.socialBtn}
                    aria-label="Email Mahbub"
                  >
                    <FaEnvelope />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Terminal Developer Window */}
            <div className={styles.terminalWindow}>
              <div className={styles.terminalBar}>
                <div className={styles.terminalDots}>
                  <span className={styles.dotRed} />
                  <span className={styles.dotYellow} />
                  <span className={styles.dotGreen} />
                </div>
                <span className={styles.terminalFileName}>mahbub.developer.ts</span>
                <span style={{ width: "32px" }} />
              </div>

              <pre className={styles.terminalBody}>
                <code>
                  <span className={styles.codeComment}>// Systems architecture & engineering mindset</span>
                  {"\n"}
                  <span className={styles.codeKeyword}>export const</span>{" "}
                  <span className={styles.codeVar}>engineer</span> = {"{"}
                  {"\n"}  name: <span className={styles.codeString}>"{SITE_AUTHOR.name}"</span>,
                  {"\n"}  role: <span className={styles.codeString}>"{SITE_AUTHOR.jobTitle}"</span>,
                  {"\n"}  company: <span className={styles.codeString}>"{SITE_AUTHOR.company}"</span>,
                  {"\n"}  location: <span className={styles.codeString}>"{SITE_AUTHOR.location}"</span>,
                  {"\n"}  coreStack: [
                  {"\n"}    <span className={styles.codeString}>"Node.js"</span>, <span className={styles.codeString}>"NestJS"</span>, <span className={styles.codeString}>"Python"</span>,
                  {"\n"}    <span className={styles.codeString}>"FastAPI"</span>, <span className={styles.codeString}>"React"</span>, <span className={styles.codeString}>"Next.js"</span>,
                  {"\n"}    <span className={styles.codeString}>"PostgreSQL"</span>, <span className={styles.codeString}>"Docker"</span>
                  {"\n"}  ],
                  {"\n"}  researchFocus: <span className={styles.codeString}>"Speech Recognition (Whisper)"</span>,
                  {"\n"}  philosophy: <span className={styles.codeString}>"Root cause first; design for reliability"</span>,
                  {"\n"}  status: <span className={styles.codeString}>"Ready for complex engineering challenges"</span>
                  {"\n"}{"}"};
                </code>
              </pre>
            </div>
          </div>

          {/* ===============================================================
              2. CORE ENGINEERING FOCUS AREAS (BENTO GRID)
              =============================================================== */}
          <div className={styles.sectionHeader}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowBar} aria-hidden="true" />
              <span className={styles.eyebrowText}>TECHNICAL DOMAINS</span>
            </div>
            <h2 className={styles.sectionTitle}>Engineering Focus Areas</h2>
            <p className={styles.sectionSubtitle}>
              Core technical disciplines I specialize in across production systems and applied research.
            </p>
          </div>

          <div className={styles.focusGrid}>
            <article className={styles.bentoCard}>
              <div className={styles.iconBadge}>
                <LuServer />
              </div>
              <h3 className={styles.cardTitle}>Backend & Platform Engineering</h3>
              <p className={styles.cardText}>
                Architecting high-throughput RESTful APIs, distributed microservices, authentication & authorization pipelines, background job queues, and schema design on PostgreSQL, MongoDB, and Redis.
              </p>
              <div className={styles.cardTags}>
                <span className={styles.tag}>Node.js</span>
                <span className={styles.tag}>NestJS</span>
                <span className={styles.tag}>Python/FastAPI</span>
                <span className={styles.tag}>PostgreSQL</span>
                <span className={styles.tag}>Redis</span>
              </div>
            </article>

            <article className={styles.bentoCard}>
              <div className={styles.iconBadge}>
                <LuAppWindow />
              </div>
              <h3 className={styles.cardTitle}>Full-Stack Web & Mobile Systems</h3>
              <p className={styles.cardText}>
                Developing responsive, state-managed web applications with React and Next.js, as well as cross-platform, offline-first mobile products built with React Native.
              </p>
              <div className={styles.cardTags}>
                <span className={styles.tag}>React</span>
                <span className={styles.tag}>Next.js</span>
                <span className={styles.tag}>React Native</span>
                <span className={styles.tag}>TypeScript</span>
                <span className={styles.tag}>Tailwind CSS</span>
              </div>
            </article>

            <article className={styles.bentoCard}>
              <div className={styles.iconBadge}>
                <LuBrain />
              </div>
              <h3 className={styles.cardTitle}>Applied AI & Speech Recognition</h3>
              <p className={styles.cardText}>
                Fine-tuning automatic speech recognition models with OpenAI Whisper for Bangla and English, local LLM voice assistants, and deep learning speech emotion recognition (undergraduate thesis).
              </p>
              <div className={styles.cardTags}>
                <span className={styles.tag}>Whisper</span>
                <span className={styles.tag}>PyTorch</span>
                <span className={styles.tag}>Hugging Face</span>
                <span className={styles.tag}>ASR Fine-tuning</span>
                <span className={styles.tag}>LLM Agents</span>
              </div>
            </article>

            <article className={styles.bentoCard}>
              <div className={styles.iconBadge}>
                <LuContainer />
              </div>
              <h3 className={styles.cardTitle}>DevOps, Cloud & Infrastructure</h3>
              <p className={styles.cardText}>
                Containerization with Docker, Linux server hardening, Nginx reverse proxy configurations, PM2 process management, and CI/CD automation for zero-downtime deployments.
              </p>
              <div className={styles.cardTags}>
                <span className={styles.tag}>Docker</span>
                <span className={styles.tag}>Linux/Ubuntu</span>
                <span className={styles.tag}>Nginx</span>
                <span className={styles.tag}>CI/CD</span>
                <span className={styles.tag}>Cloudflare</span>
              </div>
            </article>
          </div>

          {/* ===============================================================
              3. ENGINEERING PHILOSOPHY (CARDS INSTEAD OF BULLETS)
              =============================================================== */}
          <div className={styles.principlesSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowBar} aria-hidden="true" />
                <span className={styles.eyebrowText}>METHODOLOGY</span>
              </div>
              <h2 className={styles.sectionTitle}>Engineering Principles</h2>
              <p className={styles.sectionSubtitle}>
                The practical standards guiding every line of code, architecture decision, and system design.
              </p>
            </div>

            <div className={styles.principlesGrid}>
              <div className={styles.principleCard}>
                <div className={styles.principleIconWrapper}>
                  <LuZap />
                </div>
                <h3 className={styles.principleTitle}>Root-Cause First</h3>
                <p className={styles.principleText}>
                  Find the fundamental root cause before touching code. Back architectural decisions with verifiable benchmarks, metrics, and automated regression tests.
                </p>
              </div>

              <div className={styles.principleCard}>
                <div className={styles.principleIconWrapper}>
                  <LuCpu />
                </div>
                <h3 className={styles.principleTitle}>Simplicity Over Complexity</h3>
                <p className={styles.principleText}>
                  Prefer the simplest design that cleanly scales. Avoid unnecessary architectural abstractions that add maintenance burden without tangible benefit.
                </p>
              </div>

              <div className={styles.principleCard}>
                <div className={styles.principleIconWrapper}>
                  <LuShieldCheck />
                </div>
                <h3 className={styles.principleTitle}>Production-Grade Reliability</h3>
                <p className={styles.principleText}>
                  Maintainability, security, type safety, and observability are core deliverables from day one — not follow-up tickets.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===============================================================
            4. LIVE DYNAMIC EXPERIENCE (HOMEPAGE COMPONENT)
            =============================================================== */}
        <Suspense fallback={null}>
          <Experience data={portfolioData?.Experiences} />
        </Suspense>

        {/* ===============================================================
            5. LIVE DYNAMIC EDUCATION (HOMEPAGE COMPONENT)
            =============================================================== */}
        <Suspense fallback={null}>
          <Educations data={portfolioData?.Educations} />
        </Suspense>

        {/* ===============================================================
            6. CALL TO ACTION BOX
            =============================================================== */}
        <div className="container">
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>Let's Build Something Exceptional</h2>
            <p className={styles.ctaText}>
              Interested in discussing distributed architectures, full-stack systems, or applied AI? Let's connect and explore how we can collaborate.
            </p>
            <div className={styles.heroActions}>
              <Link href="/contact/" className={styles.btnPrimary}>
                Send a Message
                <LuArrowUpRight />
              </Link>
              <Link href="/projects/" className={styles.btnSecondary}>
                Explore Projects
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
