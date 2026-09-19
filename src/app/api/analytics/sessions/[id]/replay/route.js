import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { authenticateToken, secureResponse } from "@/lib/auth";
import { getSessionReplayData } from "@/services/analyticsService";

export async function GET(request, { params }) {
  try {
    const authResult = authenticateToken(request);
    if (!authResult.valid) {
      return secureResponse(
        { error: "Authentication required to access session replay" },
        401
      );
    }

    const { id } = params;
    if (!id) {
      return secureResponse({ error: "Session ID required" }, 400);
    }

    await connectDB();

    const replayData = await getSessionReplayData(id);
    if (!replayData) {
      return secureResponse({ error: "Session replay data not found" }, 404);
    }

    return secureResponse({ success: true, ...replayData });
  } catch (error) {
    return secureResponse({ error: "Failed to fetch session replay data" }, 500);
  }
}
