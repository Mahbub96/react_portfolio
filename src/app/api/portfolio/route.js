import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";

// Cache duration in seconds
const CACHE_DURATION = 3600; // 1 hour

export async function GET() {
  try {
    await connectDB();

    const portfolioData = await PortfolioData.find({}).lean();

    // Transform data to match the original Firebase structure
    const transformedData = {};
    portfolioData.forEach((item) => {
      transformedData[item.collectionName] = {
        data: item.data,
        lastUpdate: item.lastUpdate,
      };
    });

    // Set cache headers for better performance
    const response = NextResponse.json(transformedData);
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`
    );
    response.headers.set("Content-Type", "application/json");

    return response;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { collectionName, newItem } = await request.json();

    // Check if domain is mahbub.dev for admin operations
    const hostname = request.headers.get("host");
    const isAdminDomain =
      hostname === "mahbub.dev" || hostname === "localhost:3000";

    if (!isAdminDomain) {
      return NextResponse.json(
        { error: "Data add/update is only allowed on mahbub.dev domain." },
        { status: 403 }
      );
    }

    await connectDB();

    // Check for duplicates if it's a skill
    if (collectionName === "Skills") {
      const existingDoc = await PortfolioData.findOne({
        collectionName: "Skills",
      });
      if (
        existingDoc &&
        existingDoc.data.some(
          (skill) => skill.name.toLowerCase() === newItem.name.toLowerCase()
        )
      ) {
        return NextResponse.json(
          { error: `Skill "${newItem.name}" already exists` },
          { status: 400 }
        );
      }
    }

    // Add new item with ID
    const itemWithId = {
      ...newItem,
      id: `${collectionName}_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update or create the document
    await PortfolioData.findOneAndUpdate(
      { collectionName },
      {
        $push: { data: itemWithId },
        lastUpdate: new Date(),
      },
      { upsert: true, new: true }
    );

    // Clear cache by setting no-cache headers
    const response = NextResponse.json({ id: itemWithId.id });
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );

    return response;
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
