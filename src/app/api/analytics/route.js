import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Analytics from "@/models/Analytics";
import { authenticateToken, secureResponse } from "@/lib/auth";
import {
  getAnalyticsStats,
  getComponentStats,
  getEventStats,
  getDeviceStats,
  getMediumStats,
  getDailyStats,
  getRecordCounts,
} from "@/services/analyticsService";

export async function GET(request) {
  try {
    // Authenticate user for analytics access
    const authResult = authenticateToken(request);
    if (!authResult.valid) {
      return secureResponse(
        { error: "Authentication required to access analytics" },
        401
      );
    }

    await connectDB();

    // Get time range from query params (default: 14 days)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days")) || 14;

    // Use service functions for all aggregations
    const [
      recordCounts,
      eventStats,
      countryStatsData,
      componentStatsData,
      deviceStatsData,
      mediumStatsData,
      dailyStatsData,
    ] = await Promise.all([
      getRecordCounts(),
      getEventStats(),
      getAnalyticsStats(days),
      getComponentStats(
        new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000)
      ),
      getDeviceStats(
        new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000)
      ),
      getMediumStats(
        new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000),
        new Date(new Date().getTime() - days * 2 * 24 * 60 * 60 * 1000)
      ),
      getDailyStats(
        new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000),
        new Date(new Date().getTime() - days * 2 * 24 * 60 * 60 * 1000)
      ),
    ]);

    const { countries, rangeStart, today } = countryStatsData;
    const { daily, trends: dailyTrends } = dailyStatsData;

    // Get additional stats
    const [pageStats, browserStats, hourlyStats, sessionStats, recentRecords] =
      await Promise.all([
        // Page statistics
        Analytics.aggregate([
          {
            $group: {
              _id: "$page",
              visits: { $sum: 1 },
              avgTimeOnPage: { $avg: "$timeOnPage" },
              totalClicks: { $sum: "$totalClicksOnPage" },
              avgScrollDepth: { $avg: "$maxScrollDepth" },
            },
          },
          { $sort: { visits: -1 } },
          { $limit: 10 },
        ]),
        // Browser statistics
        Analytics.aggregate([
          {
            $addFields: {
              browser: {
                $cond: {
                  if: {
                    $regexMatch: { input: "$userAgent", regex: /Chrome/i },
                  },
                  then: "Chrome",
                  else: {
                    $cond: {
                      if: {
                        $regexMatch: { input: "$userAgent", regex: /Firefox/i },
                      },
                      then: "Firefox",
                      else: {
                        $cond: {
                          if: {
                            $regexMatch: {
                              input: "$userAgent",
                              regex: /Safari/i,
                            },
                          },
                          then: "Safari",
                          else: {
                            $cond: {
                              if: {
                                $regexMatch: {
                                  input: "$userAgent",
                                  regex: /Edge/i,
                                },
                              },
                              then: "Edge",
                              else: "Other",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          {
            $group: {
              _id: "$browser",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ]),
        // Hourly statistics
        Analytics.aggregate([
          {
            $match: {
              timestamp: { $gte: today },
            },
          },
          {
            $group: {
              _id: { $hour: "$timestamp" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        // Session statistics
        Analytics.aggregate([
          {
            $group: {
              _id: "$sessionId",
              pages: { $sum: 1 },
              totalTime: { $sum: "$timeOnPage" },
              totalClicks: { $sum: "$totalClicksOnPage" },
            },
          },
          {
            $group: {
              _id: null,
              totalSessions: { $sum: 1 },
              avgPagesPerSession: { $avg: "$pages" },
              avgSessionDuration: { $avg: "$totalTime" },
              avgClicksPerSession: { $avg: "$totalClicks" },
            },
          },
        ]),
        // Recent records
        Analytics.find().sort({ timestamp: -1 }).limit(20).lean(),
      ]);

    // Format component stats
    const formattedComponentStats = componentStatsData.map((stat) => ({
      component: stat._id || "unknown",
      interactions: stat.interactions,
    }));

    // Prepare response data - format all stats for response
    const formattedPageStats = pageStats.map((stat) => ({
      page: stat._id,
      visits: stat.visits,
      avgTimeOnPage: stat.avgTimeOnPage,
      totalClicks: stat.totalClicks,
      avgScrollDepth: stat.avgScrollDepth,
    }));

    const formattedBrowserStats = browserStats.map((stat) => ({
      browser: stat._id,
      count: stat.count,
    }));

    const formattedHourlyStats = hourlyStats.map((stat) => ({
      hour: stat._id,
      count: stat.count,
    }));

    const formattedSessionStats = sessionStats[0] || {
      totalSessions: 0,
      avgPagesPerSession: 0,
      avgSessionDuration: 0,
      avgClicksPerSession: 0,
    };

    return secureResponse({
      summary: recordCounts,
      mouseEvents: eventStats.mouseEvents,
      keyboardEvents: eventStats.keyboardEvents,
      pages: formattedPageStats,
      devices: deviceStatsData,
      browsers: formattedBrowserStats,
      mediums: mediumStatsData,
      countries: countries,
      components: formattedComponentStats,
      hourly: formattedHourlyStats,
      daily: daily,
      dailyTrends: dailyTrends,
      timeRange: {
        days,
        start: rangeStart.toISOString(),
        end: today.toISOString(),
      },
      sessions: formattedSessionStats,
      recent: recentRecords,
    });
  } catch (error) {
    // In production, log to an error tracking service, but don't expose details
    return secureResponse({ error: "Failed to fetch analytics" }, 500);
  }
}
