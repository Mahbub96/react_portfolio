/**
 * Analytics Service
 * Handles all analytics database operations and aggregations
 */

import Analytics from "@/models/Analytics";

/**
 * Save or update analytics record
 */
export async function saveAnalyticsRecord(data) {
  const updateFields = {
    mouseEvents: data.mouseEvents || {},
    keyboardEvents: data.keyboardEvents || {},
    timeOnPage: data.timeOnPage || 0,
    exitTimestamp: data.exitTimestamp || null,
    mouseHoldDuration: data.mouseHoldDuration || 0,
    totalClicksOnPage: data.totalClicksOnPage || 0,
    totalScrollDistance: data.totalScrollDistance || 0,
    maxScrollDepth: data.maxScrollDepth || 0,
    browserEvents: data.browserEvents || {},
    visibilityEvents: data.visibilityEvents || {},
    timestamp: new Date(),
    ip: data.ip || "unknown",
    country: data.country || "Unknown",
    city: data.city || "Unknown",
    region: data.region || "Unknown",
    userAgent: data.userAgent || "",
    deviceType: data.deviceType || "unknown",
    screenResolution: data.screenResolution || "",
    viewport: data.viewport || "",
    platform: data.platform || "",
    language: data.language || "",
    referrer: data.referrer || "direct",
    timezone: data.timezone || "",
    componentsInteracted: data.componentsInteracted || [],
    clickPositions: data.clickPositions || [],
    mousePositions: data.mousePositions || [],
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

  return await Analytics.findOneAndUpdate(
    {
      sessionId: data.sessionId,
      page: data.page,
    },
    {
      $set: updateFields,
      $setOnInsert: {
        entryTimestamp: data.entryTimestamp || new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );
}

/**
 * Get analytics statistics for a date range
 */
export async function getAnalyticsStats(days = 14) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rangeStart = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  const previousPeriodStart = new Date(
    rangeStart.getTime() - days * 24 * 60 * 60 * 1000
  );

  // Get country statistics with cities
  const countryStats = await Analytics.aggregate([
    {
      $match: {
        timestamp: { $gte: rangeStart },
      },
    },
    {
      $group: {
        _id: { $ifNull: ["$country", "Unknown"] },
        sessions: { $sum: 1 },
        pageViews: { $sum: 1 },
        users: { $addToSet: "$sessionId" },
        clicks: { $sum: "$totalClicksOnPage" },
        avgTimeOnPage: { $avg: "$timeOnPage" },
        cities: { $addToSet: { $ifNull: ["$city", "Unknown"] } },
      },
    },
    {
      $project: {
        country: "$_id",
        sessions: 1,
        pageViews: 1,
        users: { $size: "$users" },
        clicks: 1,
        avgTimeOnPage: 1,
        cities: {
          $filter: {
            input: "$cities",
            as: "city",
            cond: { $ne: ["$$city", "Unknown"] },
          },
        },
      },
    },
    { $sort: { sessions: -1 } },
  ]);

  // Get previous period for trends
  const previousCountryStats = await Analytics.aggregate([
    {
      $match: {
        timestamp: { $gte: previousPeriodStart, $lt: rangeStart },
      },
    },
    {
      $group: {
        _id: { $ifNull: ["$country", "Unknown"] },
        sessions: { $sum: 1 },
        pageViews: { $sum: 1 },
        users: { $addToSet: "$sessionId" },
        clicks: { $sum: "$totalClicksOnPage" },
      },
    },
    {
      $project: {
        country: "$_id",
        sessions: 1,
        pageViews: 1,
        users: { $size: "$users" },
        clicks: 1,
      },
    },
  ]);

  // Calculate trends
  const previousStatsMap = {};
  previousCountryStats.forEach((stat) => {
    previousStatsMap[stat.country] = stat;
  });

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const countryStatsWithTrends = countryStats.map((current) => {
    const previous = previousStatsMap[current.country] || {
      sessions: 0,
      pageViews: 0,
      users: 0,
      clicks: 0,
    };

    return {
      ...current,
      trendSessions: calculateTrend(current.sessions, previous.sessions),
      trendPageViews: calculateTrend(current.pageViews, previous.pageViews),
      trendUsers: calculateTrend(current.users, previous.users),
      trendClicks: calculateTrend(current.clicks, previous.clicks),
    };
  });

  return {
    countries: countryStatsWithTrends,
    rangeStart,
    today,
    previousPeriodStart,
  };
}

/**
 * Get component interaction statistics
 */
export async function getComponentStats(rangeStart) {
  return await Analytics.aggregate([
    {
      $match: {
        timestamp: { $gte: rangeStart },
      },
    },
    {
      $unwind: {
        path: "$componentsInteracted",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$componentsInteracted.component",
        interactions: { $sum: 1 },
      },
    },
    { $sort: { interactions: -1 } },
    { $limit: 20 },
  ]);
}

/**
 * Get mouse and keyboard event statistics
 */
export async function getEventStats() {
  const [mouseStats, keyboardStats] = await Promise.all([
    Analytics.aggregate([
      {
        $group: {
          _id: null,
          totalClicks: { $sum: "$mouseEvents.clicks" },
          totalMoves: { $sum: "$mouseEvents.moves" },
          totalScrolls: { $sum: "$mouseEvents.scrolls" },
          avgTimeOnPage: { $avg: "$timeOnPage" },
          avgMouseHoldDuration: { $avg: "$mouseHoldDuration" },
          avgScrollDepth: { $avg: "$maxScrollDepth" },
          totalClicksOnPage: { $sum: "$totalClicksOnPage" },
        },
      },
    ]),
    Analytics.aggregate([
      {
        $group: {
          _id: null,
          totalKeyPresses: { $sum: "$keyboardEvents.keyPresses" },
          totalKeyDowns: { $sum: "$keyboardEvents.keyDowns" },
          totalKeyUps: { $sum: "$keyboardEvents.keyUps" },
        },
      },
    ]),
  ]);

  return {
    mouseEvents: mouseStats[0] || {
      totalClicks: 0,
      totalMoves: 0,
      totalScrolls: 0,
      avgTimeOnPage: 0,
      avgMouseHoldDuration: 0,
      avgScrollDepth: 0,
      totalClicksOnPage: 0,
    },
    keyboardEvents: keyboardStats[0] || {
      totalKeyPresses: 0,
      totalKeyDowns: 0,
      totalKeyUps: 0,
    },
  };
}

/**
 * Get device statistics
 */
export async function getDeviceStats(rangeStart) {
  return await Analytics.aggregate([
    {
      $match: {
        timestamp: { $gte: rangeStart },
      },
    },
    {
      $group: {
        _id: "$deviceType",
        count: { $sum: 1 },
        pageViews: { $sum: 1 },
        users: { $addToSet: "$sessionId" },
        sessions: { $sum: 1 },
      },
    },
    {
      $project: {
        device: "$_id",
        count: 1,
        pageViews: 1,
        users: { $size: "$users" },
        sessions: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
}

/**
 * Get medium/traffic source statistics with trends
 */
export async function getMediumStats(rangeStart, previousPeriodStart) {
  // Current period medium stats
  const mediumStats = await Analytics.aggregate([
    {
      $match: {
        timestamp: { $gte: rangeStart },
        referrer: { $exists: true, $ne: null, $ne: "" },
      },
    },
    {
      $addFields: {
        medium: {
          $cond: {
            if: { $eq: ["$referrer", "direct"] },
            then: "direct",
            else: {
              $cond: {
                if: { $regexMatch: { input: "$referrer", regex: /google/i } },
                then: "organic",
                else: {
                  $cond: {
                    if: {
                      $regexMatch: {
                        input: "$referrer",
                        regex: /(cpc|ads|adwords)/i,
                      },
                    },
                    then: "cpc",
                    else: {
                      $cond: {
                        if: {
                          $regexMatch: {
                            input: "$referrer",
                            regex: /(facebook|twitter|linkedin|instagram)/i,
                          },
                        },
                        then: "social",
                        else: "referral",
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
        _id: "$medium",
        pageViews: { $sum: 1 },
        users: { $addToSet: "$sessionId" },
        sessions: { $sum: 1 },
        clicks: { $sum: "$totalClicksOnPage" },
      },
    },
    {
      $project: {
        medium: { $ifNull: ["$_id", ""] },
        pageViews: 1,
        users: { $size: "$users" },
        sessions: 1,
        clicks: 1,
      },
    },
    { $sort: { pageViews: -1 } },
  ]);

  // Previous period for trends
  const previousMediumStats = await Analytics.aggregate([
    {
      $match: {
        timestamp: { $gte: previousPeriodStart, $lt: rangeStart },
        referrer: { $exists: true, $ne: null, $ne: "" },
      },
    },
    {
      $addFields: {
        medium: {
          $cond: {
            if: { $eq: ["$referrer", "direct"] },
            then: "direct",
            else: {
              $cond: {
                if: { $regexMatch: { input: "$referrer", regex: /google/i } },
                then: "organic",
                else: {
                  $cond: {
                    if: {
                      $regexMatch: {
                        input: "$referrer",
                        regex: /(cpc|ads|adwords)/i,
                      },
                    },
                    then: "cpc",
                    else: {
                      $cond: {
                        if: {
                          $regexMatch: {
                            input: "$referrer",
                            regex: /(facebook|twitter|linkedin|instagram)/i,
                          },
                        },
                        then: "social",
                        else: "referral",
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
        _id: "$medium",
        pageViews: { $sum: 1 },
        users: { $addToSet: "$sessionId" },
        sessions: { $sum: 1 },
        clicks: { $sum: "$totalClicksOnPage" },
      },
    },
  ]);

  // Calculate trends
  const previousMap = {};
  previousMediumStats.forEach((stat) => {
    previousMap[stat._id || ""] = stat;
  });

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const mediumsWithTrends = mediumStats.map((current) => {
    const previous = previousMap[current.medium || ""] || {
      pageViews: 0,
      users: 0,
      sessions: 0,
      clicks: 0,
    };

    return {
      ...current,
      trendPageViews: calculateTrend(current.pageViews, previous.pageViews),
      trendUsers: calculateTrend(current.users, previous.users),
      trendSessions: calculateTrend(current.sessions, previous.sessions),
      trendClicks: calculateTrend(current.clicks, previous.clicks),
    };
  });

  // Add direct traffic if not already included
  const directTraffic = await Analytics.aggregate([
    {
      $match: {
        timestamp: { $gte: rangeStart },
        $or: [
          { referrer: { $exists: false } },
          { referrer: null },
          { referrer: "" },
          { referrer: "direct" },
        ],
      },
    },
    {
      $group: {
        _id: null,
        pageViews: { $sum: 1 },
        users: { $addToSet: "$sessionId" },
        sessions: { $sum: 1 },
        clicks: { $sum: "$totalClicksOnPage" },
      },
    },
  ]);

  if (
    directTraffic.length > 0 &&
    !mediumsWithTrends.find((m) => !m.medium || m.medium === "")
  ) {
    const direct = directTraffic[0];
    const previousDirect = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: previousPeriodStart, $lt: rangeStart },
          $or: [
            { referrer: { $exists: false } },
            { referrer: null },
            { referrer: "" },
            { referrer: "direct" },
          ],
        },
      },
      {
        $group: {
          _id: null,
          pageViews: { $sum: 1 },
          users: { $addToSet: "$sessionId" },
          sessions: { $sum: 1 },
          clicks: { $sum: "$totalClicksOnPage" },
        },
      },
    ]);

    const prev = previousDirect[0] || {
      pageViews: 0,
      users: 0,
      sessions: 0,
      clicks: 0,
    };

    const directUsers = Array.isArray(direct.users) ? direct.users.length : 0;
    const prevUsers = Array.isArray(prev.users) ? prev.users.length : 0;

    mediumsWithTrends.push({
      medium: "",
      pageViews: direct.pageViews,
      users: directUsers,
      sessions: direct.sessions,
      clicks: direct.clicks,
      trendPageViews: calculateTrend(direct.pageViews, prev.pageViews),
      trendUsers: calculateTrend(directUsers, prevUsers),
      trendSessions: calculateTrend(direct.sessions, prev.sessions),
      trendClicks: calculateTrend(direct.clicks, prev.clicks),
    });
  }

  return mediumsWithTrends;
}

/**
 * Get daily statistics
 */
export async function getDailyStats(rangeStart, previousPeriodStart) {
  // Current period daily stats
  const dailyStats = await Analytics.aggregate([
    {
      $match: {
        timestamp: { $gte: rangeStart },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        sessions: { $sum: 1 },
        pageViews: { $sum: 1 },
        users: { $addToSet: "$sessionId" },
      },
    },
    {
      $project: {
        date: "$_id",
        sessions: 1,
        pageViews: 1,
        users: { $size: "$users" },
      },
    },
    { $sort: { date: 1 } },
  ]);

  // Previous period totals for trends
  const previousDailyStats = await Analytics.aggregate([
    {
      $match: {
        timestamp: { $gte: previousPeriodStart, $lt: rangeStart },
      },
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalPageViews: { $sum: 1 },
        totalUsers: { $addToSet: "$sessionId" },
      },
    },
    {
      $project: {
        sessions: "$totalSessions",
        pageViews: "$totalPageViews",
        users: { $size: "$totalUsers" },
      },
    },
  ]);

  // Calculate current totals
  const currentTotals = dailyStats.reduce(
    (acc, day) => ({
      sessions: acc.sessions + day.sessions,
      pageViews: acc.pageViews + day.pageViews,
      users: acc.users + day.users,
    }),
    { sessions: 0, pageViews: 0, users: 0 }
  );

  const previousTotals = previousDailyStats[0] || {
    sessions: 0,
    pageViews: 0,
    users: 0,
  };

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    daily: dailyStats,
    trends: {
      sessions: {
        current: currentTotals.sessions,
        previous: previousTotals.sessions,
        trend: calculateTrend(currentTotals.sessions, previousTotals.sessions),
      },
      pageViews: {
        current: currentTotals.pageViews,
        previous: previousTotals.pageViews,
        trend: calculateTrend(
          currentTotals.pageViews,
          previousTotals.pageViews
        ),
      },
      users: {
        current: currentTotals.users,
        previous: previousTotals.users,
        trend: calculateTrend(currentTotals.users, previousTotals.users),
      },
    },
  };
}

/**
 * Get basic record counts
 */
export async function getRecordCounts() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [total, todayCount, weekCount, monthCount] = await Promise.all([
    Analytics.countDocuments(),
    Analytics.countDocuments({ timestamp: { $gte: today } }),
    Analytics.countDocuments({ timestamp: { $gte: weekAgo } }),
    Analytics.countDocuments({ timestamp: { $gte: monthAgo } }),
  ]);

  return {
    totalRecords: total,
    todayRecords: todayCount,
    thisWeekRecords: weekCount,
    thisMonthRecords: monthCount,
  };
}
