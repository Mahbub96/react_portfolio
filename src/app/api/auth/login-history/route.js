import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// Create a schema for login attempts
const LoginAttemptSchema = new mongoose.Schema({
  username: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userAgent: { type: String },
  ip: { type: String },
  success: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Use existing connection or create new one
let LoginAttempt;
try {
  LoginAttempt = mongoose.model("LoginAttempt");
} catch {
  LoginAttempt = mongoose.model("LoginAttempt", LoginAttemptSchema);
}

export async function GET(request) {
  try {
    await connectDB();

    // Get login attempts from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const loginAttempts = await LoginAttempt.find({
      createdAt: { $gte: thirtyDaysAgo },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Get statistics
    const totalAttempts = await LoginAttempt.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const successfulLogins = await LoginAttempt.countDocuments({
      success: true,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const failedLogins = await LoginAttempt.countDocuments({
      success: false,
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get recent successful logins
    const recentSuccessfulLogins = await LoginAttempt.find({
      success: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        loginAttempts,
        statistics: {
          totalAttempts,
          successfulLogins,
          failedLogins,
          successRate:
            totalAttempts > 0
              ? ((successfulLogins / totalAttempts) * 100).toFixed(1)
              : 0,
        },
        recentSuccessfulLogins,
      },
    });
  } catch (error) {
    console.error("Login history API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
