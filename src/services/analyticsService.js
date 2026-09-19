/**
 * Analytics Service
 * Handles all analytics database operations and aggregations
 */

import Analytics from "@/models/Analytics";
import AnalyticsEvent from "@/models/AnalyticsEvent";

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

/**
 * Save batch events from analytics SDK and update session aggregates
 */
export async function saveBatchEvents(events, clientContext = {}) {
  if (!Array.isArray(events) || events.length === 0) {
    return { insertedCount: 0 };
  }

  const {
    ip = "unknown",
    country = "Unknown",
    city = "Unknown",
    region = "Unknown",
    deviceType = "unknown",
    browser = "unknown",
    os = "unknown",
    userAgent = "",
  } = clientContext;

  const validEvents = events
    .filter((e) => e && e.sessionId && e.eventType && e.page)
    .map((e) => {
      const devCtx = e.deviceContext || {};
      return {
        sessionId: String(e.sessionId),
        eventType: String(e.eventType),
        page: String(e.page),
        elementId: e.elementId ? String(e.elementId).substring(0, 150) : null,
        timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
        metadata: typeof e.metadata === "object" && e.metadata !== null ? e.metadata : {},
        deviceType: devCtx.deviceType || deviceType,
        browser: devCtx.browser || browser,
        os: devCtx.platform || os,
        country,
        city,
        ip,
      };
    });

  if (validEvents.length === 0) {
    return { insertedCount: 0 };
  }

  // Insert into granular time-series event store
  const insertedEvents = await AnalyticsEvent.insertMany(validEvents, {
    ordered: false,
  });

  // Group by session and page to update aggregate Analytics documents
  const sessionPageGroups = {};
  for (const ev of validEvents) {
    const key = `${ev.sessionId}:::${ev.page}`;
    if (!sessionPageGroups[key]) {
      sessionPageGroups[key] = {
        sessionId: ev.sessionId,
        page: ev.page,
        clicks: 0,
        moves: 0,
        scrolls: 0,
        maxScrollDepth: 0,
        components: [],
        clickPositions: [],
        mousePositions: [],
        deviceType: ev.deviceType,
        browser: ev.browser,
        os: ev.os,
      };
    }

    const grp = sessionPageGroups[key];
    if (ev.eventType === "click") {
      grp.clicks++;
      if (ev.metadata?.x != null && ev.metadata?.y != null) {
        grp.clickPositions.push({
          x: ev.metadata.x,
          y: ev.metadata.y,
          timestamp: ev.timestamp,
        });
      }
      if (ev.elementId) {
        grp.components.push({
          component: ev.elementId,
          interactionType: "click",
          timestamp: ev.timestamp,
          metadata: ev.metadata,
        });
      }
    } else if (ev.eventType === "hover") {
      if (ev.elementId) {
        grp.components.push({
          component: ev.elementId,
          interactionType: "hover",
          timestamp: ev.timestamp,
          metadata: ev.metadata,
        });
      }
    } else if (
      ev.eventType === "scroll" ||
      ev.eventType === "scroll_milestone" ||
      ev.eventType === "scroll_segment"
    ) {
      grp.scrolls++;
      const depth = Number(
        ev.metadata?.maxDepth ||
          ev.metadata?.scrollDepth ||
          ev.metadata?.milestone ||
          0
      );
      if (depth > grp.maxScrollDepth) {
        grp.maxScrollDepth = depth;
      }
    } else if (
      ev.eventType === "mouse_movement" ||
      ev.eventType === "mouse_segment"
    ) {
      grp.moves +=
        ev.metadata?.pointCount || ev.metadata?.points?.length || 1;
      if (Array.isArray(ev.metadata?.points)) {
        const isSegment = ev.eventType === "mouse_segment";
        ev.metadata.points.slice(0, 5).forEach((pt) => {
          const px = isSegment ? pt[1] : pt[0];
          const py = isSegment ? pt[2] : pt[1];
          if (px != null && py != null) {
            grp.mousePositions.push({
              x: px,
              y: py,
              timestamp: ev.timestamp,
            });
          }
        });
      }
    }
  }

  // Upsert session page records in parallel
  await Promise.allSettled(
    Object.values(sessionPageGroups).map((grp) => {
      const incOps = {};
      if (grp.clicks > 0) {
        incOps["mouseEvents.clicks"] = grp.clicks;
        incOps["totalClicksOnPage"] = grp.clicks;
      }
      if (grp.scrolls > 0) {
        incOps["mouseEvents.scrolls"] = grp.scrolls;
      }

      const updateOp = {
        $set: {
          timestamp: new Date(),
          ip,
          country,
          city,
          region,
          userAgent,
          deviceType: grp.deviceType || deviceType,
          platform: grp.os || os,
        },
        $setOnInsert: {
          entryTimestamp: new Date(),
        },
      };

      if (Object.keys(incOps).length > 0) {
        updateOp.$inc = incOps;
      }

      if (grp.maxScrollDepth > 0) {
        updateOp.$max = { maxScrollDepth: grp.maxScrollDepth };
      }

      const pushOps = {};
      if (grp.clickPositions.length > 0) {
        pushOps["clickPositions"] = {
          $each: grp.clickPositions.slice(0, 10),
          $slice: -50,
        };
      }
      if (grp.components.length > 0) {
        pushOps["componentsInteracted"] = {
          $each: grp.components.slice(0, 20),
          $slice: -100,
        };
      }
      if (Object.keys(pushOps).length > 0) {
        updateOp.$push = pushOps;
      }

      return Analytics.findOneAndUpdate(
        { sessionId: grp.sessionId, page: grp.page },
        updateOp,
        { upsert: true, new: true }
      );
    })
  );

  return { insertedCount: insertedEvents.length };
}

