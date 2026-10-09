import { randomUUID } from "node:crypto";
import connectDB from "@/lib/mongodb";
import AdminSession from "@/models/AdminSession";
import { generateToken, secureResponse, verifyToken } from "@/lib/auth";
import { ADMIN_CONFIG, ADMIN_ROLES } from "@/config/admin";

/**
 * Admin sessions live in an httpOnly cookie, never in localStorage, so page
 * scripts cannot read the token. In production the `__Host-` prefix pins the
 * cookie to this exact host (mahbub.dev and test.mahbub.dev stay separate)
 * and requires Secure + Path=/. Plain http dev servers get an unprefixed,
 * non-Secure cookie instead.
 */
const IS_PROD = process.env.NODE_ENV === "production";
export const ADMIN_COOKIE = IS_PROD ? "__Host-mahbub_admin" : "admin_session";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function cookieOptions(expires) {
  return {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    path: "/",
    expires,
  };
}

export function getClientIP(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Cookie-authenticated writes must come from this site. Browsers always send
 * Origin on cross-origin and on POST/PUT/PATCH/DELETE requests, so a missing
 * or foreign Origin is rejected (SameSite=Strict is the first line; this is
 * the second).
 */
function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Resolve a session token to its active AdminSession, or null. */
async function resolveSession(token) {
  if (!token) return null;
  const claims = verifyToken(token);
  if (!claims?.jti) return null;

  const db = await connectDB();
  if (!db) return null; // no database: no way to check revocation, so deny

  const session = await AdminSession.findOne({
    jti: claims.jti,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).lean();
  if (!session) return null;

  return {
    username: claims.username,
    role: claims.role,
    jti: claims.jti,
    exp: claims.exp,
  };
}

/**
 * Gate for admin API routes:
 *   const auth = await requireAdmin(request);
 *   if (!auth.valid) return adminDenied(auth);
 * Non-GET requests also need a same-origin `Origin` header.
 */
export async function requireAdmin(request) {
  try {
    if (!SAFE_METHODS.has(request.method) && !isSameOrigin(request)) {
      return { valid: false, status: 403, error: "Cross-origin request rejected" };
    }
    const user = await resolveSession(request.cookies.get(ADMIN_COOKIE)?.value);
    if (!user) {
      return { valid: false, status: 401, error: "Authentication required" };
    }
    return { valid: true, user };
  } catch (error) {
    // Next's build-time probe signals "this route is dynamic" by throwing;
    // swallowing it could let Next cache the 401 as a static response.
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Admin auth error:", error.message);
    return { valid: false, status: 401, error: "Authentication required" };
  }
}

export function adminDenied(result) {
  return secureResponse({ success: false, error: result.error }, result.status || 401);
}

/**
 * Same check for server components and layouts under /admin, which read the
 * cookie through next/headers instead of a Request.
 */
export async function getAdminFromCookies() {
  const { cookies } = await import("next/headers");
  try {
    return await resolveSession(cookies().get(ADMIN_COOKIE)?.value);
  } catch {
    return null;
  }
}

/** True when the request carries an admin cookie (verified or not). */
export function hasAdminCookie(request) {
  return Boolean(request.cookies.get(ADMIN_COOKIE)?.value);
}

/** Create a revocable session for `username`; pass the result to setSessionCookie. */
export async function startAdminSession({ username, request }) {
  const jti = randomUUID();
  const expiresAt = new Date(Date.now() + ADMIN_CONFIG.SESSION_TIMEOUT);
  const token = generateToken({
    jti,
    userId: username,
    username,
    role: ADMIN_ROLES.ADMIN,
  });

  await AdminSession.create({
    jti,
    userId: username,
    username,
    userAgent: request.headers.get("user-agent") || undefined,
    ipAddress: getClientIP(request),
    expiresAt,
  });

  return { token, expiresAt, role: ADMIN_ROLES.ADMIN };
}

export function setSessionCookie(response, { token, expiresAt }) {
  response.cookies.set(ADMIN_COOKIE, token, cookieOptions(expiresAt));
  return response;
}

/** Revoke the request's session (if any) and clear the cookie on `response`. */
export async function endAdminSession(request, response) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const claims = token ? verifyToken(token) : null;
  let session = null;

  if (claims?.jti && (await connectDB())) {
    session = await AdminSession.findOneAndUpdate(
      { jti: claims.jti, isActive: true },
      { isActive: false },
      { new: false }
    ).lean();
  }

  response.cookies.set(ADMIN_COOKIE, "", cookieOptions(new Date(0)));
  return { claims, session };
}
