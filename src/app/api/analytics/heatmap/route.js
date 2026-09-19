import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { authenticateToken, secureResponse } from "@/lib/auth";
import { getMultiModeHeatmapData } from "@/services/analyticsService";

export async function GET(request) {
  try {
    const authResult = authenticateToken(request);
    if (!authResult.valid) {
      return secureResponse(
        { error: "Authentication required to access heatmap" },
        401
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "click"; // click, hover, movement, scroll
    const days = parseInt(searchParams.get("days")) || 14;

    const rangeStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const points = await getMultiModeHeatmapData(mode, rangeStart);

    return secureResponse({ success: true, mode, points });
  } catch (error) {
    return secureResponse({ error: "Failed to fetch heatmap data" }, 500);
  }
}
