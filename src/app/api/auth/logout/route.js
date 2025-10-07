import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import { secureResponse } from "@/lib/auth";

// Create a schema for logout events
const LogoutEventSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userAgent: { type: String },
  ipAddress: { type: String },
  reason: { type: String, default: "user_logout" }, // user_logout, session_expired, admin_forced
  sessionDuration: { type: Number }, // in milliseconds
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }, // 90 days
});

// Create a schema for admin sessions (if not already defined)
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
let LogoutEvent, AdminSession;
try {
  LogoutEvent = mongoose.model("LogoutEvent");
} catch {
  LogoutEvent = mongoose.model("LogoutEvent", LogoutEventSchema);
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
    const { username, timestamp, userAgent, reason = "user_logout" } = body;

    // Input validation
    if (!username) {
      return secureResponse(
        { success: false, message: "Username is required" },
        400
      );
    }

    // Sanitize inputs
    const sanitizedUsername = username.trim().toLowerCase();

    // Get client IP
    const clientIP = getClientIP(request);

    // Find and deactivate all active sessions for this user
    const activeSessions = await AdminSession.find({
      username: sanitizedUsername,
      isActive: true
    });

    let sessionDuration = 0;
    if (activeSessions.length > 0) {
      // Calculate session duration and deactivate sessions
      for (const session of activeSessions) {
        sessionDuration = Math.max(sessionDuration, Date.now() - session.createdAt.getTime());
        session.isActive = false;
        await session.save();
      }
    }

    // Log logout event
    const logoutEvent = new LogoutEvent({
      userId: sanitizedUsername,
      username: sanitizedUsername,
      timestamp: new Date(timestamp),
      userAgent,
      ipAddress: clientIP,
      reason,
      sessionDuration,
    });

    await logoutEvent.save();

    // Clean up expired sessions
    const now = new Date();
    await AdminSession.deleteMany({ expiresAt: { $lt: now } });

    // Clean up expired logout events (older than 90 days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    await LogoutEvent.deleteMany({ createdAt: { $lt: ninetyDaysAgo } });

    return secureResponse({
      success: true,
      message: "Logout successful",
      sessionsTerminated: activeSessions.length,
    });

  } catch (error) {
    console.error("Logout API error:", error);
    
    // Don't expose internal errors to client
    return secureResponse(
      { success: false, message: "Logout failed" },
      500
    );
  }
}

// Force logout all sessions for a user (admin only)
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const reason = searchParams.get("reason") || "admin_forced";

    if (!username) {
      return secureResponse(
        { success: false, message: "Username parameter is required" },
        400
      );
    }

    // Find and deactivate all active sessions for this user
    const activeSessions = await AdminSession.find({
      username: username.trim().toLowerCase(),
      isActive: true
    });

    if (activeSessions.length > 0) {
      for (const session of activeSessions) {
        session.isActive = false;
        await session.save();
      }

      // Log forced logout event
      const logoutEvent = new LogoutEvent({
        userId: username.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        timestamp: new Date(),
        userAgent: "admin_forced",
        ipAddress: getClientIP(request),
        reason,
        sessionDuration: 0,
      });

      await logoutEvent.save();
    }

    return secureResponse({
      success: true,
      message: "All sessions terminated successfully",
      sessionsTerminated: activeSessions.length,
    });

  } catch (error) {
    console.error("Force logout API error:", error);
    return secureResponse(
      { success: false, message: "Force logout failed" },
      500
    );
  }
}