/**
 * Get scroll milestone funnel statistics
 */
export async function getScrollMilestoneStats(rangeStart) {
  const pipeline = [
    {
      $match: {
        eventType: "scroll_milestone",
        timestamp: { $gte: rangeStart },
      },
    },
    {
      $group: {
        _id: "$metadata.milestone",
        count: { $sum: 1 },
        sessions: { $addToSet: "$sessionId" },
      },
    },
    {
      $project: {
        milestone: "$_id",
        totalEvents: "$count",
        uniqueVisitors: { $size: "$sessions" },
      },
    },
    { $sort: { milestone: 1 } },
  ];

  const results = await AnalyticsEvent.aggregate(pipeline);
  return results.map((r) => ({
    milestone: Number(r.milestone) || 0,
    totalEvents: r.totalEvents,
    uniqueVisitors: r.uniqueVisitors,
  }));
}

/**
 * Get interaction heatmap coordinates (clicks & hover hot spots)
 */
export async function getInteractionHeatmap(rangeStart, limit = 200) {
  const pipeline = [
    {
      $match: {
        eventType: { $in: ["click", "hover"] },
        timestamp: { $gte: rangeStart },
        "metadata.x": { $exists: true },
        "metadata.y": { $exists: true },
      },
    },
    {
      $project: {
        x: "$metadata.x",
        y: "$metadata.y",
        eventType: 1,
        elementId: 1,
        page: 1,
        timestamp: 1,
      },
    },
    { $sort: { timestamp: -1 } },
    { $limit: limit },
  ];

  return await AnalyticsEvent.aggregate(pipeline);
}

/**
 * Get form interaction and abandonment funnel
 */
export async function getFormEngagementStats(rangeStart) {
  const pipeline = [
    {
      $match: {
        eventType: {
          $in: [
            "form_focus",
            "form_blur",
            "input_interaction",
            "form_error",
            "form_submit",
          ],
        },
        timestamp: { $gte: rangeStart },
      },
    },
    {
      $group: {
        _id: "$eventType",
        count: { $sum: 1 },
        uniqueSessions: { $addToSet: "$sessionId" },
        avgCharsTyped: { $avg: "$metadata.charsTyped" },
        avgBackspaces: { $avg: "$metadata.backspaces" },
        avgTypingDuration: { $avg: "$metadata.typingDurationMs" },
      },
    },
    {
      $project: {
        eventType: "$_id",
        count: 1,
        uniqueSessions: { $size: "$uniqueSessions" },
        avgCharsTyped: { $round: [{ $ifNull: ["$avgCharsTyped", 0] }, 1] },
        avgBackspaces: { $round: [{ $ifNull: ["$avgBackspaces", 0] }, 1] },
        avgTypingDuration: { $round: [{ $ifNull: ["$avgTypingDuration", 0] }, 0] },
      },
    },
  ];

  const results = await AnalyticsEvent.aggregate(pipeline);
  const map = {};
  results.forEach((r) => {
    map[r.eventType] = r;
  });

  return {
    formFocus: map["form_focus"] || { count: 0, uniqueSessions: 0 },
    inputTyping: map["input_interaction"] || {
      count: 0,
      uniqueSessions: 0,
      avgCharsTyped: 0,
      avgBackspaces: 0,
      avgTypingDuration: 0,
    },
    formError: map["form_error"] || { count: 0, uniqueSessions: 0 },
    formSubmit: map["form_submit"] || { count: 0, uniqueSessions: 0 },
  };
}

