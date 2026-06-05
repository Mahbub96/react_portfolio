import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";
import { getPortfolioFallback } from "@/lib/portfolioFallback";

function transformPortfolioRows(portfolioData) {
  const transformedData = {};
  portfolioData.forEach((item) => {
    transformedData[item.collectionName] = {
      data: item.data,
      lastUpdate: item.lastUpdate,
    };
  });
  return transformedData;
}

export async function getPortfolioData() {
  try {
    const db = await connectDB();
    let portfolioData = [];

    if (db) {
      portfolioData = await PortfolioData.find({}).lean();
    }

    const transformedData = transformPortfolioRows(portfolioData);
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
