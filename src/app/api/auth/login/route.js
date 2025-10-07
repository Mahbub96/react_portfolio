import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import { 
  verifyPassword, 
  generateToken, 
  checkLoginRateLimit, 
  resetLoginAttempts,
  secureResponse 
} from "@/lib/auth";
import { ADMIN_CONFIG, ADMIN_ROLES } from "@/config/admin";

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

// Create a schema for admin sessions
const AdminSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  token: { type: String, required: true },
  userAgent: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

// Use existing connection or create new one
let LoginAttempt, AdminSession;
try {
  LoginAttempt = mongoose.model("LoginAttempt");
} catch {
  LoginAttempt = mongoose.model("LoginAttempt", LoginAttemptSchema);
}

try {
  AdminSession = mongoose.model("AdminSession");
} catch {
  AdminSession = mongoose.model("AdminSession", AdminSessionSchema);
}

// Get client IP address
function getClientIP(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0] ||
         request.headers.get("x-real-ip") ||
         request.headers.get("x-client-ip") ||
         "unknown";
}

export async function POST(request) {
  try {
    await connectDB();

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
        timestamp: new Date(timestamp),
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
      // In production, this should be stored in environment variables
      const isPasswordValid = await verifyPassword(password, ADMIN_CONFIG.PASSWORD_HASH);
      
      if (isPasswordValid) {
        // Generate JWT token
        const tokenPayload = {
          userId: sanitizedUsername,
          username: sanitizedUsername,
          role: ADMIN_ROLES.ADMIN,
          iat: Math.floor(Date.now() / 1000),
        };

        const token = generateToken(tokenPayload);

        // Create admin session
        const sessionExpiry = new Date(Date.now() + ADMIN_CONFIG.SESSION_TIMEOUT);
        const adminSession = new AdminSession({
          userId: sanitizedUsername,
          username: sanitizedUsername,
          token,
          userAgent,
          ipAddress: getClientIP(request),
          expiresAt: sessionExpiry,
        });

        await adminSession.save();

        // Log successful login
        const loginAttempt = new LoginAttempt({
          username: sanitizedUsername,
          timestamp: new Date(timestamp),
          userAgent,
          ip: getClientIP(request),
          success: true,
          ipAddress: getClientIP(request),
        });

        await loginAttempt.save();

        // Reset login attempts
        resetLoginAttempts(sanitizedUsername);

        // Return success with token
        return secureResponse({
          success: true,
          message: "Login successful",
          token,
          userRole: ADMIN_ROLES.ADMIN,
          expiresAt: sessionExpiry.toISOString(),
        });

      } else {
        // Log failed login attempt
        const loginAttempt = new LoginAttempt({
          username: sanitizedUsername,
          timestamp: new Date(timestamp),
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
        timestamp: new Date(timestamp),
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
    console.error("Login API error:", error);
    
    // Don't expose internal errors to client
    return secureResponse(
      { success: false, message: "Internal server error" },
      500
    );
  }
}

// Clean up expired sessions and login attempts
export async function GET() {
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
    console.error("Cleanup error:", error);
    return secureResponse({ error: "Cleanup failed" }, 500);
  }
}
