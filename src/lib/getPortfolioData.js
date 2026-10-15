import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";
import { getPortfolioFallback } from "@/lib/portfolioFallback";

function transformPortfolioRows(portfolioData, { includeHidden = false } = {}) {
  const transformedData = {};
  portfolioData.forEach((item) => {
    let content = item.data;
    if (Array.isArray(content)) {
      if (!includeHidden) {
        content = content.filter((entry) => entry && entry.published !== false);
      }
      content = [...content].sort((a, b) => {
        const orderA = typeof a.order === "number" ? a.order : 0;
        const orderB = typeof b.order === "number" ? b.order : 0;
        return orderA - orderB;
      });
    }
    transformedData[item.collectionName] = {
      data: content,
      lastUpdate: item.lastUpdate,
    };
  });
  return transformedData;
}

export async function getPortfolioData(options = {}) {
  try {
    const db = await connectDB();
    let portfolioData = [];

    if (db) {
      portfolioData = await PortfolioData.find({}).lean();
    }

    let includeHidden = options?.includeHidden;
    if (includeHidden === undefined) {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = cookies();
        const adminCookie =
          cookieStore.get("__Host-mahbub_admin")?.value ||
          cookieStore.get("admin_session")?.value;
        if (adminCookie) {
          includeHidden = true;
        }
      } catch {
        includeHidden = false;
      }
    }

    const transformedData = transformPortfolioRows(portfolioData, {
      includeHidden: Boolean(includeHidden),
    });
    if (Object.keys(transformedData).length === 0) {
      return getPortfolioFallback();
    }

    return transformedData;
  } catch (error) {
    console.log("Error fetching portfolio data:", error);
    return getPortfolioFallback();
  }
}

/** Resume generation — database only, no fallback data */
export async function getPortfolioDataFromDb() {
  const db = await connectDB();
  if (!db) {
    throw new Error("MONGODB_URI is not configured");
  }

  const portfolioData = await PortfolioData.find({}).lean();
  const transformedData = transformPortfolioRows(portfolioData);

  if (Object.keys(transformedData).length === 0) {
    throw new Error(
      "No portfolio data in database. Run yarn seed or add data via admin."
    );
  }

  return transformedData;
}
