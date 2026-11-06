/**
 * Pure helpers that turn CMS rows into the facts the homepage shows.
 * Everything is derived from the data, so dates and counts stay correct as
 * the portfolio content changes.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Parse "2023-09", "September 2023", "2023" or "Present" into a Date. */
export function parseMonth(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (/present|current|now/i.test(raw)) return new Date();

  let match = raw.match(/^(\d{4})[-/](\d{1,2})$/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, 1);

  match = raw.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (match) {
    const date = new Date(`${match[1]} 1, ${match[2]}`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  match = raw.match(/^(\d{4})$/);
  if (match) return new Date(Number(match[1]), 0, 1);

  return null;
}

export function formatMonth(date) {
  return date ? `${MONTHS[date.getMonth()]} ${date.getFullYear()}` : "";
}

function startOf(exp = {}) {
  return parseMonth(exp.startDate) || parseMonth(String(exp.time || "").split(/\s+[-–]\s+/)[0]);
}

function endRaw(exp = {}) {
  return exp.endDate || String(exp.time || "").split(/\s+[-–]\s+/)[1] || "";
}

export function isCurrent(exp = {}) {
  return /present|current|now/i.test(endRaw(exp));
}

/** "Mar 2025 — Present" style label for an experience row. */
export function experienceRange(exp = {}) {
  const start = formatMonth(startOf(exp));
  const end = isCurrent(exp) ? "Present" : formatMonth(parseMonth(endRaw(exp)));
  if (start && end) return `${start} — ${end}`;
  return exp.time || start || "";
}

/** Experiences ordered oldest → newest. */
export function sortExperiencesAscending(experiences = []) {
  return [...experiences]
    .filter(Boolean)
    .sort((a, b) => (startOf(a)?.getTime() || 0) - (startOf(b)?.getTime() || 0));
}

/** Earliest start and role count at one company (for the hero facts). */
export function experienceSummary(experiences = [], company) {
  const atCompany = experiences.filter(
    (exp) => exp && (!company || !exp.company || exp.company === company)
  );
  if (atCompany.length === 0) return null;
  const starts = atCompany.map(startOf).filter(Boolean).sort((a, b) => a - b);
  if (starts.length === 0) return null;
  return { since: formatMonth(starts[0]), roles: atCompany.length };
}

/** First number in a "3.70 out of 4.00" style value. */
export function gradeValue(value) {
  const match = String(value || "").match(/\d+(?:\.\d+)?/);
  return match ? match[0] : "";
}

/** The highest qualification (first row) condensed for the hero facts. */
export function primaryEducation(educations = []) {
  const edu = educations.find(Boolean);
  if (!edu) return null;
  const isBachelor = /bachelor/i.test(edu.degName || "");
  const isCse = /computer science/i.test(edu.Department || "");
  const degree = isBachelor && isCse ? "B.Sc. CSE" : edu.degName || "Degree";
  const grade = gradeValue(edu.cgpa);
  return {
    title: grade ? `${degree} · ${grade}` : degree,
    institution: String(edu.name || "").replace(/\s+Bangladesh$/, ""),
  };
}
