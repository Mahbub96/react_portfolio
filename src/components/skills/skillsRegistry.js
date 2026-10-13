import {
  SiTypescript,
  SiJavascript,
  SiPython,
  SiPhp,
  SiCplusplus,
  SiC,
  SiNodedotjs,
  SiNestjs,
  SiExpress,
  SiReact,
  SiNextdotjs,
  SiLaravel,
  SiCodeigniter,
  SiAngular,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiRedis,
  SiSqlite,
  SiDocker,
  SiLinux,
  SiGit,
  SiFirebase,
  SiPytorch,
  SiHuggingface,
} from "react-icons/si";
import { FaJava } from "react-icons/fa6";
import {
  TbBrandReactNative,
  TbBrandOpenai,
  TbInfinity,
  TbApi,
  TbHierarchy3,
  TbCpu,
} from "react-icons/tb";
import {
  LuServer,
  LuAppWindow,
  LuBrain,
  LuCode,
  LuLayers,
  LuDatabase,
  LuMic,
  LuTerminal,
} from "react-icons/lu";

/** Map of icon identifiers to icon components and default brand colors */
export const ICON_MAP = {
  // Languages
  SiTypescript: { icon: SiTypescript, color: "#3178c6" },
  SiJavascript: { icon: SiJavascript, color: "#f7df1e" },
  SiPython: { icon: SiPython, color: "#3776ab" },
  SiPhp: { icon: SiPhp, color: "#777bb4" },
  SiCplusplus: { icon: SiCplusplus, color: "#00599c" },
  FaJava: { icon: FaJava, color: "#f89820" },
  SiC: { icon: SiC, color: "#a8b9cc" },

  // Frameworks & Libraries
  SiNodedotjs: { icon: SiNodedotjs, color: "#5fa04e" },
  SiNestjs: { icon: SiNestjs, color: "#ea2845" },
  SiExpress: { icon: SiExpress, color: "currentColor" },
  SiReact: { icon: SiReact, color: "#61dafb" },
  SiNextdotjs: { icon: SiNextdotjs, color: "currentColor" },
  SiLaravel: { icon: SiLaravel, color: "#ff2d20" },
  TbBrandReactNative: { icon: TbBrandReactNative, color: "#61dafb" },
  SiAngular: { icon: SiAngular, color: "#dd0031" },
  SiCodeigniter: { icon: SiCodeigniter, color: "#ee4623" },

  // Data & Infrastructure
  SiPostgresql: { icon: SiPostgresql, color: "#4169e1" },
  SiMysql: { icon: SiMysql, color: "#4479a1" },
  SiMongodb: { icon: SiMongodb, color: "#47a248" },
  SiRedis: { icon: SiRedis, color: "#dc382d" },
  SiSqlite: { icon: SiSqlite, color: "#38bdf8" },
  SiDocker: { icon: SiDocker, color: "#2496ed" },
  SiLinux: { icon: SiLinux, color: "#fcc624" },
  SiGit: { icon: SiGit, color: "#f05032" },
  SiFirebase: { icon: SiFirebase, color: "#ffca28" },

  // AI & Engineering
  SiPytorch: { icon: SiPytorch, color: "#ee4c2c" },
  TbBrandOpenai: { icon: TbBrandOpenai, color: "#10a37f" },
  SiHuggingface: { icon: SiHuggingface, color: "#ffd21e" },
  LuMic: { icon: LuMic, color: "#f59e0b" },
  TbHierarchy3: { icon: TbHierarchy3, color: "#06b6d4" },
  TbApi: { icon: TbApi, color: "#a855f7" },
  TbInfinity: { icon: TbInfinity, color: "#20c997" },

  // Capability Icons
  server: { icon: LuServer, color: "#38bdf8" },
  window: { icon: LuAppWindow, color: "#20c997" },
  brain: { icon: LuBrain, color: "#a855f7" },
  terminal: { icon: LuTerminal, color: "var(--accent-primary)" },
};

