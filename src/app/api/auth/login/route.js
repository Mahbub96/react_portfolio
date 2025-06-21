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

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { username, timestamp, userAgent, ip } = body;

    // Validate credentials
    if (username === "admin") {
      // Log successful login
      const loginAttempt = new LoginAttempt({
        username,
        timestamp: new Date(timestamp),
        userAgent,
        ip,
        success: true,
      });

      await loginAttempt.save();

      return NextResponse.json(
        { success: true, message: "Login successful" },
        { status: 200 }
      );
    } else {
      // Log failed login attempt
      const loginAttempt = new LoginAttempt({
        username,
        timestamp: new Date(timestamp),
        userAgent,
        ip,
        success: false,
      });

      await loginAttempt.save();

      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