/**
 * Get popular interactive elements by click frequency & hover dwell
 */
export async function getPopularElementStats(rangeStart, limit = 15) {
  const pipeline = [
    {
      $match: {
        elementId: { $ne: null, $exists: true },
        timestamp: { $gte: rangeStart },
      },
    },
    {
      $group: {
        _id: "$elementId",
        clicks: {
          $sum: { $cond: [{ $eq: ["$eventType", "click"] }, 1, 0] },
        },
        hovers: {
          $sum: { $cond: [{ $eq: ["$eventType", "hover"] }, 1, 0] },
        },
        avgHoverDurationMs: {
          $avg: {
            $cond: [
              { $eq: ["$eventType", "hover"] },
              "$metadata.durationMs",
              null,
            ],
          },
        },
        uniqueUsers: { $addToSet: "$sessionId" },
      },
    },
    {
      $project: {
        elementId: "$_id",
        clicks: 1,
        hovers: 1,
        totalInteractions: { $add: ["$clicks", "$hovers"] },
        avgHoverDurationMs: {
          $round: [{ $ifNull: ["$avgHoverDurationMs", 0] }, 0],
        },
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
    { $sort: { totalInteractions: -1 } },
    { $limit: limit },
  ];

  return await AnalyticsEvent.aggregate(pipeline);
}

/**
 * Get recent session replays / event timeline
 */
export async function getRecentSessionReplays(limit = 10) {
  // Find recent distinct session IDs
  const recentSessions = await AnalyticsEvent.aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: "$sessionId",
        latestTimestamp: { $first: "$timestamp" },
        firstTimestamp: { $last: "$timestamp" },
        page: { $first: "$page" },
        deviceType: { $first: "$deviceType" },
        country: { $first: "$country" },
        eventCount: { $sum: 1 },
      },
    },
    { $sort: { latestTimestamp: -1 } },
    { $limit: limit },
  ]);

  if (recentSessions.length === 0) {
    return [];
  }

  const sessionIds = recentSessions.map((s) => s._id);

  // Fetch chronological events for these sessions
  const events = await AnalyticsEvent.find({
    sessionId: { $in: sessionIds },
  })
    .sort({ timestamp: 1 })
    .select("sessionId eventType page elementId timestamp metadata")
    .lean();

  const eventsBySession = {};
  events.forEach((ev) => {
    if (!eventsBySession[ev.sessionId]) {
      eventsBySession[ev.sessionId] = [];
    }
    eventsBySession[ev.sessionId].push(ev);
  });

  return recentSessions.map((s) => ({
    sessionId: s._id,
    page: s.page,
    deviceType: s.deviceType,
    country: s.country,
    latestTimestamp: s.latestTimestamp,
    firstTimestamp: s.firstTimestamp,
    durationMs:
      new Date(s.latestTimestamp).getTime() -
      new Date(s.firstTimestamp).getTime(),
    eventCount: s.eventCount,
    timeline: eventsBySession[s._id] || [],
  }));
}

/**
 * Get detailed session list with journey summaries and intelligence flags
 */
export async function getSessionList(filters = {}) {
  const { limit = 25, rangeStart } = filters;
  const matchStage = {};
  if (rangeStart) {
    matchStage.timestamp = { $gte: rangeStart };
  }

  const pipeline = [
    ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: "$sessionId",
        firstTimestamp: { $last: "$timestamp" },
        latestTimestamp: { $first: "$timestamp" },
        entryPage: { $last: "$page" },
        exitPage: { $first: "$page" },
        pages: { $addToSet: "$page" },
        deviceType: { $first: "$deviceType" },
        browser: { $first: "$browser" },
        os: { $first: "$os" },
        country: { $first: "$country" },
        city: { $first: "$city" },
        eventCount: { $sum: 1 },
        eventTypes: { $addToSet: "$eventType" },
      },
    },
    { $sort: { latestTimestamp: -1 } },
    { $limit: limit },
  ];

  const sessions = await AnalyticsEvent.aggregate(pipeline);

  return sessions.map((s) => {
    const types = s.eventTypes || [];
    const durationMs =
      new Date(s.latestTimestamp).getTime() -
      new Date(s.firstTimestamp).getTime();

    return {
      sessionId: s._id,
      entryPage: s.entryPage,
      exitPage: s.exitPage,
      pagesVisited: s.pages,
      pageCount: s.pages.length,
      deviceType: s.deviceType || "unknown",
      browser: s.browser || "unknown",
      os: s.os || "unknown",
      country: s.country || "Unknown",
      city: s.city || "Unknown",
      firstTimestamp: s.firstTimestamp,
      latestTimestamp: s.latestTimestamp,
      durationMs,
      durationFormatted: `${Math.round(durationMs / 1000)}s`,
      eventCount: s.eventCount,
      flags: {
        hasRageClick: types.includes("rage_click"),
        hasFormError: types.includes("form_error"),
        hasLongHover: types.includes("long_hover"),
        hasSubmission: types.includes("form_submit"),
        hasRapidScroll: types.includes("rapid_scroll"),
      },
    };
  });
}

