/**
 * Long-form case-study content for project detail pages.
 *
 * Keyed by project slug (see slug.mjs), kept in code rather than MongoDB so
 * the content is version-controlled and independent of the CMS rows.
 *
 * WHY THIS EXISTS: a detail page that only repeats the one-line card text is
 * ~100 words — Google classifies such pages as thin ("Crawled – currently not
 * indexed"), and they can never rank for the technical queries a project
 * should attract. Only projects with an entry here are indexable and listed
 * in the sitemap; the rest still render, but with `noindex`.
 *
 * CONTENT RULE: every statement must be verifiable from the project's public
 * repository/README. No invented metrics, users or outcomes. Design targets
 * are described as targets, not as measured results.
 */

export const CASE_STUDIES = {
  linklens: {
    title: "LinkLens — Smart Redirect & Link Analytics Engine",
    headline: "LinkLens — self-hosted link intelligence and smart redirect engine",
    summary:
      "LinkLens is a self-hosted link management and redirect platform built with NestJS, Redis, ClickHouse and Next.js, separating a fast redirect path from asynchronous analytics.",
    keywords: [
      "URL shortener",
      "smart redirects",
      "NestJS",
      "Redis",
      "ClickHouse",
      "BullMQ",
      "link analytics",
    ],
    problem: [
      "Typical URL shorteners resolve every click against a transactional relational database and call paid third-party APIs for geolocation. Both become the bottleneck — in latency and in cost — as click volume grows.",
      "LinkLens was designed so that the redirect itself never waits on the database or on analytics, and so that geo/device enrichment costs nothing per request.",
    ],
    approach: [
      "Hot path: link rules are resolved from Redis by the NestJS redirect engine, without querying PostgreSQL. The design target for this path is a single-digit-millisecond redirect.",
      "Cold path: each click is published to a BullMQ queue; a worker pool enriches it and stream-inserts it into ClickHouse, a columnar store suited to large analytical aggregations.",
      "Geo and device data come from local MaxMind .mmdb datasets and ua-parser-js evaluated in memory, so there is no recurring external lookup cost.",
      "Custom domains get TLS automatically: Caddy issues certificates on demand after validating the domain through a backend webhook, without server restarts.",
    ],
    features: [
      "Rule-based routing by country, OS, browser, language or weighted A/B split.",
      "Analytics dashboards on ClickHouse aggregations, with UTM attribution and a live WebSocket activity feed.",
      "Workspace isolation with OWNER, ADMIN, MANAGER and ANALYST roles (RBAC).",
      "REST API documented with OpenAPI 3.0, SHA-256-hashed API keys with rotation, and HMAC-SHA256-signed webhooks.",
      "A GDPR mode that truncates IP addresses before they are persisted.",
      "SVG/PNG/PDF QR-code generation with logo overlays and styling.",
    ],
    decisions: [
      "Split read path and write path: the redirect response never depends on analytics writes succeeding.",
      "Columnar storage (ClickHouse MergeTree ordered by workspace, link and month, with a 365-day TTL) for click telemetry instead of the relational database.",
      "Self-hosted enrichment data instead of a paid geo API, trading periodic dataset updates for zero per-request cost.",
    ],
    stackGroups: {
      Backend: ["NestJS", "TypeScript", "Passport.js (JWT/OAuth)", "BullMQ"],
      Data: ["PostgreSQL 16 (Prisma)", "Redis 7", "ClickHouse 24"],
      Frontend: ["Next.js 14 (App Router)", "React 18", "Tailwind CSS", "TanStack Query", "Zustand", "Recharts"],
      Infrastructure: ["Docker Compose", "Caddy 2 (on-demand TLS)"],
    },
  },

  "bangla-and-english-asr-studio": {
    title: "Bangla & English ASR with Whisper Fine-Tuning",
    headline: "Bangla & English ASR Studio — Whisper transcription, evaluation and fine-tuning",
    summary:
      "A local-first speech-to-text studio and Whisper fine-tuning pipeline for Bangla and English: transcription UI, batch jobs, WER/CER benchmarking and guarded LoRA training.",
    keywords: [
      "Bangla speech recognition",
      "Bengali ASR",
      "Whisper fine-tuning",
      "faster-whisper",
      "LoRA",
      "WER",
      "CER",
    ],
    problem: [
      "Off-the-shelf Whisper models work well in general, but production Bangla and mixed Bangla/English (Banglish) audio raises practical problems: Bangla can be misdetected as another Indic language, and mixed-language speech needs controlled decoding and repeatable evaluation.",
      "Fine-tuning without a fixed baseline creates a grey area — there is no evidence that the new model is actually better than the one it replaces.",
    ],
    approach: [
      "A React operator UI for microphone and file transcription, batch jobs, benchmarks, diagnostics and training controls.",
      "A FastAPI backend that handles model loading, audio normalisation, job tracking, exports, evaluation and training subprocesses.",
      "CLI scripts for the same operations, so GPU servers and automation do not depend on the UI.",
      "Docker Compose stacks for CPU, development with hot reload, and an NVIDIA GPU override.",
    ],
    features: [
      "Benchmarking against ground-truth metadata with word error rate (WER) and character error rate (CER), plus per-sample predictions.",
      "Bangla/English decoding profiles and post-processing guards.",
      "Training and evaluation directly from Parquet datasets (e.g. SUBAK.KO from Hugging Face) without extracting every clip to WAV, including a streaming mode.",
      "LoRA/QLoRA fine-tuning of Whisper, training small adapter layers instead of all model weights.",
      "Resumable segmented dataset downloads and a persistent model cache that survives container rebuilds.",
    ],
    decisions: [
      "Guarded training workflow: back up the current model, evaluate it on a fixed held-out test set, train, evaluate the new model on the same set, then write a side-by-side comparison with confusion analysis.",
      "The pipeline never auto-replaces the production model. The comparison reports a verdict (new better, old better, or mixed metrics) and the final decision stays manual.",
      "The test split is kept fixed and untouched so old-vs-new comparisons stay fair.",
    ],
    stackGroups: {
      "Speech & ML": ["Whisper", "faster-whisper", "Hugging Face Transformers", "LoRA / QLoRA", "PyTorch"],
      Backend: ["Python", "FastAPI", "FFmpeg"],
      Frontend: ["React", "Vite"],
      Infrastructure: ["Docker Compose", "NVIDIA CUDA (GPU override)"],
    },
  },

  "local-vocal-agent": {
    title: "Local Vocal Agent — Local AI Voice Assistant",
    headline: "Local Vocal Agent — a privacy-first local AI voice assistant",
    summary:
      "A full-stack voice assistant that runs locally: FastAPI and React, an Ollama-hosted LLM, speech-to-text and text-to-speech, and SQLite plus Chroma memory.",
    keywords: [
      "local AI assistant",
      "voice assistant",
      "Ollama",
      "RAG",
      "FastAPI",
      "Whisper",
      "ChromaDB",
    ],
    problem: [
      "Most voice assistants send audio and conversation history to a cloud service. Local Vocal Agent keeps the language model, speech pipeline and memory on the user's own machine.",
    ],
    approach: [
      "FastAPI backend exposing versioned endpoints for text chat, voice chat, sessions, user profile and system status/metrics.",
      "React + Vite frontend for the chat and voice workspace.",
      "LLM inference through Ollama; speech-to-text with Faster Whisper and a text-to-speech stage for spoken replies.",
      "Two memory layers: SQLite for sessions and messages, and Chroma as a vector store for retrieval.",
      "Internet search support with a configurable provider (Google News RSS by default, DuckDuckGo as an alternative) and an automatic fallback when a provider returns nothing.",
    ],
    features: [
      "Streaming chat and voice-chat endpoints.",
      "Session history and per-session message retrieval.",
      "System metrics and status endpoints for the running stack.",
      "A CI check that keeps the CI requirements file in sync with the full requirements.",
    ],
    decisions: [
      "Local-first by design: models run under Ollama on the host instead of a hosted API.",
      "Search providers are pluggable through configuration, so the assistant degrades gracefully when one source fails.",
    ],
    stackGroups: {
      "AI": ["Ollama", "Faster Whisper (STT)", "TTS", "ChromaDB (vector memory)", "RAG"],
      Backend: ["Python", "FastAPI", "SQLite"],
      Frontend: ["React", "Vite"],
    },
  },

  "advanced-finance-tracker": {
    title: "Offline-First Finance App (React Native + NestJS)",
    headline: "Advanced Finance Tracker — offline-first personal finance app",
    summary:
      "An offline-first personal finance app built with Expo React Native and SQLite on the device, plus a NestJS and PostgreSQL API for multi-device sync.",
    keywords: [
      "offline-first",
      "React Native",
      "Expo",
      "SQLite",
      "NestJS",
      "data sync",
      "personal finance app",
    ],
    problem: [
      "Most finance apps keep the user's ledger only in the cloud, so the app is slow without a connection and the data depends on a remote server.",
      "Advanced Finance Tracker keeps the ledger on the phone and treats the cloud as an optional sync target.",
    ],
    approach: [
      "Mobile client in React Native with Expo and Expo Router, storing every record in an embedded SQLite database with schema migrations.",
      "NestJS API with Prisma and PostgreSQL acting as the sync engine for multiple devices, with offline change queuing.",
      "pnpm monorepo with shared packages for TypeScript types, Zod validation schemas, a typed API client and configuration.",
    ],
    features: [
      "Accounts (bank, cash, cards, savings), multi-currency balances and transfers between accounts.",
      "Income/expense ledger with recurring rules, budgets per category and savings goals.",
      "Lending and borrowing tracking.",
      "Scoped soft-deletion (month, year or all-time) that propagates through sync.",
    ],
    decisions: [
      "Money is handled as integer/scaled-decimal strings rather than floating point, so totals never accumulate rounding errors.",
      "Deletions are soft-delete tombstones (deleted_at) that sync to the server, so a record deleted on one device cannot be resurrected by another device's sync.",
      "Parameterised SQL everywhere on the device database.",
    ],
    stackGroups: {
      Mobile: ["React Native", "Expo", "Expo Router", "TypeScript", "SQLite (expo-sqlite)"],
      Backend: ["NestJS", "Prisma", "PostgreSQL", "Redis"],
      Tooling: ["pnpm workspaces", "Zod", "Jest", "ESLint"],
    },
  },
};

/** Case study for a slug, or null. */
export function caseStudyFor(slug) {
  return (slug && CASE_STUDIES[slug]) || null;
}
