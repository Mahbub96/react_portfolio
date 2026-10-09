/**
 * Publish-time SEO and accessibility checks. Errors block publishing;
 * warnings are shown in the editor's checklist but do not block.
 */
import { LIMITS } from "./schema.mjs";
import { isValidSlug } from "./slug.mjs";

export function postDescription(post) {
  return String(post.metaDescription || post.excerpt || "").trim();
}

/**
 * @param {object} post   working copy (title, slug, excerpt, meta*, coverImage, canonicalUrl)
 * @param {object} rendered result of renderDoc(post.contentJson)
 * @returns {{ ok: boolean, errors: string[], warnings: string[] }}
 */
export function validateForPublish(post, rendered) {
  const errors = [];
  const warnings = [];

  const title = String(post.title || "").trim();
  if (!title) errors.push("Add a title.");
  else if (title.length > LIMITS.title) errors.push(`Shorten the title to ${LIMITS.title} characters.`);

  if (!isValidSlug(post.slug)) {
    errors.push("The URL slug may only use lowercase letters, numbers and single hyphens (max 80).");
  }

  const description = postDescription(post);
  if (!description) {
    errors.push("Add an excerpt or meta description; search results and social cards use it.");
  } else if (description.length > LIMITS.metaDescription) {
    errors.push(`Shorten the meta description to ${LIMITS.metaDescription} characters (now ${description.length}).`);
  } else if (description.length < 70) {
    warnings.push("The meta description is short; 120–160 characters works best in search results.");
  }

  const metaTitle = String(post.metaTitle || title).trim();
  if (metaTitle.length > 60) {
    warnings.push(`The search title is ${metaTitle.length} characters; Google usually shows about 60.`);
  }

  const missingAlt = rendered.images.filter((image) => !image.alt).length;
  if (missingAlt) {
    errors.push(`${missingAlt} image${missingAlt > 1 ? "s need" : " needs"} alt text.`);
  }
  if (post.coverImage && !String(post.coverImage.alt || "").trim()) {
    errors.push("The cover image needs alt text.");
  }
  if (!post.coverImage) {
    warnings.push("No cover image: social cards will use the site default.");
  }

  let previous = 1;
  for (const heading of rendered.headings) {
    if (heading.requested === 1) {
      warnings.push(`"${heading.text}" is an H1; the post title is the only H1, so it is shown as H2.`);
    } else if (heading.level > previous + 1) {
      warnings.push(`"${heading.text}" skips a heading level (H${previous} to H${heading.level}).`);
    }
    previous = heading.level;
  }

  if (post.canonicalUrl) {
    try {
      const url = new URL(post.canonicalUrl);
      if (url.protocol !== "https:") errors.push("A custom canonical URL must use https.");
    } catch {
      errors.push("The canonical URL is not a valid absolute URL.");
    }
  }

  if (rendered.wordCount < 300) {
    warnings.push(`Only ${rendered.wordCount} words; posts under 300 words rarely rank.`);
  }

  return { ok: errors.length === 0, errors, warnings };
}
