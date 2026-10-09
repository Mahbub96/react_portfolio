import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import { secureResponse } from "@/lib/auth";
import AdminSession from "@/models/AdminSession";
import {
  adminDenied,
  endAdminSession,
  getClientIP,
  requireAdmin,
} from "@/lib/adminSession";

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

// Use existing connection or create new one
let LogoutEvent;
try {
  LogoutEvent = mongoose.model("LogoutEvent");
} catch {
  LogoutEvent = mongoose.model("LogoutEvent", LogoutEventSchema);
}

// End the caller's own session: revoke it server-side and clear the cookie.
// Always succeeds from the client's point of view, so a stale cookie can
// still be cleared.
export async function POST(request) {
  const response = secureResponse({ success: true, message: "Logout successful" });

  try {
    const { claims, session } = await endAdminSession(request, response);

    if (claims?.username && (await connectDB())) {
      await LogoutEvent.create({
        userId: claims.username,
        username: claims.username,
        timestamp: new Date(),
        userAgent: request.headers.get("user-agent") || undefined,
        ipAddress: getClientIP(request),
        reason: "user_logout",
        sessionDuration: session ? Date.now() - new Date(session.createdAt).getTime() : 0,
      });

      // Clean up expired sessions and logout events (older than 90 days)
      const now = new Date();
      await AdminSession.deleteMany({ expiresAt: { $lt: now } });
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      await LogoutEvent.deleteMany({ createdAt: { $lt: ninetyDaysAgo } });
    }
  } catch (error) {
    console.log("Logout API error:", error);
  }

  return response;
}

// Force logout all sessions for a user (admin only)
export async function DELETE(request) {
  const auth = await requireAdmin(request);
  if (!auth.valid) return adminDenied(auth);

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
    console.log("Force logout API error:", error);
    return secureResponse(
      { success: false, message: "Force logout failed" },
      500
    );
  }
}
