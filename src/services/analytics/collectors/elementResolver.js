/**
 * Semantic Element Identification & Sensitive Field Resolver
 * Complies with Sections 118 & 119: Stable Replay Identifiers
 */

export function getElementIdentifier(target) {
  if (!target || !(target instanceof Element)) return "unknown";

  const idAttr =
    target.getAttribute("data-replay-id") ||
    target.getAttribute("data-replay-name") ||
    target.getAttribute("data-analytics-id") ||
    target.getAttribute("data-component") ||
    target.getAttribute("data-testid") ||
    target.id ||
    target.getAttribute("aria-label") ||
    target.getAttribute("name");

  if (idAttr) return idAttr;

  let parent = target.parentElement;
  let depth = 0;
  while (parent && depth < 3) {
    const parentId =
      parent.getAttribute("data-replay-id") ||
      parent.getAttribute("data-analytics-id") ||
      parent.getAttribute("data-component") ||
      parent.id;
    if (parentId) return `${parentId} > ${target.tagName.toLowerCase()}`;
    parent = parent.parentElement;
    depth++;
  }

  const tagName = target.tagName.toLowerCase();
  const role = target.getAttribute("role");
  const type = target.getAttribute("type");
  const href = target.getAttribute("href");

  if (role) return `${tagName}[role=${role}]`;
  if (type) return `${tagName}[type=${type}]`;
  if (href) return `${tagName}[href=${href.substring(0, 30)}]`;

  const cleanClass =
    typeof target.className === "string"
      ? target.className
          .split(" ")
          .filter((c) => c && !c.includes("module") && c.length > 2)[0]
      : null;

  if (cleanClass) return `${tagName}.${cleanClass}`;

  return tagName;
}

export function isSensitiveInput(input) {
  if (!input) return true;
  const type = (input.getAttribute("type") || "").toLowerCase();
  const name = (input.getAttribute("name") || "").toLowerCase();
  const id = (input.getAttribute("id") || "").toLowerCase();
  const autocomplete = (input.getAttribute("autocomplete") || "").toLowerCase();
  const isMasked = input.hasAttribute("data-analytics-mask");

  if (isMasked || type === "password" || type === "hidden") return true;

  const sensitiveKeywords = [
    "pass",
    "pwd",
    "token",
    "secret",
    "card",
    "cvv",
    "cvc",
    "ssn",
    "otp",
    "auth",
  ];

  return sensitiveKeywords.some(
    (kw) => name.includes(kw) || id.includes(kw) || autocomplete.includes(kw)
  );
}
