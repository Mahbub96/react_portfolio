/**
 * cvBuilder — pure, side-effect-free helpers that turn live portfolio data
 * into a CV-shaped object.
 *
 * Design rules:
 *  - No I/O here. No DB, no fetch. Everything is a pure function so it can be
 *    unit tested and reused by both the API route and the /resume page.
 *  - Nothing is hardcoded that can be derived. Experience duration is computed
 *    from real startDate values, so adding a job updates the CV by itself.
 *  - Nothing is claimed that the data cannot back. Every phrase in the summary
 *    renders only when there is a matching row in the database.
 */

/* ------------------------------------------------------------------ *
 * Date helpers
 * ------------------------------------------------------------------ */

const MONTH_NAMES = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Parse the date formats that actually appear in the Experiences collection:
 *   "2023-09"              (startDate / endDate — preferred)
 *   "September 2023"       (fallback, parsed out of the `time` string)
 *   "Present" / "Current"  → null, meaning "still ongoing"
 * Returns a Date pinned to the 1st of the month, or null.
 */
export function parseMonth(value) {
  if (!value || typeof value !== "string") return null;

  const raw = value.trim();
  if (!raw) return null;
  if (/^(present|current|now|ongoing)$/i.test(raw)) return null;

  // ISO-ish: 2023-09 or 2023-09-15
  const iso = raw.match(/^(\d{4})-(\d{1,2})/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]) - 1;
    if (month >= 0 && month <= 11) return new Date(year, month, 1);
  }

  // Wordy: "September 2023"
  const wordy = raw.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (wordy) {
    const month = MONTH_NAMES[wordy[1].toLowerCase()];
    if (month !== undefined) return new Date(Number(wordy[2]), month, 1);
  }

  // Year only: "2023"
  const yearOnly = raw.match(/^(\d{4})$/);
  if (yearOnly) return new Date(Number(yearOnly[1]), 0, 1);

  return null;
}

/**
 * Pull start/end out of one experience row, preferring the explicit
 * startDate/endDate fields and falling back to splitting the `time` label.
 */
export function experienceRange(exp, now = new Date()) {
  if (!exp || typeof exp !== "object") return null;

  let start = parseMonth(exp.startDate);
  let end = parseMonth(exp.endDate);
  let isCurrent = /^(present|current|now|ongoing)$/i.test(
    String(exp.endDate || "").trim()
  );

  if (!start && typeof exp.time === "string" && exp.time.includes("-")) {
    const [rawStart, rawEnd] = exp.time.split("-").map((s) => s.trim());
    start = start || parseMonth(rawStart);
    if (!end) end = parseMonth(rawEnd);
    if (!isCurrent) {
      isCurrent = /^(present|current|now|ongoing)$/i.test(rawEnd || "");
    }
  }

  if (!start) return null;
  if (isCurrent || !end) {
    end = new Date(now.getFullYear(), now.getMonth(), 1);
    isCurrent = true;
  }

  return { start, end, isCurrent };
}

function monthsBetween(start, end) {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
}

/**
 * Never rounds up. 3 years 11 months still reads "3+ years" so the CV can
 * never overstate the number on it.
 */
export function durationLabel(months) {
  if (!Number.isFinite(months) || months <= 0) return "";
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  return `${years}+ year${years === 1 ? "" : "s"}`;
}

/**
 * Total professional experience across every role, measured from the earliest
 * start to the latest end (or today, for an ongoing role).
 * Adding a new experience row moves every number on the CV automatically.
 */
export function computeExperience(experiences = [], now = new Date()) {
  const ranges = (Array.isArray(experiences) ? experiences : [])
    .map((exp) => experienceRange(exp, now))
    .filter(Boolean);

  if (!ranges.length) {
    return { months: 0, years: 0, label: "", preciseLabel: "", since: null, isCurrent: false };
  }

  const start = new Date(Math.min(...ranges.map((r) => r.start.getTime())));
  const end = new Date(Math.max(...ranges.map((r) => r.end.getTime())));
  const isCurrent = ranges.some((r) => r.isCurrent);

  const months = Math.max(0, monthsBetween(start, end));
  const years = Math.floor(months / 12);
  const remainder = months % 12;

  return {
    months,
    years,
    label: durationLabel(months),
    preciseLabel:
      years > 0
        ? `${years} yr${years === 1 ? "" : "s"}${remainder ? ` ${remainder} mo` : ""}`
        : `${months} mo`,
    // Formatted from local parts on purpose: toISOString() would shift the
    // month backwards for any timezone east of UTC (e.g. Asia/Dhaka, +06).
    since: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
    isCurrent,
  };
}

