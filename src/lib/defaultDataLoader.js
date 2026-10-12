import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";
import { getPortfolioFallback } from "@/lib/portfolioFallback";

export async function ensureDefaultData() {
  await connectDB();
  const fallback = getPortfolioFallback();
  const results = {};

  for (const [key, val] of Object.entries(fallback)) {
    const existing = await PortfolioData.findOne({ collectionName: key });
    if (!existing) {
      await PortfolioData.create({
        collectionName: key,
        data: val.data,
        lastUpdate: new Date(),
      });
      results[key] = "created";
    } else {
      results[key] = "exists";
    }
  }

  return results;
}