/** Name-based fallback lookup */
const NAME_TO_ICON_KEY = {
  javascript: "SiJavascript",
  typescript: "SiTypescript",
  python: "SiPython",
  php: "SiPhp",
  "c++": "SiCplusplus",
  c: "SiC",
  java: "FaJava",
  "java swing": "FaJava",
  "node.js": "SiNodedotjs",
  node: "SiNodedotjs",
  nestjs: "SiNestjs",
  express: "SiExpress",
  "express.js": "SiExpress",
  react: "SiReact",
  "react.js": "SiReact",
  next: "SiNextdotjs",
  "next.js": "SiNextdotjs",
  laravel: "SiLaravel",
  "react native": "TbBrandReactNative",
  angular: "SiAngular",
  angularjs: "SiAngular",
  codeigniter: "SiCodeigniter",
  postgresql: "SiPostgresql",
  mysql: "SiMysql",
  mongodb: "SiMongodb",
  redis: "SiRedis",
  sqlite: "SiSqlite",
  docker: "SiDocker",
  linux: "SiLinux",
  git: "SiGit",
  firebase: "SiFirebase",
  pytorch: "SiPytorch",
  whisper: "TbBrandOpenai",
  transformers: "SiHuggingface",
  "speech recognition": "LuMic",
  rag: "TbHierarchy3",
  "rest apis": "TbApi",
  "ci/cd": "TbInfinity",
};

/** Resolve icon and brand color dynamically for a skill record */
export function resolveSkillIcon(skill = {}) {
  const iconKey = skill.icon || NAME_TO_ICON_KEY[String(skill.name || "").toLowerCase().trim()];
  const match = ICON_MAP[iconKey] || ICON_MAP[skill.name];

  if (match) {
    return {
      Icon: match.icon,
      color: skill.color || match.color,
    };
  }

  // Graceful fallback icon
  return {
    Icon: LuCode,
    color: skill.color || "var(--accent-primary)",
  };
}

/** Resolve capability block icon dynamically */
export function resolveCapabilityIcon(iconKey = "") {
  const match = ICON_MAP[iconKey];
  return match ? match.Icon : LuServer;
}

/** Category metadata definitions */
export const CATEGORY_METADATA = {
  languages: {
    id: "languages",
    title: "Languages",
    description: "Programming languages I use to build applications and solve real-world problems.",
    icon: LuCode,
    accentColor: "#38bdf8",
  },
  frameworks: {
    id: "frameworks",
    title: "Frameworks & Libraries",
    description: "Frameworks and libraries I use to build modern, scalable and maintainable applications.",
    icon: LuLayers,
    accentColor: "#20c997",
  },
  "data-infra": {
    id: "data-infra",
    title: "Data & Infrastructure",
    description: "Databases, cloud and infrastructure tools for building and deploying reliable systems.",
    icon: LuDatabase,
    accentColor: "#3b82f6",
  },
  "ai-engineering": {
    id: "ai-engineering",
    title: "AI & Engineering",
    description: "Tools and technologies I use to build intelligent systems and improve developer productivity.",
    icon: TbCpu,
    accentColor: "#a855f7",
  },
};

/** Helper to categorize a skill by its database category string or name pattern */
export function normalizeSkillCategory(skill = {}) {
  const category = String(skill.category || "").toLowerCase();
  if (category.includes("language")) return "languages";
  if (category.includes("framework") || category.includes("librar")) return "frameworks";
  if (category.includes("data") || category.includes("infra") || category.includes("database")) return "data-infra";
  if (category.includes("ai") || category.includes("machine") || category.includes("engineer")) return "ai-engineering";

  // Fallback by name heuristics
  const name = String(skill.name || "").toLowerCase();
  if (/(typescript|javascript|python|php|c\+\+|java\b|c\b)/.test(name)) return "languages";
  if (/(node|nest|express|react|next|laravel|angular|codeigniter)/.test(name)) return "frameworks";
  if (/(postgres|mysql|mongo|redis|sqlite|docker|linux|git|firebase)/.test(name)) return "data-infra";
  if (/(pytorch|whisper|transformer|speech|rag|api|ci\/cd|learning)/.test(name)) return "ai-engineering";

  return "frameworks";
}
