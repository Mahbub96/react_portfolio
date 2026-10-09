import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import {
  verifyPassword,
  checkLoginRateLimit,
  resetLoginAttempts,
  secureResponse
} from "@/lib/auth";
import { ADMIN_CONFIG } from "@/config/admin";
import AdminSession from "@/models/AdminSession";
import {
  adminDenied,
  getClientIP,
  requireAdmin,
  setSessionCookie,
  startAdminSession,
} from "@/lib/adminSession";

// Create a schema for login attempts
const LoginAttemptSchema = new mongoose.Schema({
  username: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userAgent: { type: String },
  ip: { type: String },
  success: { type: Boolean, default: true },
  ipAddress: { type: String },
  country: { type: String },
  city: { type: String },
  region: { type: String },
  timezone: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }, // 90 days
});

// Use existing connection or create new one
let LoginAttempt;
try {
  LoginAttempt = mongoose.model("LoginAttempt");
} catch {
  LoginAttempt = mongoose.model("LoginAttempt", LoginAttemptSchema);
}

export async function POST(request) {
  try {
    if (!ADMIN_CONFIG.PASSWORD_HASH) {
      return secureResponse(
        { success: false, message: "Admin login is not configured" },
        503
      );
    }

    if (!(await connectDB())) {
      return secureResponse(
        { success: false, message: "Admin login is unavailable" },
        503
      );
    }

    const body = await request.json();
    const { username, password, timestamp, userAgent } = body;

    // Input validation
    if (!username || !password) {
      return secureResponse(
        { success: false, message: "Username and password are required" },
        400
      );
    }

    // Sanitize inputs
    const sanitizedUsername = username.trim().toLowerCase();
    
    // Check rate limiting
    const rateLimitCheck = checkLoginRateLimit(sanitizedUsername);
    if (!rateLimitCheck.allowed) {
      // Log failed attempt
      const loginAttempt = new LoginAttempt({
        username: sanitizedUsername,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        userAgent,
        ip: getClientIP(request),
        success: false,
        ipAddress: getClientIP(request),
      });
      await loginAttempt.save();

      return secureResponse(
        { 
          success: false, 
          message: "Account temporarily locked due to too many failed attempts",
          lockedOut: true,
          lockoutTime: rateLimitCheck.lockoutTime
        },
        429
      );
    }

    // Validate credentials
    if (sanitizedUsername === ADMIN_CONFIG.USERNAME.toLowerCase()) {
      const isPasswordValid = await verifyPassword(password, ADMIN_CONFIG.PASSWORD_HASH);

      if (isPasswordValid) {
        // Log successful login
        const loginAttempt = new LoginAttempt({
          username: sanitizedUsername,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          userAgent,
          ip: getClientIP(request),
          success: true,
          ipAddress: getClientIP(request),
        });

        await loginAttempt.save();

        // Reset login attempts
        resetLoginAttempts(sanitizedUsername);

        // The session token goes only into the httpOnly cookie; the body
        // carries nothing a script could reuse.
        const session = await startAdminSession({ username: sanitizedUsername, request });
        return setSessionCookie(
          secureResponse({
            success: true,
            message: "Login successful",
            userRole: session.role,
            expiresAt: session.expiresAt.toISOString(),
          }),
          session
        );

      } else {
        // Log failed login attempt
        const loginAttempt = new LoginAttempt({
          username: sanitizedUsername,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          userAgent,
          ip: getClientIP(request),
          success: false,
          ipAddress: getClientIP(request),
        });

        await loginAttempt.save();

        return secureResponse(
          { 
            success: false, 
            message: "Invalid credentials",
            remainingAttempts: rateLimitCheck.remainingAttempts
          },
          401
        );
      }
    } else {
      // Log failed login attempt for unknown username
      const loginAttempt = new LoginAttempt({
        username: sanitizedUsername,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        userAgent,
        ip: getClientIP(request),
        success: false,
        ipAddress: getClientIP(request),
      });

      await loginAttempt.save();

      return secureResponse(
        { 
          success: false, 
          message: "Invalid credentials",
          remainingAttempts: rateLimitCheck.remainingAttempts
        },
        401
      );
    }
  } catch (error) {
    console.log("Login API error:", error);
    
    // Don't expose internal errors to client
    return secureResponse(
      { success: false, message: "Internal server error" },
      500
    );
  }
}

// Clean up expired sessions and login attempts (admin only)
export async function GET(request) {
  const auth = await requireAdmin(request);
  if (!auth.valid) return adminDenied(auth);

  try {
    await connectDB();
    
    const now = new Date();
    
    // Clean up expired sessions
    await AdminSession.deleteMany({ expiresAt: { $lt: now } });
    
    // Clean up expired login attempts (older than 90 days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    await LoginAttempt.deleteMany({ createdAt: { $lt: ninetyDaysAgo } });
    
    return secureResponse({ message: "Cleanup completed" });
  } catch (error) {
    console.log("Cleanup error:", error);
    return secureResponse({ error: "Cleanup failed" }, 500);
  }
}
