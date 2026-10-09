// Admin configuration. Credentials come only from the environment: there is
// no built-in password, so admin login is disabled until ADMIN_PASSWORD_HASH
// is set (generate one with `pnpm admin:hash`).

/**
 * bcrypt hashes contain "$", which Next's .env loader expands (even in a
 * process variable, when a bundled .env file also names the key), silently
 * corrupting the hash. The recommended form is therefore base64 with a
 * "b64:" prefix, which reads the same in bash, .env files and process env.
 * A raw "$2…" hash is still accepted.
 */
function readPasswordHash() {
  const raw = process.env.ADMIN_PASSWORD_HASH;
  if (!raw) return null;
  const hash = raw.startsWith("b64:")
    ? Buffer.from(raw.slice(4), "base64").toString("utf8")
    : raw;
  if (!/^\$2[aby]\$\d{2}\$.{53}$/.test(hash)) {
    console.error(
      "ADMIN_PASSWORD_HASH is not a valid bcrypt hash (possibly mangled by $-expansion); " +
        "use the b64: form from `pnpm admin:hash`. Admin login is disabled."
    );
    return null;
  }
  return hash;
}

export const ADMIN_CONFIG = {
  USERNAME: process.env.ADMIN_USERNAME || "mahbub",
  PASSWORD_HASH: readPasswordHash(),
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MAX_SESSIONS: 3, // Maximum concurrent sessions
};

// Admin permissions and roles
export const ADMIN_PERMISSIONS = {
  READ_PORTFOLIO: "read:portfolio",
  WRITE_PORTFOLIO: "write:portfolio",
  DELETE_PORTFOLIO: "delete:portfolio",
  READ_ANALYTICS: "read:analytics",
  READ_VISITORS: "read:visitors",
  MANAGE_USERS: "manage:users",
};

// Admin role definitions
export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
};

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: Object.values(ADMIN_PERMISSIONS),
  [ADMIN_ROLES.ADMIN]: [
    ADMIN_PERMISSIONS.READ_PORTFOLIO,
    ADMIN_PERMISSIONS.WRITE_PORTFOLIO,
    ADMIN_PERMISSIONS.READ_ANALYTICS,
    ADMIN_PERMISSIONS.READ_VISITORS,
  ],
  [ADMIN_ROLES.EDITOR]: [
    ADMIN_PERMISSIONS.READ_PORTFOLIO,
    ADMIN_PERMISSIONS.WRITE_PORTFOLIO,
  ],
  [ADMIN_ROLES.VIEWER]: [
    ADMIN_PERMISSIONS.READ_PORTFOLIO,
    ADMIN_PERMISSIONS.READ_ANALYTICS,
  ],
};

// Validation functions
export function validateAdminCredentials(username, password) {
  return username === ADMIN_CONFIG.USERNAME;
}

export function hasPermission(userRole, permission) {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(permission);
}

export function validateAdminSession(session) {
  if (!session || !session.user || !session.token) {
    return false;
  }

  const now = Date.now();
  if (session.expiresAt && now > session.expiresAt) {
    return false;
  }

  return true;
}

// Security settings
export const SECURITY_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL_CHARS: false,
  SESSION_IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  ACCOUNT_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  REQUIRE_2FA: false, // Enable in production
  LOGIN_HISTORY_RETENTION: 90 * 24 * 60 * 60 * 1000, // 90 days
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  LOGIN: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_ATTEMPTS: 5,
  },
  API: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100,
  },
  CONTACT_FORM: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 3,
  },
  UPLOAD: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 10,
  },
};