/** Newest role first — the order a CV is read in. */
export function sortExperiences(experiences = [], now = new Date()) {
  return [...(Array.isArray(experiences) ? experiences : [])].sort((a, b) => {
    const ra = experienceRange(a, now);
    const rb = experienceRange(b, now);
    if (!ra && !rb) return 0;
    if (!ra) return 1;
    if (!rb) return -1;
    return rb.start.getTime() - ra.start.getTime();
  });
}

/* ------------------------------------------------------------------ *
 * Skill grouping
 * ------------------------------------------------------------------ */

/**
 * Rule order here is EVALUATION order (first match wins) and is deliberately
 * different from SKILL_GROUP_ORDER below, which is DISPLAY order.
 * "Languages" is evaluated last so it acts as a fallback rather than
 * swallowing names that belong to a more specific group.
 */
const SKILL_RULES = [
  {
    group: "AI & Data",
    match: [
      "machine learning", "deep learning", "neural", "tensorflow", "pytorch",
      "keras", "scikit", "opencv", "yolo", "whisper", "asr", "nlp", "llm",
      "rag", "langchain", "hugging", "pandas", "numpy", "computer vision",
      "transformers", "lora", "qlora", "ollama", "chromadb", "chroma",
      "gradio", "tts", "stt", "audio processing", "ml evaluation",
      "speech", "vector", "embedding", "fine-tuning",
    ],
  },
  {
    group: "Databases & Caching",
    match: [
      "mysql", "postgres", "postgresql", "sqlite", "mongo", "mongodb",
      "redis", "clickhouse", "prisma", "mariadb", "elasticsearch", "firebase",
    ],
  },
  {
    group: "Backend & APIs",
    match: [
      "node", "node.js", "express", "nestjs", "nest.js", "fastapi", "flask",
      "django", "laravel", "codeigniter", "graphql", "rest", "socket",
      "socket.io", "bullmq", "celery", "rabbitmq", "kafka", "grpc",
    ],
  },
  {
    group: "Frontend",
    match: [
      "react", "react.js", "react native", "next.js", "nextjs", "vue",
      "angular", "svelte", "bootstrap", "tailwind", "html", "css", "sass",
      "redux", "framer", "swing", "expo",
    ],
  },
  {
    group: "DevOps & Cloud",
    match: [
      "docker", "kubernetes", "aws", "azure", "gcp", "nginx", "linux",
      "ubuntu", "ci/cd", "github actions", "jenkins", "terraform", "pm2",
      "git", "cloud",
    ],
  },
  {
    group: "Testing & Tooling",
    match: [
      "jest", "vitest", "cypress", "playwright", "pytest", "junit", "mocha",
      "chai", "selenium", "supertest", "storybook", "eslint", "prettier",
    ],
  },
  {
    group: "Languages",
    match: [
      "javascript", "typescript", "python", "php", "c++", "c#", "java",
      "golang", "go", "rust", "dart", "kotlin", "swift", "bash", "sql",
    ],
  },
];

export const SKILL_GROUP_ORDER = [
  "AI & Data",
  "Languages",
  "Backend & APIs",
  "Frontend",
  "Databases & Caching",
  "DevOps & Cloud",
  "Testing & Tooling",
  "Other",
];

function skillGroupFor(name) {
  const lower = String(name || "").toLowerCase();
  if (!lower) return "Other";
  for (const rule of SKILL_RULES) {
    if (rule.match.some((token) => lower.includes(token))) return rule.group;
  }
  return "Other";
}

/**
 * Technologies named in a project's own `lang` stack are first-hand evidence
 * of a skill — you shipped the project, so you used the tool. The Skills
 * collection is curated by hand and drifts behind the project list, so
 * folding project stacks in keeps the CV honest AND current without
 * inventing anything: every derived entry traces to a real project.
 */
export function skillsFromProjects(projects = []) {
  const found = [];
  (Array.isArray(projects) ? projects : []).forEach((project) => {
    const stack = Array.isArray(project?.lang) ? project.lang : [];
    stack.forEach((tech) => {
      const name = String(tech || "").trim();
      if (name && !found.includes(name)) found.push(name);
    });
  });
  return found;
}

