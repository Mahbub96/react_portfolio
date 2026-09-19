import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { secureResponse } from "@/lib/auth";
import { getIPAndGeolocation } from "@/services/ipGeolocation";
import { saveBatchEvents } from "@/services/analyticsService";

export async function POST(request) {
  try {
    const body = await request.json();
    let events = [];

    if (Array.isArray(body)) {
      events = body;
    } else if (body && Array.isArray(body.events)) {
      events = body.events;
    } else if (body && typeof body === "object") {
      events = [body];
    }

    if (events.length === 0) {
      return secureResponse({ success: true, insertedCount: 0 });
    }

    // Discard tracking events from logged-in admin users
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return secureResponse({ success: true, insertedCount: 0, ignored: "authenticated_user" });
    }

    // Cap single ingestion batch to 100 events max
    const limitedEvents = events.slice(0, 100);

    await connectDB();

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
    return secureResponse({ error: "Failed to process analytics event" }, 500);
  }
}

export async function GET() {
  return secureResponse({
    endpoint: "Analytics Events Ingestion API",
    method: "POST",
    format: "single event object or array of events",
  });
}
