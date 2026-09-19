/**
 * Strictly sanitize analytics metadata (zero sensitive fields, passwords, or keys)
 */

const SENSITIVE_KEYWORDS = [
  "password",
  "passwd",
  "pwd",
  "token",
  "secret",
  "creditcard",
  "cardnumber",
  "cvv",
  "cvc",
  "ssn",
  "auth",
  "key",
  "credential",
  "bearer",
];

export function sanitizeMetadata(meta, depth = 0) {
  if (!meta || typeof meta !== "object" || depth > 3) return {};

  const sanitized = {};

  for (const [key, value] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYWORDS.some((s) => lowerKey.includes(s));

    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = Array.isArray(value)
        ? value.slice(0, 30) // Cap nested array length
        : sanitizeMetadata(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
