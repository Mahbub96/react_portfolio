import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// Create a schema for logout events
const LogoutEventSchema = new mongoose.Schema({
  username: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userAgent: { type: String },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Use existing connection or create new one
let LogoutEvent;
try {
  LogoutEvent = mongoose.model("LogoutEvent");
} catch {
  LogoutEvent = mongoose.model("LogoutEvent", LogoutEventSchema);
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { username, timestamp, userAgent, ip } = body;

    // Log logout event
    const logoutEvent = new LogoutEvent({
      username,
      timestamp: new Date(timestamp),
      userAgent,
      ip,
    });

    await logoutEvent.save();

    return NextResponse.json(
      { success: true, message: "Logout tracked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
