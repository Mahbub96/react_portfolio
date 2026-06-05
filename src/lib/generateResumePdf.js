import { jsPDF } from "jspdf";
import { resumeContent } from "@/lib/resumeContent";

const MARGIN_X = 16.5;
const MARGIN_TOP = 15.2;
const PAGE_WIDTH = 215.9;
const PAGE_HEIGHT = 279.4;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const LINE_HEIGHT = 4.8;

const COLORS = {
  head: [26, 26, 26],
  sub: [68, 68, 68],
  link: [17, 85, 204],
  body: [30, 30, 30],
};

/** jsPDF Helvetica only supports Latin-1 — normalize Unicode before rendering */
function sanitizePdfText(text) {
  if (!text) return "";
  return String(text)
    .replace(/\u2192/g, "->")
    .replace(/\u2014/g, "--")
    .replace(/\u2013/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
}

function displayUrl(url) {
  if (!url) return "";
  return url.replace(/^mailto:/i, "").replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}

function formatCgpa(cgpa) {
  if (!cgpa) return "";
  const match = cgpa.match(/([\d.]+)\s*(?:out of|\/)\s*([\d.]+)/i);
  if (match) return `CGPA: ${match[1]} / ${match[2]}`;
  return `CGPA: ${cgpa}`;
}

function formatEducationTitle(edu) {
  const group = edu.group ? ` - ${edu.group}` : "";
  const deg = (edu.degName || "").toLowerCase();

  if (deg.includes("bachelor") && edu.Department) {
    return `B.Sc. in ${edu.Department}`;
  }
  if (deg.includes("higher secondary") || deg.includes("hsc")) {
    return `Higher Secondary Certificate (HSC)${group}`;
  }
  if (deg.includes("secondary school") || deg.includes("ssc")) {
    return `Secondary School Certificate (SSC)${group}`;
  }

  return [edu.degName, edu.Department].filter(Boolean).join(" in ") || edu.name || "Education";
}

function ensureSpace(doc, y, needed = 16) {
  if (y + needed > PAGE_HEIGHT - MARGIN_TOP) {
    doc.addPage();
    return MARGIN_TOP;
  }
  return y;
}

function setColor(doc, [r, g, b]) {
  doc.setTextColor(r, g, b);
}

function addSection(doc, title, y) {
  y = ensureSpace(doc, y, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setColor(doc, COLORS.head);
  doc.text(sanitizePdfText(title).toUpperCase(), MARGIN_X, y);
  doc.setLineWidth(0.35);
  setColor(doc, [0, 0, 0]);
  doc.line(MARGIN_X, y + 1.5, PAGE_WIDTH - MARGIN_X, y + 1.5);
  return y + 7;
}

function addWrappedText(doc, text, y, options = {}) {
  const {
    fontSize = 10,
    style = "normal",
    color = COLORS.body,
    x = MARGIN_X,
    width = CONTENT_WIDTH,
    lineHeight = LINE_HEIGHT,
    spacing = 2,
  } = options;

  doc.setFont("helvetica", style);
  doc.setFontSize(fontSize);
  setColor(doc, color);
  const lines = doc.splitTextToSize(sanitizePdfText(text), width);

  for (const line of lines) {
    y = ensureSpace(doc, y, lineHeight);
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y + spacing;
}

function measureRichText(doc, segments, maxWidth, fontSize) {
  const lines = [];
  let current = [];
  let currentWidth = 0;

  const flush = () => {
    if (current.length) {
      lines.push(current);
      current = [];
      currentWidth = 0;
    }
  };

  for (const segment of segments) {
    doc.setFont("helvetica", segment.bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    const words = segment.text.split(/(\s+)/);

    for (const word of words) {
      if (!word) continue;
      const wordWidth = doc.getTextWidth(word);
      if (currentWidth + wordWidth > maxWidth && current.length) {
        flush();
      }
      current.push({ ...segment, text: word });
      currentWidth += wordWidth;
    }
  }
  flush();
  return lines;
}

function drawRichLine(doc, line, x, y, fontSize, color = COLORS.body) {
  let cursor = x;
  for (const segment of line) {
    doc.setFont("helvetica", segment.bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    setColor(doc, color);
    doc.text(segment.text, cursor, y);
    cursor += doc.getTextWidth(segment.text);
  }
}

function parseBoldSegments(text) {
  const segments = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false });
  }
  if (!segments.length) {
    segments.push({ text, bold: false });
  }
  return segments;
}

function addRichWrappedText(doc, text, y, options = {}) {
  const {
    fontSize = 10,
    x = MARGIN_X,
    width = CONTENT_WIDTH,
    lineHeight = LINE_HEIGHT,
    spacing = 2,
    color = COLORS.body,
  } = options;

  const lines = measureRichText(doc, parseBoldSegments(sanitizePdfText(text)), width, fontSize);
  for (const line of lines) {
    y = ensureSpace(doc, y, lineHeight);
    drawRichLine(doc, line, x, y, fontSize, color);
    y += lineHeight;
  }
  return y + spacing;
}

function addEntryHeader(doc, left, right, y) {
  y = ensureSpace(doc, y, 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setColor(doc, COLORS.head);
  doc.text(sanitizePdfText(left), MARGIN_X, y);
  if (right) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(doc, COLORS.sub);
    doc.text(sanitizePdfText(right), PAGE_WIDTH - MARGIN_X, y, { align: "right" });
  }
  return y + LINE_HEIGHT - 0.5;
}

function addEntrySubheader(doc, left, right, y) {
  y = ensureSpace(doc, y, 7);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  setColor(doc, COLORS.sub);
  doc.text(sanitizePdfText(left), MARGIN_X, y);
  if (right) {
    doc.setFont("helvetica", "normal");
    doc.text(sanitizePdfText(right), PAGE_WIDTH - MARGIN_X, y, { align: "right" });
  }
  return y + LINE_HEIGHT + 1;
}

function addSkillRow(doc, label, content, y) {
  y = ensureSpace(doc, y, 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setColor(doc, COLORS.body);
  const labelWidth = doc.getTextWidth(label) + 1.5;

  doc.text(sanitizePdfText(label), MARGIN_X, y);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(sanitizePdfText(content), CONTENT_WIDTH - labelWidth);
  doc.text(lines[0], MARGIN_X + labelWidth, y);
  y += LINE_HEIGHT;
  for (let i = 1; i < lines.length; i += 1) {
    y = ensureSpace(doc, y, LINE_HEIGHT);
    doc.text(lines[i], MARGIN_X + labelWidth, y);
    y += LINE_HEIGHT;
  }
  return y + 1;
}

function addBullet(doc, text, y, textX = MARGIN_X + 5, width = CONTENT_WIDTH - 5) {
  y = ensureSpace(doc, y, LINE_HEIGHT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  setColor(doc, COLORS.body);
  doc.text("•", MARGIN_X + 1.5, y);
  return addRichWrappedText(doc, text, y, {
    fontSize: 9.5,
    x: textX,
    width,
    lineHeight: LINE_HEIGHT,
    spacing: 1,
  });
}

function addLinkText(doc, parts, y, fontSize = 9) {
  y = ensureSpace(doc, y, LINE_HEIGHT);
  const centerX = PAGE_WIDTH / 2;
  const totalWidth = parts.reduce((sum, part) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    return sum + doc.getTextWidth(part.text) + (part.sep ? doc.getTextWidth(part.sep) : 0);
  }, 0);

  let cursor = centerX - totalWidth / 2;
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    setColor(doc, COLORS.link);

    const safeText = sanitizePdfText(part.text);
    if (part.url) {
      doc.textWithLink(safeText, cursor, y, { url: part.url });
    } else {
      doc.text(safeText, cursor, y);
    }
    cursor += doc.getTextWidth(safeText);

    if (part.sep && i < parts.length - 1) {
      setColor(doc, COLORS.sub);
      doc.text(sanitizePdfText(part.sep), cursor, y);
      cursor += doc.getTextWidth(part.sep);
    }
  }
  return y + LINE_HEIGHT + 1;
}

function addReference(doc, ref, y) {
  y = ensureSpace(doc, y, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setColor(doc, COLORS.head);
  const safeName = sanitizePdfText(ref.name);
  doc.textWithLink(safeName, MARGIN_X, y, { url: ref.url });
  doc.setFont("helvetica", "normal");
  setColor(doc, COLORS.sub);
  doc.text(sanitizePdfText(ref.phone), PAGE_WIDTH - MARGIN_X, y, { align: "right" });
  y += LINE_HEIGHT;
  return addWrappedText(doc, ref.title, y, {
    fontSize: 9,
    style: "italic",
    color: COLORS.sub,
    spacing: 4,
  });
}

export function buildResumeData(portfolioData) {
  const profile = portfolioData.profile?.data || {};
  const banner = portfolioData.Banner?.data || {};
  const contact = portfolioData.Contact?.data?.contactInfo || portfolioData.Contact?.data || {};
  const socialLinks = banner.socialLinks || {};

  const name = (banner.name || profile.name || "Md Mahbub Alam").trim();
  const jobTitle = (banner.jobTitle || profile.title || "Software Engineer").trim();
  const location = (banner.location || profile.location || contact.location || "Dhaka, Bangladesh").trim();
  const email = (socialLinks.email || contact.email || profile.email || "mahbubcse96@gmail.com").trim();
  const website = (contact.website || profile.website || "https://mahbub.dev").trim();
  const linkedin = (socialLinks.linkedin || profile.linkedin || "https://linkedin.com/in/mahbubcse96").trim();
  const github = (socialLinks.github || profile.github || "https://github.com/Mahbub96").trim();

  const bio = (banner.bio || profile.description || profile.bio || "").trim();
  const summary = bio || resumeContent.professionalSummary;

  const educations = Array.isArray(portfolioData.Educations?.data)
    ? [...portfolioData.Educations.data].reverse()
    : [];

  return {
    name,
    jobTitle,
    location,
    email,
    website,
    linkedin,
    github,
    summary,
    skillCategories: resumeContent.skillCategories,
    workExperiences: resumeContent.workExperiences,
    featuredProjects: resumeContent.featuredProjects,
    additionalProjects: resumeContent.additionalProjects,
    certifications: resumeContent.certifications,
    leadership: resumeContent.leadership,
    references: resumeContent.references,
    educations,
  };
}

export function generateResumePdf(portfolioData) {
  const resume = buildResumeData(portfolioData);
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  let y = MARGIN_TOP;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  setColor(doc, COLORS.head);
  doc.text(sanitizePdfText(resume.name), PAGE_WIDTH / 2, y, { align: "center" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setColor(doc, COLORS.sub);
  const subtitle = [resume.jobTitle, resume.location].filter(Boolean).join("   |   ");
  doc.text(sanitizePdfText(subtitle), PAGE_WIDTH / 2, y, { align: "center" });
  y += 5;

  y = addLinkText(doc, [
    { text: resume.email, url: `mailto:${resume.email}`, sep: "   |   " },
    { text: displayUrl(resume.website), url: resume.website, sep: "   |   " },
    { text: displayUrl(resume.linkedin), url: resume.linkedin, sep: "   |   " },
    { text: displayUrl(resume.github), url: resume.github },
  ], y);
  y += 1;

  y = addSection(doc, "Professional Summary", y);
  y = addWrappedText(doc, resume.summary, y, { fontSize: 10, spacing: 3 });

  y = addSection(doc, "Technical Skills", y);
  for (const row of resume.skillCategories) {
    y = addSkillRow(doc, row.label, row.items, y);
  }
  y += 1;

  y = addSection(doc, "Work Experience", y);
  for (const exp of resume.workExperiences) {
    y = addEntryHeader(doc, exp.title, exp.period, y);
    y = addEntrySubheader(doc, exp.company, exp.location, y);
    for (const bullet of exp.bullets) {
      y = addBullet(doc, bullet, y);
    }
    if (exp.note) {
      y = addWrappedText(doc, exp.note, y, {
        fontSize: 9,
        style: "italic",
        color: COLORS.sub,
        spacing: 3,
      });
    }
    y += 1;
  }

  y = addSection(doc, "Projects", y);
  for (const project of resume.featuredProjects) {
    y = addEntryHeader(doc, project.name, "", y);
    y = addWrappedText(doc, project.tech, y, {
      fontSize: 9,
      style: "italic",
      color: COLORS.sub,
      spacing: 1,
    });
    for (const bullet of project.bullets) {
      y = addBullet(doc, bullet, y);
    }
    y += 1;
  }

  if (resume.additionalProjects.length) {
    y = ensureSpace(doc, y, 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setColor(doc, COLORS.body);
    doc.text(sanitizePdfText("Additional Projects"), MARGIN_X, y);
    y += LINE_HEIGHT + 1;

    for (const project of resume.additionalProjects) {
      const line = `**${project.name}** (${project.tech}) - ${project.desc}`;
      y = addBullet(doc, line, y);
    }
    y += 1;
  }

  y = addSection(doc, "Education", y);
  for (const edu of resume.educations) {
    y = addEntryHeader(doc, formatEducationTitle(edu), edu.time || "", y);
    y = addEntrySubheader(doc, edu.name || "", formatCgpa(edu.cgpa), y);
    y += 1;
  }

  y = addSection(doc, "Certifications & Achievements", y);
  for (const item of resume.certifications) {
    if (typeof item === "string") {
      y = addBullet(doc, item, y);
      continue;
    }
    y = ensureSpace(doc, y, LINE_HEIGHT);
    doc.text("•", MARGIN_X + 1.5, y);
    const bulletX = MARGIN_X + 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setColor(doc, COLORS.body);
    const safeTitle = sanitizePdfText(item.title);
    doc.textWithLink(safeTitle, bulletX, y, { url: item.url });
    doc.setFont("helvetica", "normal");
    doc.text(` - ${sanitizePdfText(item.issuer)}`, bulletX + doc.getTextWidth(safeTitle), y);
    y += LINE_HEIGHT + 1;
  }

  y = addSection(doc, "Leadership & Activities", y);
  for (const item of resume.leadership) {
    y = addBullet(doc, item, y);
  }
  y += 1;

  y = addSection(doc, "References", y);
  for (const ref of resume.references) {
    y = addReference(doc, ref, y);
  }

  const safeName = resume.name.replace(/[^a-zA-Z0-9_-]/g, "_");
  return {
    buffer: Buffer.from(doc.output("arraybuffer")),
    filename: `${safeName}_Resume.pdf`,
    resume,
  };
}