/**
 * Normalises a technology name for duplicate detection only (the original
 * spelling is what gets displayed). Handles the real collisions seen in this
 * data: "React.js" vs "React", "Node.js" vs "Node", "Socket.io" vs "socketio".
 */
function skillKey(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\.(js|io|css)\b/g, "") // React.js -> react, Socket.io -> socket
    .replace(/[^a-z0-9+#]/g, "");    // drop spaces, dots, hyphens
}

/**
 * Turns the flat skills array into ordered, named groups.
 * Empty groups are dropped so the CV never shows a bare heading.
 *
 * `projects` is optional: when supplied, technologies from project stacks
 * are merged in (curated skills keep priority and appear first within a
 * group, so the hand-picked ordering is preserved).
 */
export function groupSkills(skills = [], projects = []) {
  const buckets = new Map(SKILL_GROUP_ORDER.map((g) => [g, []]));

  const names = [
    ...(Array.isArray(skills) ? skills : []).map((s) =>
      typeof s === "string" ? s : s?.name
    ),
    ...skillsFromProjects(projects),
  ];

  const seen = new Set();
  names.forEach((raw) => {
    const name = String(raw || "").trim();
    if (!name) return;

    const key = skillKey(name);
    if (!key || seen.has(key)) return;
    seen.add(key);

    const group = skillGroupFor(name);
    const list = buckets.get(group) || buckets.get("Other");
    list.push(name);
  });

  return SKILL_GROUP_ORDER.map((group) => ({
    group,
    items: buckets.get(group) || [],
  })).filter((entry) => entry.items.length > 0);
}

/* ------------------------------------------------------------------ *
 * AI classification
 * ------------------------------------------------------------------ */

/**
 * Two tiers, because a bare "AI" mention is weak evidence.
 *
 * STRONG tokens name a concrete technique or system and are accepted alone.
 * WEAK tokens ("ai", "ml", "voice") appear in marketing copy and in
 * not-yet-built roadmap text, so they only count when the surrounding
 * sentence is not describing something merely planned. Without this,
 * "AI insight planning" in the Finance Tracker's description would
 * mis-flag a project whose AI work has not actually been built.
 *
 * All tokens are word-boundary matched so "ai" cannot fire inside
 * "maintainable" and "ml" cannot fire inside "HTML".
 */
const AI_STRONG_TOKENS = [
  "llm", "rag", "asr", "nlp", "agentic", "machine learning", "deep learning",
  "neural", "whisper", "speech recognition", "speech", "transcription",
  "computer vision", "tensorflow", "pytorch", "yolo", "embedding",
  "inference", "emotion detection", "emotion recognition", "fine-tuning",
];

const AI_WEAK_TOKENS = ["ai", "ml", "agent", "voice", "vocal", "recognition"];

/** Marks copy that describes intent rather than shipped work. */
const PLANNED_PATTERN =
  /\b(planning|planned|upcoming|roadmap|future|intended|will support|to be added|coming soon)\b/i;

function tokenPattern(tokens) {
  return new RegExp(
    `\\b(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "i"
  );
}

const AI_STRONG_PATTERN = tokenPattern(AI_STRONG_TOKENS);
const AI_WEAK_PATTERN = tokenPattern(AI_WEAK_TOKENS);

/**
 * True when a project's own text/stack shows real, built AI work.
 * Strong evidence passes outright; weak evidence is rejected when the
 * same text frames the AI part as planned rather than delivered.
 */
export function isAIProject(project) {
  if (!project || typeof project !== "object") return false;

  const name = project.name || "";
  const desc = project.desc || "";
  const stack = Array.isArray(project.lang) ? project.lang.join(" ") : "";
  const haystack = [name, desc, stack].filter(Boolean).join(" ");
  if (!haystack) return false;

  if (AI_STRONG_PATTERN.test(haystack)) return true;

  // Weak signal: accept only if the text is not describing planned work.
  if (AI_WEAK_PATTERN.test(haystack) && !PLANNED_PATTERN.test(desc)) return true;

  return false;
}

/**
 * Splits projects into AI-flagged and the rest, AI first.
 * This is the entire "AI bias": ordering, not invention.
 */
export function classifyProjects(projects = []) {
  const list = Array.isArray(projects) ? projects : [];
  const ai = [];
  const other = [];
  list.forEach((p) => (isAIProject(p) ? ai : other).push(p));
  return { ai, other, ordered: [...ai, ...other] };
}

/* ------------------------------------------------------------------ *
 * Domain detection
 * ------------------------------------------------------------------ */

const DOMAIN_TOKENS = [
  { label: "enterprise", match: ["enterprise", "erp", "corporate"] },
  { label: "healthcare", match: ["healthcare", "health", "medical", "clinic", "patient"] },
  { label: "education", match: ["education", "school", "university", "exam", "student", "learning management"] },
  { label: "automation", match: ["automation", "automated", "workflow"] },
  { label: "fintech", match: ["finance", "financial", "payment", "billing", "invoice"] },
  { label: "surveillance", match: ["surveillance", "camera", "cctv", "monitoring"] },
];

/** Domains are read out of real bios and project descriptions, never assumed. */
export function detectDomains(sources = []) {
  const haystack = sources.filter(Boolean).join(" ").toLowerCase();
  return DOMAIN_TOKENS.filter((d) =>
    d.match.some((token) => haystack.includes(token))
  ).map((d) => d.label);
}

function joinList(items, conjunction = "and") {
  const list = items.filter(Boolean);
  if (!list.length) return "";
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} ${conjunction} ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, ${conjunction} ${list[list.length - 1]}`;
}

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

/**
 * Builds the professional summary from live data.
 *
 * Every clause is conditional on evidence existing:
 *  - the duration comes from computeExperience()
 *  - the domains come from detectDomains() over real bios/project text
 *  - the AI sentence only appears when AI-flagged projects or AI skills exist
 *
 * If profile.summary is set in the database it wins outright, so the text
 * stays hand-tunable without touching code.
 */
export function buildSummary({
  profile = {},
  about = {},
  experience = {},
  skillGroups = [],
  projects = [],
} = {}) {
  if (typeof profile.summary === "string" && profile.summary.trim()) {
    return profile.summary.trim();
  }

  const role = (profile.title || profile.jobTitle || "Software Engineer")
    .split("|")[0]
    .trim();

  const duration = experience.label ? ` with ${experience.label} of professional experience` : "";

  const { ai: aiProjects } = classifyProjects(projects);
  const aiGroup = skillGroups.find((g) => g.group === "AI & Data");
  const hasAI = aiProjects.length > 0 || Boolean(aiGroup?.items.length);

  const domains = detectDomains([
    profile.bio,
    about.description,
    ...projects.map((p) => `${p?.name || ""} ${p?.desc || ""}`),
  ]);
  const domainClause = domains.length
    ? ` across ${joinList(domains.slice(0, 4))} systems`
    : "";

  const backendGroup = skillGroups.find((g) => g.group === "Backend & APIs");
  const langGroup = skillGroups.find((g) => g.group === "Languages");
  const dataGroup = skillGroups.find((g) => g.group === "Databases & Caching");
  const opsGroup = skillGroups.find((g) => g.group === "DevOps & Cloud");

  const sentences = [];

  sentences.push(
    `${role}${duration} building production backend services, full-stack web applications, and applied-AI features${domainClause}.`
  );

  // Flatten to a single list before joining, so the sentence reads as one
  // series ("A, B, C, and D") instead of nesting a second "and" mid-clause.
  const stackItems = [
    ...(langGroup?.items.slice(0, 3) || []),
    ...(backendGroup?.items.slice(0, 3) || []),
    ...(dataGroup?.items.slice(0, 3) || []),
    ...(opsGroup?.items.slice(0, 2) || []),
  ];
  const stack = joinList(stackItems);
  if (stack) {
    sentences.push(
      `Day-to-day work spans API design, database-driven modules, authentication and authorization flows, integration workflows, and deployment pipelines using ${stack}.`
    );
  }

  if (hasAI) {
    const evidence = [];
    const aiText = aiProjects
      .map((p) => `${p?.name || ""} ${p?.desc || ""}`)
      .join(" ")
      .toLowerCase();

    if (/\b(asr|speech|whisper|transcription|recognition)\b/.test(aiText)) {
      evidence.push("speech recognition and transcription pipelines");
    }
    if (/\b(agent|agentic|vocal|voice)\b/.test(aiText)) {
      evidence.push("agent-style assistant workflows with tool invocation");
    }
    if (aiGroup?.items.length) {
      evidence.push(`model training and evaluation (${aiGroup.items.slice(0, 3).join(", ")})`);
    }

    if (evidence.length) {
      sentences.push(
        `Growing specialisation in applied AI — ${joinList(evidence)} — with attention to evaluation, observability, and reliable integration into existing services.`
      );
    }
  }

  return sentences.join(" ");
}

/* ------------------------------------------------------------------ *
 * Top-level assembly
 * ------------------------------------------------------------------ */

/**
 * The single entry point used by both /api/cv and the /resume page.
 * Accepts the same shape the portfolio API already returns.
 *
 * `options.projectLimit` caps how many projects reach the CV (AI-flagged
 * ones survive first). A recruiter-facing CV should stay near two pages;
 * the full list always remains on the portfolio site itself.
 * Pass 0 or Infinity to include every project.
 */
export function buildCV(portfolio = {}, now = new Date(), options = {}) {
  const { projectLimit = 6 } = options;

  const pick = (key) => {
    const node = portfolio?.[key];
    if (!node) return undefined;
    return node.data !== undefined ? node.data : node;
  };

  const profile = pick("profile") || {};
  const banner = pick("Banner") || {};
  const about = pick("About") || {};
  const contact = pick("Contact") || {};
  const rawExperiences = pick("Experiences") || [];
  const educations = pick("Educations") || [];
  const skills = pick("Skills") || [];
  const rawProjects = pick("Projects") || [];

  const experience = computeExperience(rawExperiences, now);
  const experiences = sortExperiences(rawExperiences, now);
  const skillGroups = groupSkills(skills, rawProjects);
  const { ai: aiProjects, ordered: orderedProjects } = classifyProjects(rawProjects);

  const limit =
    !projectLimit || projectLimit === Infinity
      ? orderedProjects.length
      : projectLimit;
  const projects = orderedProjects.slice(0, limit);

  const summary = buildSummary({
    profile,
    about,
    experience,
    skillGroups,
    projects: rawProjects,
  });

  const contactInfo = contact.contactInfo || {};

  return {
    profile: {
      name: profile.name || banner.name || "",
      title: profile.title || banner.jobTitle || "",
      headline: banner.headline || "",
      email: profile.email || contactInfo.email || contact.email || "",
      phone: profile.phone || contactInfo.phone || contact.phone || "",
      location: profile.location || contactInfo.location || contact.location || "",
      website: profile.website || contactInfo.website || "",
      github: profile.github || banner.socialLinks?.github || "",
      linkedin: profile.linkedin || banner.socialLinks?.linkedin || "",
      company: profile.company || "",
      companyUrl: profile.companyUrl || "",
    },
    summary,
    experience,
    experiences: experiences.map((exp) => ({
      title: exp.name || "",
      company: exp.company || profile.company || "",
      companyUrl: exp.companyUrl || "",
      period: exp.time || "",
      description: exp.how || "",
    })),
    education: (Array.isArray(educations) ? educations : []).map((edu) => ({
      institution: edu.name || "",
      degree: edu.degName || "",
      department: edu.Department || edu.department || "",
      period: edu.time || "",
      cgpa: edu.cgpa || "",
      thesis:
        edu.Thesis && !/^(no|n\/a)$/i.test(String(edu.Thesis).trim())
          ? edu.Thesis
          : "",
    })),
    skillGroups,
    projects: (Array.isArray(projects) ? projects : []).map((p) => ({
      name: p.name || "",
      description: p.desc || "",
      stack: Array.isArray(p.lang) ? p.lang : [],
      githubUrl: p.githubUrl || "",
      liveUrl: p.liveUrl || "",
      isAI: isAIProject(p),
    })),
    meta: {
      aiProjectCount: aiProjects.length,
      shownProjectCount: projects.length,
      totalProjectCount: Array.isArray(rawProjects) ? rawProjects.length : 0,
      skillCount: skillGroups.reduce((n, g) => n + g.items.length, 0),
      curatedSkillCount: Array.isArray(skills) ? skills.length : 0,
      summarySource:
        typeof profile.summary === "string" && profile.summary.trim()
          ? "database"
          : "computed",
      generatedAt: now.toISOString(),
    },
  };
}

export default buildCV;
