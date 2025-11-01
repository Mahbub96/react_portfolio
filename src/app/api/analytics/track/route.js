import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { secureResponse } from "@/lib/auth";
import { getIPAndGeolocation } from "@/services/ipGeolocation";
import { saveAnalyticsRecord } from "@/services/analyticsService";

export async function POST(request) {
  try {
    const data = await request.json();

    await connectDB();

    // Get IP and geolocation using service
    const { ip, country, city, region } = await getIPAndGeolocation(request);

    // Sanitize componentsInteracted to ensure component is always a string
    const sanitizeComponents = (components) => {
      if (!Array.isArray(components)) return [];
      return components
        .map((comp) => {
          if (!comp || typeof comp !== "object") return comp;
          return {
            ...comp,
            component:
              typeof comp.component === "string"
                ? comp.component
                : comp.component?.toString?.() ||
                  JSON.stringify(comp.component || {}).substring(0, 100) ||
                  "unknown",
            interactionType:
              typeof comp.interactionType === "string"
                ? comp.interactionType
                : "click",
            timestamp: comp.timestamp || new Date(),
          };
        })
        .filter(Boolean);
    };

    // Prepare final data with sanitized components and geolocation
    const finalData = {
      ...data,
      ip,
      country: country || "Unknown",
      city: city || "Unknown",
      region: region || "Unknown",
      componentsInteracted: sanitizeComponents(
        data.componentsInteracted || []
      ).slice(-100),
      clickPositions: (data.clickPositions || []).slice(-50),
      mousePositions: (data.mousePositions || []).slice(-100),
      // Enhanced: Store aggregated interactions and timeline for efficient querying
      aggregatedInteractions: Array.isArray(data.aggregatedInteractions)
        ? data.aggregatedInteractions.slice(-50) // Last 50 aggregated components
        : [],
      interactionTimeline: Array.isArray(data.interactionTimeline)
        ? data.interactionTimeline.slice(-100) // Last 100 timeline events
        : [],
      idlePeriods: Array.isArray(data.idlePeriods)
        ? data.idlePeriods.slice(-20) // Last 20 idle periods
        : [],
      activeTime: data.activeTime || 0,
    };

    // Use analytics service to save record
    await saveAnalyticsRecord(finalData);

    return secureResponse({ success: true });
  } catch (error) {
    // In production, log to an error tracking service, but don't expose details
    return secureResponse({ error: "Failed to track analytics" }, 500);
  }
}

export async function GET(request) {
  try {
    // For now, return basic acknowledgment
    // Detailed analytics retrieval will be in a separate endpoint
    return secureResponse({
      message: "Analytics tracking endpoint",
      method: "Use POST to track analytics data",
    });
  } catch (error) {
    // In production, log to an error tracking service, but don't expose details
    return secureResponse(
      { error: "Failed to access analytics endpoint" },
      500
    );
  }
}
