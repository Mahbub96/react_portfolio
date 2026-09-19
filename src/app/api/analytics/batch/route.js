import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { secureResponse } from "@/lib/auth";
import { getIPAndGeolocation } from "@/services/ipGeolocation";
import { saveBatchEvents } from "@/services/analyticsService";

export async function POST(request) {
  try {
    const body = await request.json();
    const events = Array.isArray(body) ? body : body?.events || [];

    if (!Array.isArray(events) || events.length === 0) {
      return secureResponse({ success: true, insertedCount: 0 });
    }

    // Protect against payload abuse (max 100 events per batch)
    const limitedEvents = events.slice(0, 100);

    await connectDB();

    // Get IP and geolocation using service
    const { ip, country, city, region } = await getIPAndGeolocation(request);
    const userAgent = request.headers.get("user-agent") || "";

    const result = await saveBatchEvents(limitedEvents, {
      ip,
      country: country || "Unknown",
      city: city || "Unknown",
      region: region || "Unknown",
      userAgent,
    });

    return secureResponse({ success: true, ...result });
  } catch (error) {
    // In production, silent fail or minimal error log
    return secureResponse({ error: "Failed to process analytics batch" }, 500);
  }
}

export async function GET() {
  return secureResponse({
    endpoint: "Analytics Batch Ingestion API",
    method: "POST",
    format: "{ events: [...] }",
  });
}
