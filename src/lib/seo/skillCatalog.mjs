/**
 * Skill categorisation.
 *
 * Extracted from SkillsServer so the rendered skills section and the generated
 * llms.txt group skills identically. When the two had separate copies of this
 * logic, a skill could appear under "Frontend" on the page and "Additional" in
 * the machine-readable profile.
 */

/** Ordered category list — also defines render order on the skills section. */
export const SKILL_CATEGORY_ORDER = [
  "Frontend",
  "Backend & Languages",
  "Data",
  "Tools & Delivery",
  "Additional",
];

/** Classify a skill by its display name. */
export function skillCategory(skillName = "") {
  const name = String(skillName).toLowerCase();

  if (/(react|javascript|typescript|jquery|css|tailwind|bootstrap|vue|next)/.test(name)) {
    return "Frontend";
  }

  if (/(php|node|python|java|c plus|c\+\+|assembly|swing|laravel|fastapi|nest)/.test(name)) {
    return "Backend & Languages";
  }

  if (/(mysql|sqlite|mongo|postgres|redis|database)/.test(name)) {
    return "Data";
  }

  if (/(git|docker|aws|linux|ci|cd)/.test(name)) {
    return "Tools & Delivery";
  }

  return "Additional";
}

/**
 * Group a raw skills array into ordered { category, skills } buckets.
 * Empty categories are dropped so callers never render a headless section.
 */
export function groupSkills(skills = []) {
  const buckets = new Map();

  for (const skill of skills) {
    if (!skill || typeof skill !== "object") continue;
    const name = skill.name || skill.title || skill.altTxt;
    if (!name) continue;

    const category = skillCategory(name);
    if (!buckets.has(category)) buckets.set(category, []);
    buckets.get(category).push(skill);
  }

  return SKILL_CATEGORY_ORDER.filter((category) => buckets.get(category)?.length)
    .map((category) => ({ category, skills: buckets.get(category) }));
}
