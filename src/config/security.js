// Security Configuration for Mahbub Alam Portfolio
// This file contains all security-related settings and environment variable handling

export const SECURITY_CONFIG = {
  // JWT Configuration
  JWT: {
    SECRET:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-this-in-production-32-chars-min",
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // Admin Configuration
  ADMIN: {
    USERNAME: process.env.ADMIN_USERNAME || "mahbub",
    PASSWORD_HASH:
      process.env.ADMIN_PASSWORD_HASH ||
      "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i",
    SESSION_TIMEOUT:
      parseInt(process.env.SESSION_TIMEOUT) || 24 * 60 * 60 * 1000, // 24 hours
    MAX_SESSIONS: parseInt(process.env.MAX_SESSIONS) || 3,
  },

  // Rate Limiting
  RATE_LIMIT: {
    LOGIN: {
      WINDOW_MS:
        parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      MAX_ATTEMPTS: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS) || 5,
    },
    CONTACT_FORM: {
      WINDOW_MS:
        parseInt(process.env.CONTACT_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: parseInt(process.env.CONTACT_RATE_LIMIT_MAX_REQUESTS) || 3,
    },
    API: {
      WINDOW_MS: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
      MAX_REQUESTS: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100,
    },
  },

  // Password Policy
  PASSWORD_POLICY: {
    MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
    REQUIRE_UPPERCASE: process.env.PASSWORD_REQUIRE_UPPERCASE !== "false",
    REQUIRE_LOWERCASE: process.env.PASSWORD_REQUIRE_LOWERCASE !== "false",
    REQUIRE_NUMBERS: process.env.PASSWORD_REQUIRE_NUMBERS !== "false",
    REQUIRE_SPECIAL_CHARS:
      process.env.PASSWORD_REQUIRE_SPECIAL_CHARS === "true",
  },

  // Session Management
  SESSION: {
    IDLE_TIMEOUT: parseInt(process.env.SESSION_IDLE_TIMEOUT) || 30 * 60 * 1000, // 30 minutes
    CLEANUP_INTERVAL:
      parseInt(process.env.SESSION_CLEANUP_INTERVAL) || 60 * 60 * 1000, // 1 hour
    LOGIN_HISTORY_RETENTION:
      parseInt(process.env.LOGIN_HISTORY_RETENTION) || 90 * 24 * 60 * 60 * 1000, // 90 days
  },

  // Security Headers
  SECURITY_HEADERS: {
    X_FRAME_OPTIONS: process.env.X_FRAME_OPTIONS || "DENY",
    X_CONTENT_TYPE_OPTIONS: process.env.X_CONTENT_TYPE_OPTIONS || "nosniff",
    X_XSS_PROTECTION: process.env.X_XSS_PROTECTION || "1; mode=block",
    REFERRER_POLICY:
      process.env.REFERRER_POLICY || "strict-origin-when-cross-origin",
    CONTENT_SECURITY_POLICY:
      process.env.CONTENT_SECURITY_POLICY ||
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  },

  // CORS Configuration
  CORS: {
    ORIGIN: process.env.CORS_ORIGIN || "https://mahbub.dev",
    ALLOWED_METHODS: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    ALLOWED_HEADERS: ["Content-Type", "Authorization", "X-Requested-With"],
    CREDENTIALS: true,
  },

  // Input Validation
  VALIDATION: {
    MAX_NAME_LENGTH: parseInt(process.env.MAX_NAME_LENGTH) || 100,
    MAX_EMAIL_LENGTH: parseInt(process.env.MAX_EMAIL_LENGTH) || 254,
    MAX_SUBJECT_LENGTH: parseInt(process.env.MAX_SUBJECT_LENGTH) || 200,
    MAX_MESSAGE_LENGTH: parseInt(process.env.MAX_MESSAGE_LENGTH) || 2000,
    MAX_URL_LENGTH: parseInt(process.env.MAX_URL_LENGTH) || 2048,
  },

  // Disposable Email Domains (basic protection)
  DISPOSABLE_EMAIL_DOMAINS: [
    "tempmail.org",
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "yopmail.com",
    "sharklasers.com",
    "grr.la",
    "guerrillamailblock.com",
  ],

  // Environment Detection
  ENVIRONMENT: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",

  // Feature Flags
  FEATURES: {
    ANALYTICS: process.env.ENABLE_ANALYTICS !== "false",
    VISITOR_TRACKING: process.env.ENABLE_VISITOR_TRACKING !== "false",
    CONTACT_FORM: process.env.ENABLE_CONTACT_FORM !== "false",
    PWA: process.env.ENABLE_PWA !== "false",
    SEO: process.env.ENABLE_SEO !== "false",
    TWO_FACTOR_AUTH: process.env.ENABLE_2FA === "true",
  },
};

// Security validation functions
export function validateSecurityConfig() {
  const errors = [];

  // Check JWT secret strength
  if (SECURITY_CONFIG.JWT.SECRET.length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters long");
  }

  // Check if using default JWT secret in production
  if (
    SECURITY_CONFIG.IS_PRODUCTION &&
    SECURITY_CONFIG.JWT.SECRET.includes("change-this-in-production")
  ) {
    errors.push("JWT_SECRET must be changed in production");
  }

  // Check admin password hash
  if (
    SECURITY_CONFIG.IS_PRODUCTION &&
    SECURITY_CONFIG.ADMIN.PASSWORD_HASH.includes(
      "LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i"
    )
  ) {
    errors.push("ADMIN_PASSWORD_HASH must be changed in production");
  }

  // Check environment variables
  if (SECURITY_CONFIG.IS_PRODUCTION) {
    if (!process.env.JWT_SECRET) {
      errors.push("JWT_SECRET environment variable is required in production");
    }
    if (!process.env.ADMIN_PASSWORD_HASH) {
      errors.push(
        "ADMIN_PASSWORD_HASH environment variable is required in production"
      );
    }
    if (!process.env.MONGODB_URI) {
      errors.push("MONGODB_URI environment variable is required in production");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Get client IP address from request
export function getClientIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-client-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

// Validate email domain
export function isDisposableEmail(email) {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase();
  return SECURITY_CONFIG.DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

// Generate secure random string
export function generateSecureToken(length = 32) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Export default configuration
export default SECURITY_CONFIG;
