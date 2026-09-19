import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { authenticateToken, secureResponse } from "@/lib/auth";
import { getSessionList } from "@/services/analyticsService";

export async function GET(request) {
  try {
    const authResult = authenticateToken(request);
    if (!authResult.valid) {
      return secureResponse(
        { error: "Authentication required to access sessions" },
        401
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days")) || 14;
    const limit = parseInt(searchParams.get("limit")) || 30;

    const rangeStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const sessions = await getSessionList({ limit, rangeStart });

    return secureResponse({ success: true, sessions });
  } catch (error) {
    return secureResponse({ error: "Failed to fetch sessions list" }, 500);
  }
}
