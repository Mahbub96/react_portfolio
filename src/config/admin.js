// Secure admin configuration
// In production, these should be stored in environment variables or secure database

export const ADMIN_CONFIG = {
  // These should be environment variables in production
  USERNAME: process.env.ADMIN_USERNAME || "mahbub",
  PASSWORD_HASH:
    process.env.ADMIN_PASSWORD_HASH ||
    "$2a$12$gEemmlhB/3WYXwC3hnkvn.XzCaY7BnOLw4UDyF.POLCt3wRysoSYa", // mahbub1230
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