/**
 * Get comprehensive replay data for an individual session
 */
export async function getSessionReplayData(sessionId) {
  if (!sessionId) return null;

  const events = await AnalyticsEvent.find({ sessionId })
    .sort({ timestamp: 1 })
    .lean();

  if (!events || events.length === 0) return null;

  const firstEvent = events[0];
  const lastEvent = events[events.length - 1];
  const durationMs =
    new Date(lastEvent.timestamp).getTime() -
    new Date(firstEvent.timestamp).getTime();

  // Extract journey steps (sequence of pages or key sections visited)
  const journeySteps = [];
  let currentStep = null;

  events.forEach((ev) => {
    if (ev.eventType === "page_view" || ev.eventType === "section_view") {
      const stepName =
        ev.eventType === "section_view"
          ? ev.metadata?.sectionId
            ? `#${ev.metadata.sectionId}`
            : ev.page
          : ev.page;

      if (!currentStep || currentStep.name !== stepName) {
        if (currentStep) {
          currentStep.dwellMs =
            new Date(ev.timestamp).getTime() - currentStep.startTimestamp;
        }
        currentStep = {
          name: stepName,
          type: ev.eventType,
          startTimestamp: new Date(ev.timestamp).getTime(),
          dwellMs: 0,
          interactions: 0,
          maxScrollDepth: 0,
        };
        journeySteps.push(currentStep);
      }
    } else if (currentStep) {
      currentStep.interactions++;
      if (
        ev.eventType === "scroll" ||
        ev.eventType === "scroll_milestone" ||
        ev.eventType === "scroll_segment"
      ) {
        const depth = Number(
          ev.metadata?.maxDepth ||
            ev.metadata?.scrollDepth ||
            ev.metadata?.milestone ||
            0
        );
        if (depth > currentStep.maxScrollDepth) {
          currentStep.maxScrollDepth = depth;
        }
      }
    }
  });

  if (currentStep) {
    currentStep.dwellMs =
      new Date(lastEvent.timestamp).getTime() - currentStep.startTimestamp;
  }

  // Count intelligence tags
  const eventTypes = events.map((e) => e.eventType);
  const intelligenceSummary = {
    rageClicks: eventTypes.filter((t) => t === "rage_click").length,
    formErrors: eventTypes.filter((t) => t === "form_error").length,
    longHovers: eventTypes.filter((t) => t === "long_hover").length,
    formSubmissions: eventTypes.filter((t) => t === "form_submit").length,
    rapidScrolls: eventTypes.filter((t) => t === "rapid_scroll").length,
  };

  return {
    sessionInfo: {
      sessionId,
      entryPage: firstEvent.page,
      exitPage: lastEvent.page,
      deviceType: firstEvent.deviceType,
      browser: firstEvent.browser,
      os: firstEvent.os,
      country: firstEvent.country,
      city: firstEvent.city,
      startTime: firstEvent.timestamp,
      endTime: lastEvent.timestamp,
      durationMs,
      totalEvents: events.length,
    },
    events,
    journeySteps,
    intelligenceSummary,
  };
}

/**
 * Get multi-mode heatmap data (clicks, hovers, movements, scroll milestones)
 */
