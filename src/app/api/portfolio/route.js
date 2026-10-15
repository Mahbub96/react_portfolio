import { secureResponse } from "@/lib/auth";
import { requireAdmin, adminDenied, hasAdminCookie } from "@/lib/adminSession";
import { hasPermission } from "@/config/admin";
import { getPortfolioData } from "@/lib/getPortfolioData";
import {
  createItem,
  updateSingleton,
  PortfolioError,
  normalizeCollectionName,
} from "@/lib/portfolio/portfolioService";
import { isSingletonCollection } from "@/lib/portfolio/schemas";

// Cache duration in seconds for public responses
const CACHE_DURATION = 3600; // 1 hour

export async function GET(request) {
  try {
    const hasAdmin = hasAdminCookie(request);
    const portfolioData = await getPortfolioData({ includeHidden: hasAdmin });

    const response = secureResponse(portfolioData);
    if (hasAdmin) {
      response.headers.set(
        "Cache-Control",
        "private, no-cache, no-store, must-revalidate"
      );
    } else {
      response.headers.set(
        "Cache-Control",
        `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`
      );
    }
    response.headers.set("Content-Type", "application/json");

    return response;
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return secureResponse({ error: "Failed to fetch portfolio data" }, 500);
  }
}

export async function POST(request) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.valid) {
      return adminDenied(authResult);
    }

    if (!hasPermission(authResult.user.role, "write:portfolio")) {
      return secureResponse({ error: "Insufficient permissions" }, 403);
    }

    const body = await request.json().catch(() => ({}));
    const { collectionName: rawCol, newItem } = body;

    if (!rawCol || !newItem) {
      return secureResponse({ error: "Collection name and new item are required" }, 400);
    }

    const collectionName = normalizeCollectionName(rawCol);

    let result;
    if (isSingletonCollection(collectionName)) {
      result = await updateSingleton(collectionName, newItem, authResult.user.username);
    } else {
      result = await createItem(collectionName, newItem, authResult.user.username);
    }

    const response = secureResponse({ success: true, ...result });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response;
  } catch (error) {
    if (error instanceof PortfolioError) {
      return secureResponse({ error: error.message }, error.status);
    }
    console.error("Error adding portfolio item:", error);
    return secureResponse({ error: error.message || "Failed to add item" }, 500);
  }
}
