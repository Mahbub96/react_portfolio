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
} from "react-icons/lu";

export const CORE_STRENGTHS = {
  eyebrow: "Core strengths",
  description:
    "The areas I focus on and have the deepest experience in, built through real projects and professional work.",
  blocks: [
    {
      id: "backend-apis",
      title: "Backend & APIs",
      description:
        "Building reliable backend services, APIs, and maintainable application architectures.",
      tech: "Node.js · NestJS · Express",
      icon: LuServer,
      accentColor: "#38bdf8",
      glowBg: "rgba(56, 189, 248, 0.12)",
    },
    {
      id: "fullstack",
      title: "Full-Stack Engineering",
      description:
        "Developing modern web applications with practical frontend and backend integration.",
      tech: "React · Next.js · TypeScript",
      icon: LuAppWindow,
      accentColor: "#20c997",
      glowBg: "rgba(32, 201, 151, 0.12)",
    },
    {
      id: "ai-ml",
      title: "Applied AI / ML",
      description:
        "Building intelligent systems with machine learning, deep learning, and speech technologies.",
      tech: "Python · PyTorch · Whisper",
      icon: LuBrain,
      accentColor: "#a855f7",
      glowBg: "rgba(168, 85, 247, 0.12)",
    },
  ],
  footerStatement: "Built through production work and hands-on projects.",
};

export const SKILL_CATEGORIES = [
  {
    id: "languages",
    title: "Languages",
    description:
      "Programming languages I use to build applications and solve real-world problems.",
    icon: LuCode,
    accentColor: "#38bdf8",
    skills: [
      { name: "TypeScript", icon: SiTypescript, color: "#3178c6" },
      { name: "JavaScript", icon: SiJavascript, color: "#f7df1e" },
      { name: "Python", icon: SiPython, color: "#3776ab" },
      { name: "PHP", icon: SiPhp, color: "#777bb4" },
      { name: "C++", icon: SiCplusplus, color: "#00599c" },
      { name: "Java", icon: FaJava, color: "#f89820" },
      { name: "C", icon: SiC, color: "#a8b9cc" },
    ],
  },
  {
    id: "frameworks",
    title: "Frameworks & Libraries",
    description:
      "Frameworks and libraries I use to build modern, scalable and maintainable applications.",
    icon: LuLayers,
    accentColor: "#20c997",
    skills: [
      { name: "Node.js", icon: SiNodedotjs, color: "#5fa04e" },
      { name: "NestJS", icon: SiNestjs, color: "#ea2845" },
      { name: "Express", icon: SiExpress, color: "currentColor" },
      { name: "React", icon: SiReact, color: "#61dafb" },
      { name: "Next.js", icon: SiNextdotjs, color: "currentColor" },
      { name: "Laravel", icon: SiLaravel, color: "#ff2d20" },
      { name: "React Native", icon: TbBrandReactNative, color: "#61dafb" },
      { name: "AngularJS", icon: SiAngular, color: "#dd0031" },
      { name: "CodeIgniter", icon: SiCodeigniter, color: "#ee4623" },
    ],
  },
  {
    id: "data-infra",
    title: "Data & Infrastructure",
    description:
      "Databases, cloud and infrastructure tools for building and deploying reliable systems.",
    icon: LuDatabase,
    accentColor: "#3b82f6",
    skills: [
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169e1" },
      { name: "MySQL", icon: SiMysql, color: "#4479a1" },
      { name: "MongoDB", icon: SiMongodb, color: "#47a248" },
      { name: "Redis", icon: SiRedis, color: "#dc382d" },
      { name: "SQLite", icon: SiSqlite, color: "#38bdf8" },
      { name: "Docker", icon: SiDocker, color: "#2496ed" },
      { name: "Linux", icon: SiLinux, color: "#fcc624" },
      { name: "Git", icon: SiGit, color: "#f05032" },
      { name: "Firebase", icon: SiFirebase, color: "#ffca28" },
    ],
  },
  {
    id: "ai-engineering",
    title: "AI & Engineering",
    description:
      "Tools and technologies I use to build intelligent systems and improve developer productivity.",
    icon: TbCpu,
    accentColor: "#a855f7",
    skills: [
      { name: "PyTorch", icon: SiPytorch, color: "#ee4c2c" },
      { name: "Whisper", icon: TbBrandOpenai, color: "#10a37f" },
      { name: "Transformers", icon: SiHuggingface, color: "#ffd21e" },
      { name: "Speech Recognition", icon: LuMic, color: "#f59e0b" },
      { name: "RAG", icon: TbHierarchy3, color: "#06b6d4" },
      { name: "REST APIs", icon: TbApi, color: "#a855f7" },
      { name: "CI/CD", icon: TbInfinity, color: "#20c997" },
    ],
  },
];
