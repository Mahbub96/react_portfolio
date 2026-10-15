import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ProjectSchema,
  SkillSchema,
  ExperienceSchema,
  EducationSchema,
  CertificationSchema,
  AchievementSchema,
  getSchemaForCollection,
  isSingletonCollection,
} from "./schemas.js";

test("ProjectSchema validates valid project and transforms comma-separated tech", () => {
  const input = {
    id: "proj-1",
    name: "LinkLens Platform",
    desc: "Enterprise link intelligence platform with high performance.",
    lang: "NestJS, Next.js, Redis",
    githubUrl: "https://github.com/Mahbub96/LinkLens",
  };

  const parsed = ProjectSchema.parse(input);
  assert.equal(parsed.id, "proj-1");
  assert.equal(parsed.published, true);
  assert.equal(parsed.order, 0);
  assert.deepEqual(parsed.lang, ["NestJS", "Next.js", "Redis"]);
});

test("ProjectSchema rejects missing name or desc", () => {
  assert.throws(() => {
    ProjectSchema.parse({ id: "proj-2", name: "" });
  });
});

test("SkillSchema validates valid skill and category", () => {
  const valid = {
    id: "skill-1",
    name: "TypeScript",
    category: "Languages",
    icon: "SiTypescript",
    color: "#3178c6",
  };
  const parsed = SkillSchema.parse(valid);
  assert.equal(parsed.name, "TypeScript");
  assert.equal(parsed.category, "Languages");

  assert.throws(() => {
    SkillSchema.parse({ ...valid, category: "InvalidCategory" });
  });
});

test("ExperienceSchema validates experience and calculates default current status", () => {
  const exp = {
    id: "exp-1",
    name: "Software Engineer",
    company: "Brotecs Technologies Ltd.",
    time: "March 2024 - Present",
    how: "Building web applications and backend APIs.",
    startDate: "2024-03",
    endDate: "Present",
    current: true,
  };
  const parsed = ExperienceSchema.parse(exp);
  assert.equal(parsed.company, "Brotecs Technologies Ltd.");
  assert.equal(parsed.current, true);
});

test("EducationSchema validates education", () => {
  const edu = {
    id: "edu-1",
    name: "Stamford University Bangladesh",
    degName: "Bachelor of Science",
    Department: "Computer Science and Engineering",
    time: "2019 - 2022",
    cgpa: "3.70",
  };
  const parsed = EducationSchema.parse(edu);
  assert.equal(parsed.degName, "Bachelor of Science");
  assert.equal(parsed.cgpa, "3.70");
});

test("Certification and Achievement schemas validate correct structure", () => {
  const cert = {
    id: "cert-1",
    title: "React Basic",
    issuer: "HackerRank",
    url: "https://hackerrank.com",
  };
  assert.equal(CertificationSchema.parse(cert).issuer, "HackerRank");

  const ach = {
    id: "ach-1",
    title: "University Technical Program Organizer",
    description: "Organized technical events and programming workshops.",
  };
  assert.equal(AchievementSchema.parse(ach).title, "University Technical Program Organizer");
});

test("getSchemaForCollection resolves expected schemas", () => {
  assert.ok(getSchemaForCollection("Projects"));
  assert.ok(getSchemaForCollection("Skills"));
  assert.ok(getSchemaForCollection("profile"));
  assert.equal(isSingletonCollection("profile"), true);
  assert.equal(isSingletonCollection("Projects"), false);
});