export async function getMultiModeHeatmapData(mode = "click", rangeStart, limit = 400) {
  if (mode === "movement") {
    // Unwind movement delta segments with spatial binning
    const pipeline = [
      {
        $match: {
          eventType: { $in: ["mouse_movement", "mouse_segment"] },
          ...(rangeStart ? { timestamp: { $gte: rangeStart } } : {}),
          "metadata.points": { $exists: true, $ne: [] },
        },
      },
      { $sort: { timestamp: -1 } },
      { $limit: 40 },
      { $unwind: "$metadata.points" },
      {
        $project: {
          gridX: {
            $multiply: [
              {
                $round: [
                  {
                    $divide: [
                      {
                        $cond: [
                          { $eq: ["$eventType", "mouse_segment"] },
                          { $arrayElemAt: ["$metadata.points", 1] },
                          { $arrayElemAt: ["$metadata.points", 0] },
                        ],
                      },
                      35,
                    ],
                  },
                  0,
                ],
              },
              35,
            ],
          },
          gridY: {
            $multiply: [
              {
                $round: [
                  {
                    $divide: [
                      {
                        $cond: [
                          { $eq: ["$eventType", "mouse_segment"] },
                          { $arrayElemAt: ["$metadata.points", 2] },
                          { $arrayElemAt: ["$metadata.points", 1] },
                        ],
                      },
                      35,
                    ],
                  },
                  0,
                ],
              },
              35,
            ],
          },
          page: 1,
          timestamp: 1,
        },
      },
      {
        $group: {
          _id: { x: "$gridX", y: "$gridY" },
          x: { $first: "$gridX" },
          y: { $first: "$gridY" },
          count: { $sum: 1 },
          lastTimestamp: { $max: "$timestamp" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ];
    const points = await AnalyticsEvent.aggregate(pipeline);
    return points.map((p) => ({ ...p, eventType: "movement" }));
  }

  let eventFilter = [
    "click",
    "card_click",
    "button_click",
    "link_click",
    "tab_change",
    "modal_open",
    "rage_click",
  ];
  if (mode === "hover") {
    eventFilter = ["hover", "long_hover"];
  } else if (mode === "scroll") {
    eventFilter = ["scroll_milestone", "rapid_scroll"];
  }

  // Section 40: Spatial Aggregation into 35px cells to minimize payload and 1-core memory usage
  const pipeline = [
    {
      $match: {
        eventType: { $in: eventFilter },
        ...(rangeStart ? { timestamp: { $gte: rangeStart } } : {}),
        "metadata.x": { $exists: true },
        "metadata.y": { $exists: true },
      },
    },
    { $sort: { timestamp: -1 } },
    { $limit: limit * 2 },
    {
      $project: {
        gridX: {
          $multiply: [
            { $round: [{ $divide: ["$metadata.x", 35] }, 0] },
            35,
          ],
        },
        gridY: {
          $multiply: [
            { $round: [{ $divide: ["$metadata.y", 35] }, 0] },
            35,
          ],
        },
        eventType: 1,
        elementId: 1,
        page: 1,
        timestamp: 1,
        durationMs: "$metadata.durationMs",
      },
    },
    {
      $group: {
        _id: { x: "$gridX", y: "$gridY" },
        x: { $first: "$gridX" },
        y: { $first: "$gridY" },
        count: { $sum: 1 },
        eventType: { $first: "$eventType" },
        elementId: { $first: "$elementId" },
        page: { $first: "$page" },
        durationMs: { $avg: "$durationMs" },
        timestamp: { $max: "$timestamp" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ];

  return await AnalyticsEvent.aggregate(pipeline);
}

/**
 * Get live active sessions in the last N minutes
 */
export async function getLiveSessions(windowMinutes = 5) {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  const pipeline = [
    {
      $match: {
        timestamp: { $gte: windowStart },
      },
    },
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: "$sessionId",
        lastActivity: { $first: "$timestamp" },
        firstActivity: { $last: "$timestamp" },
        currentPage: { $first: "$page" },
        lastEventType: { $first: "$eventType" },
        lastElementId: { $first: "$elementId" },
        deviceType: { $first: "$deviceType" },
        country: { $first: "$country" },
        city: { $first: "$city" },
        eventCount: { $sum: 1 },
      },
    },
    { $sort: { lastActivity: -1 } },
    { $limit: 15 },
  ];

  const results = await AnalyticsEvent.aggregate(pipeline);

  return results.map((s) => {
    const activeSeconds = Math.round(
      (new Date(s.lastActivity).getTime() - new Date(s.firstActivity).getTime()) / 1000
    );
    const idleSeconds = Math.round((Date.now() - new Date(s.lastActivity).getTime()) / 1000);

    return {
      sessionId: s._id,
      currentPage: s.currentPage,
      lastEventType: s.lastEventType,
      lastElementId: s.lastElementId,
      deviceType: s.deviceType || "unknown",
      country: s.country || "Unknown",
      city: s.city || "Unknown",
      activeDuration: `${activeSeconds}s`,
      idleAgo: `${idleSeconds}s ago`,
      isLive: idleSeconds < 90,
      eventCount: s.eventCount,
    };
  });
}
