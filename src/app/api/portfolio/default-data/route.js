import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureDefaultData } from "@/lib/defaultDataLoader";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "Default data endpoint ready",
    });
  } catch (error) {
    console.error("Error checking default data status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check database status" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Check if domain is mahbub.dev for admin operations
    const hostname = request.headers.get("host");
    const isAdminDomain =
      hostname === "mahbub.dev" || hostname === "localhost:3000";

    if (!isAdminDomain) {
      return NextResponse.json(
        {
          error:
            "Default data population is only allowed on mahbub.dev domain.",
        },
        { status: 403 }
      );
    }

    // Populate default data
    const results = await ensureDefaultData();

    return NextResponse.json({
      success: true,
      message: "Default data population completed",
      results,
    });
  } catch (error) {
    console.error("Error populating default data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to populate default data" },
      { status: 500 }
    );
  }
}
