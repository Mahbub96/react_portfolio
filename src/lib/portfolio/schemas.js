import { z } from "zod";

/**
 * Common base fields for all manageable collection items.
 */
export const BaseItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  published: z.boolean().default(true),
  order: z.number().int().nonnegative().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lastModifiedBy: z.string().optional(),
});

/**
 * Projects Schema
 */
export const ProjectSchema = BaseItemSchema.extend({
  name: z.string().trim().min(1, "Project name is required").max(200),
  desc: z.string().trim().min(1, "Description is required").max(2000),
  src: z.string().trim().default("/assets/img/projects.png"),
  lang: z
    .array(z.string().trim())
    .or(z.string().transform((val) => val.split(",").map((s) => s.trim()).filter(Boolean)))
    .default([]),
  githubUrl: z.string().trim().default(""),
  liveUrl: z.string().trim().default(""),
  downloadUrl: z.string().trim().default(""),
  slug: z.string().trim().optional(),
  featured: z.boolean().default(false),
});

/**
 * Skills Schema
 */
export const SKILL_CATEGORIES = [
  "Languages",
  "Frameworks & Libraries",
  "Data & Infrastructure",
  "AI & Engineering",
];

export const SkillSchema = BaseItemSchema.extend({
  name: z.string().trim().min(1, "Skill name is required").max(100),
  category: z.enum(SKILL_CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${SKILL_CATEGORIES.join(", ")}` }),
  }),
  icon: z.string().trim().default("SiJavascript"),
  color: z.string().trim().default("currentColor"),
  src: z.string().trim().default(""),
});

/**
 * Core Strengths Schema (Bento Grid)
 */
export const CoreStrengthSchema = BaseItemSchema.extend({
  title: z.string().trim().min(1, "Title is required").max(100),
  description: z.string().trim().min(1, "Description is required").max(500),
  tech: z.string().trim().min(1, "Technologies summary is required").max(200),
  icon: z.string().trim().min(1, "Icon identifier is required").default("code"),
  accentColor: z.string().trim().default("#38bdf8"),
  glowBg: z.string().trim().default("rgba(56, 189, 248, 0.12)"),
});

/**
 * Professional Experience Schema
 */
export const ExperienceSchema = BaseItemSchema.extend({
  name: z.string().trim().min(1, "Role/Title is required").max(150),
  company: z.string().trim().min(1, "Company name is required").max(150),
  companyUrl: z.string().trim().default(""),
  time: z.string().trim().min(1, "Time period is required").max(100),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  current: z.boolean().default(false),
  how: z.string().trim().min(1, "Role description / duties are required").max(3000),
});

/**
 * Education Schema
 */
export const EducationSchema = BaseItemSchema.extend({
  name: z.string().trim().min(1, "Institution name is required").max(150),
  degName: z.string().trim().min(1, "Degree name is required").max(150),
  Department: z.string().trim().default(""),
  time: z.string().trim().min(1, "Time period is required").max(100),
  cgpa: z.string().trim().default(""),
  Thesis: z.string().trim().default(""),
  group: z.string().trim().default(""),
});

/**
 * Certifications Schema
 */
export const CertificationSchema = BaseItemSchema.extend({
  title: z.string().trim().min(1, "Certification title is required").max(200),
  issuer: z.string().trim().min(1, "Issuing organization is required").max(150),
  url: z.string().trim().default(""),
  issueDate: z.string().trim().default(""),
  description: z.string().trim().default(""),
});

/**
 * Achievements & Leadership Schema
 */
export const AchievementSchema = BaseItemSchema.extend({
  title: z.string().trim().min(1, "Achievement title is required").max(200),
  organization: z.string().trim().default(""),
  description: z.string().trim().min(1, "Description is required").max(2000),
  date: z.string().trim().default(""),
});

/**
 * Profile Singleton Schema
 */
export const ProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  title: z.string().trim().min(1, "Title is required"),
  bio: z.string().trim().min(1, "Bio is required"),
  image: z.string().trim().default("/assets/img/profile.png"),
  email: z.string().trim().email("Valid email required"),
  phone: z.string().trim().default(""),
  location: z.string().trim().min(1, "Location is required"),
  github: z.string().trim().default(""),
  linkedin: z.string().trim().default(""),
  twitter: z.string().trim().default(""),
  company: z.string().trim().default(""),
  website: z.string().trim().default("https://mahbub.dev"),
});

/**
 * Hero Banner Singleton Schema
 */
export const BannerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  jobTitle: z.string().trim().min(1, "Job title is required"),
  headline: z.string().trim().min(1, "Headline is required"),
  location: z.string().trim().min(1, "Location is required"),
  bio: z.string().trim().min(1, "Bio is required"),
  socialLinks: z
    .object({
      email: z.string().trim().default(""),
      github: z.string().trim().default(""),
      facebook: z.string().trim().default(""),
      linkedin: z.string().trim().default(""),
    })
    .default({}),
});

/**
 * Contact Info Singleton Schema
 */
export const ContactInfoSchema = z.object({
  contactInfo: z
    .object({
      email: z.string().trim().email("Valid email required"),
      location: z.string().trim().default("Dhaka, Bangladesh"),
      website: z.string().trim().default("https://mahbub.dev"),
      phone: z.string().trim().default(""),
    })
    .default({
      email: "mahbubcse96@gmail.com",
      location: "Dhaka, Bangladesh",
      website: "https://mahbub.dev",
      phone: "",
    }),
});

export const PORTFOLIO_COLLECTION_SCHEMAS = {
  Projects: ProjectSchema,
  Skills: SkillSchema,
  CoreStrengths: CoreStrengthSchema,
  Experiences: ExperienceSchema,
  Educations: EducationSchema,
  Certifications: CertificationSchema,
  Achievements: AchievementSchema,
};

export const SINGLETON_SCHEMAS = {
  profile: ProfileSchema,
  Banner: BannerSchema,
  Contact: ContactInfoSchema,
};

export const ALL_COLLECTION_NAMES = [
  ...Object.keys(PORTFOLIO_COLLECTION_SCHEMAS),
  ...Object.keys(SINGLETON_SCHEMAS),
];

export function getSchemaForCollection(collectionName) {
  return PORTFOLIO_COLLECTION_SCHEMAS[collectionName] || SINGLETON_SCHEMAS[collectionName] || null;
}

export function isSingletonCollection(collectionName) {
  return Boolean(SINGLETON_SCHEMAS[collectionName]);
}
