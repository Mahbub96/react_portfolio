import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { secureResponse } from "@/lib/auth";
import { requireAdmin } from "@/lib/adminSession";
import { getLiveSessions } from "@/services/analyticsService";

export async function GET(request) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.valid) {
      return secureResponse(
        { error: "Authentication required to access live analytics" },
        401
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const windowMinutes = parseInt(searchParams.get("window")) || 5;

    const liveVisitors = await getLiveSessions(windowMinutes);

    return secureResponse({
      success: true,
      count: liveVisitors.length,
      liveVisitors,
    });
  } catch (error) {
    return secureResponse({ error: "Failed to fetch live visitors" }, 500);
  }
}
