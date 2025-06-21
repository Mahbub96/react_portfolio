import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Visitor from "@/models/Visitor";

export async function POST(request) {
  try {
    const {
      ip,
      userAgent,
      page,
      country,
      city,
      region,
      timezone,
      referrer,
      screenResolution,
      language,
    } = await request.json();

    await connectDB();

    const visitor = new Visitor({
      ip,
      userAgent,
      page,
      country,
      city,
      region,
      timezone,
      referrer,
      screenResolution,
      language,
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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get visitor statistics
    const totalVisitors = await Visitor.countDocuments();
    const todayVisitors = await Visitor.countDocuments({
      timestamp: { $gte: today },
    });
    const thisWeekVisitors = await Visitor.countDocuments({
      timestamp: { $gte: weekAgo },
    });
    const thisMonthVisitors = await Visitor.countDocuments({
      timestamp: { $gte: monthAgo },
    });

    // Get page statistics
    const pageStats = await Visitor.aggregate([
      {
        $group: {
          _id: "$page",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get IP distribution
    const ipStats = await Visitor.aggregate([
      {
        $group: {
          _id: "$ip",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    // Get device statistics with better detection
    const deviceStats = await Visitor.aggregate([
      {
        $addFields: {
          device: {
            $cond: {
              if: {
                $regexMatch: {
                  input: "$userAgent",
                  regex: /Mobile|Android|iPhone/i,
                },
              },
              then: "Mobile",
              else: {
                $cond: {
                  if: {
                    $regexMatch: { input: "$userAgent", regex: /Tablet|iPad/i },
                  },
                  then: "Tablet",
                  else: "Desktop",
                },
              },
            },
          },
          platform: {
            $cond: {
              if: {
                $regexMatch: {
                  input: "$userAgent",
                  regex: /Macintosh|Mac OS X/i,
                },
              },
              then: "macOS",
              else: {
                $cond: {
                  if: {
                    $regexMatch: { input: "$userAgent", regex: /Windows/i },
                  },
                  then: "Windows",
                  else: {
                    $cond: {
                      if: {
                        $regexMatch: { input: "$userAgent", regex: /Linux/i },
                      },
                      then: "Linux",
                      else: {
                        $cond: {
                          if: {
                            $regexMatch: {
                              input: "$userAgent",
                              regex: /Android/i,
                            },
                          },
                          then: "Android",
                          else: "Unknown",
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
          _id: "$platform",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get browser statistics
    const browserStats = await Visitor.aggregate([
      {
        $addFields: {
          browser: {
            $cond: {
              if: { $regexMatch: { input: "$userAgent", regex: /Chrome/i } },
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
                        $regexMatch: { input: "$userAgent", regex: /Safari/i },
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
    ]);

    // Get country statistics
    const countryStats = await Visitor.aggregate([
      {
        $match: {
          country: { $ne: "Unknown", $exists: true },
        },
      },
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get language statistics
    const languageStats = await Visitor.aggregate([
      {
        $match: {
          language: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$language",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get screen resolution statistics
    const screenStats = await Visitor.aggregate([
      {
        $match: {
          screenResolution: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$screenResolution",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    // Get traffic source statistics
    const trafficStats = await Visitor.aggregate([
      {
        $match: {
          referrer: { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $addFields: {
          source: {
            $cond: {
              if: {
                $regexMatch: { input: "$referrer", regex: /google\.com/i },
              },
              then: "Google",
              else: {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: "$referrer",
                      regex: /facebook\.com/i,
                    },
                  },
                  then: "Facebook",
                  else: {
                    $cond: {
                      if: {
                        $regexMatch: {
                          input: "$referrer",
                          regex: /github\.com/i,
                        },
                      },
                      then: "GitHub",
                      else: {
                        $cond: {
                          if: {
                            $regexMatch: {
                              input: "$referrer",
                              regex: /linkedin\.com/i,
                            },
                          },
                          then: "LinkedIn",
                          else: {
                            $cond: {
                              if: { $eq: ["$referrer", "direct"] },
                              then: "Direct",
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
        },
      },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get hourly statistics for today
    const hourlyStats = await Visitor.aggregate([
      {
        $match: {
          timestamp: { $gte: today },
        },
      },
      {
        $addFields: {
          hour: {
            $concat: [
              { $toString: { $hour: "$timestamp" } },
              ":",
              {
                $cond: {
                  if: { $lt: [{ $minute: "$timestamp" }, 10] },
                  then: "0",
                  else: "",
                },
              },
              { $toString: { $minute: "$timestamp" } },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$hour",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get daily statistics for the last 30 days
    const dailyStats = await Visitor.aggregate([
      {
        $match: {
          timestamp: { $gte: monthAgo },
        },
      },
      {
        $addFields: {
          dayOfWeek: {
            $switch: {
              branches: [
                {
                  case: { $eq: [{ $dayOfWeek: "$timestamp" }, 1] },
                  then: "Sunday",
                },
                {
                  case: { $eq: [{ $dayOfWeek: "$timestamp" }, 2] },
                  then: "Monday",
                },
                {
                  case: { $eq: [{ $dayOfWeek: "$timestamp" }, 3] },
                  then: "Tuesday",
                },
                {
                  case: { $eq: [{ $dayOfWeek: "$timestamp" }, 4] },
                  then: "Wednesday",
                },
                {
                  case: { $eq: [{ $dayOfWeek: "$timestamp" }, 5] },
                  then: "Thursday",
                },
                {
                  case: { $eq: [{ $dayOfWeek: "$timestamp" }, 6] },
                  then: "Friday",
                },
                {
                  case: { $eq: [{ $dayOfWeek: "$timestamp" }, 7] },
                  then: "Saturday",
                },
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: "$dayOfWeek",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get monthly statistics for the last 12 months
    const monthlyStats = await Visitor.aggregate([
      {
        $addFields: {
          month: {
            $switch: {
              branches: [
                {
                  case: { $eq: [{ $month: "$timestamp" }, 1] },
                  then: "January",
                },
                {
                  case: { $eq: [{ $month: "$timestamp" }, 2] },
                  then: "February",
                },
                { case: { $eq: [{ $month: "$timestamp" }, 3] }, then: "March" },
                { case: { $eq: [{ $month: "$timestamp" }, 4] }, then: "April" },
                { case: { $eq: [{ $month: "$timestamp" }, 5] }, then: "May" },
                { case: { $eq: [{ $month: "$timestamp" }, 6] }, then: "June" },
                { case: { $eq: [{ $month: "$timestamp" }, 7] }, then: "July" },
                {
                  case: { $eq: [{ $month: "$timestamp" }, 8] },
                  then: "August",
                },
                {
                  case: { $eq: [{ $month: "$timestamp" }, 9] },
                  then: "September",
                },
                {
                  case: { $eq: [{ $month: "$timestamp" }, 10] },
                  then: "October",
                },
                {
                  case: { $eq: [{ $month: "$timestamp" }, 11] },
                  then: "November",
                },
                {
                  case: { $eq: [{ $month: "$timestamp" }, 12] },
                  then: "December",
                },
              ],
            },
          },
        },
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get recent visits
    const recentVisits = await Visitor.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // Format all statistics
    const formattedHourlyStats = hourlyStats.map((stat) => ({
      hour: stat._id,
      count: stat.count,
    }));

    const formattedDeviceStats = deviceStats.map((stat) => ({
      device: stat._id,
      count: stat.count,
    }));

    const formattedCountryStats = countryStats.map((stat) => ({
      country: stat._id,
      count: stat.count,
    }));

    const formattedBrowserStats = browserStats.map((stat) => ({
      browser: stat._id,
      count: stat.count,
    }));

    const formattedLanguageStats = languageStats.map((stat) => ({
      language: stat._id,
      count: stat.count,
    }));

    const formattedScreenStats = screenStats.map((stat) => ({
      resolution: stat._id,
      count: stat.count,
    }));

    const formattedTrafficStats = trafficStats.map((stat) => ({
      source: stat._id,
      count: stat.count,
    }));

    const formattedDailyStats = dailyStats.map((stat) => ({
      day: stat._id,
      count: stat.count,
    }));

    const formattedMonthlyStats = monthlyStats.map((stat) => ({
      month: stat._id,
      count: stat.count,
    }));

    const formattedIpStats = ipStats.map((stat) => ({
      ip: stat._id,
      count: stat.count,
    }));

    return NextResponse.json({
      totalVisitors,
      todayVisitors,
      thisWeekVisitors,
      thisMonthVisitors,
      pageStats,
      deviceStats: formattedDeviceStats,
      countryStats: formattedCountryStats,
      hourlyStats: formattedHourlyStats,
      browserStats: formattedBrowserStats,
      languageStats: formattedLanguageStats,
      screenStats: formattedScreenStats,
      trafficStats: formattedTrafficStats,
      dailyStats: formattedDailyStats,
      monthlyStats: formattedMonthlyStats,
      ipStats: formattedIpStats,
      recentVisits,
    });
  } catch (error) {
    console.error("Error fetching visitor stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitor statistics" },
      { status: 500 }
    );
  }
}
