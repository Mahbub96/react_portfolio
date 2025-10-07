import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";
import { authenticateToken, secureResponse } from "@/lib/auth";
import { hasPermission } from "@/config/admin";

// Cache duration in seconds
const CACHE_DURATION = 3600; // 1 hour

export async function GET() {
  try {
    await connectDB();

    const portfolioData = await PortfolioData.find({}).lean();

    // Transform data to match the expected structure
    const transformedData = {};
    portfolioData.forEach((item) => {
      transformedData[item.collectionName] = {
        data: item.data,
        lastUpdate: item.lastUpdate,
      };
    });

    // Set cache headers for better performance
    const response = secureResponse(transformedData);
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`
    );
    response.headers.set("Content-Type", "application/json");

    return response;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return secureResponse(
      { error: "Failed to fetch portfolio data" },
      500
    );
  }
}

export async function POST(request) {
  try {
    // Authenticate user
    const authResult = authenticateToken(request);
    if (!authResult.valid) {
      return secureResponse(
        { error: "Authentication required" },
        401
      );
    }

    // Check if user has write permission
    if (!hasPermission(authResult.user.role, 'write:portfolio')) {
      return secureResponse(
        { error: "Insufficient permissions" },
        403
      );
    }

    const body = await request.json();
    const { collectionName, newItem } = body;

    // Input validation
    if (!collectionName || !newItem) {
      return secureResponse(
        { error: "Collection name and new item are required" },
        400
      );
    }

    // Validate collection name
    const allowedCollections = ['Skills', 'Projects', 'Education', 'Experience', 'Contact'];
    if (!allowedCollections.includes(collectionName)) {
      return secureResponse(
        { error: "Invalid collection name" },
        400
      );
    }

    // Check if domain is mahbub.dev for admin operations
    const hostname = request.headers.get("host");
    const isAdminDomain =
      hostname === "mahbub.dev" || hostname === "localhost:3000";

    if (!isAdminDomain) {
      return secureResponse(
        { error: "Data add/update is only allowed on mahbub.dev domain." },
        403
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
        return secureResponse(
          { error: `Skill "${newItem.name}" already exists` },
          400
        );
      }
    }

    // Sanitize new item data
    const sanitizedItem = sanitizePortfolioItem(newItem);

    // Add new item with ID and metadata
    const itemWithId = {
      ...sanitizedItem,
      id: `${collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: authResult.user.username,
      lastModifiedBy: authResult.user.username,
    };

    // Update or create the document
    await PortfolioData.findOneAndUpdate(
      { collectionName },
      {
        $push: { data: itemWithId },
        lastUpdate: new Date(),
        lastModifiedBy: authResult.user.username,
      },
      { upsert: true, new: true }
    );

    // Clear cache by setting no-cache headers
    const response = secureResponse({ id: itemWithId.id });
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );

    return response;
  } catch (error) {
    console.error("Error adding item:", error);
    return secureResponse(
      { error: "Failed to add item" },
      500
    );
  }
}

// Helper function to sanitize portfolio items
function sanitizePortfolioItem(item) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(item)) {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters and scripts
      sanitized[key] = value
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .replace(/data:/gi, '')
        .trim();
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizePortfolioItem(value);
    } else {
      // Keep other types as is
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
