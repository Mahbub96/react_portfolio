import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Visitor from "@/models/Visitor";

export async function POST(request) {
  try {
    const { ip, userAgent, page, country, city, region, timezone } =
      await request.json();

    await connectDB();

    const visitor = new Visitor({
      ip,
      userAgent,
      page,
      country,
      city,
      region,
      timezone,
    });

    await visitor.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    return NextResponse.json(
      { error: "Failed to track visitor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    // Get visitor statistics
    const totalVisitors = await Visitor.countDocuments();
    const todayVisitors = await Visitor.countDocuments({
      timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    const pageStats = await Visitor.aggregate([
      {
        $group: {
          _id: "$page",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      totalVisitors,
      todayVisitors,
      pageStats,
    });
  } catch (error) {
    console.error("Error fetching visitor stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitor statistics" },
      { status: 500 }
    );
  }
}
