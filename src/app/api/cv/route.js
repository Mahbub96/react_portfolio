import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";
import { secureResponse } from "@/lib/auth";
import { buildCV } from "@/lib/cvBuilder";

// Same cache window as /api/portfolio — the CV changes only when the
// portfolio data changes, so it is cheap to cache at the edge/proxy.
const CACHE_DURATION = 3600; // 1 hour

/**
 * GET /api/cv
 *
 * Returns CV-shaped JSON assembled from the live portfolio collections.
 * Deliberately JSON-only: no PDF is rendered server-side, because the
 * production box is 1 GB RAM / 1 vCPU and a headless browser would not fit.
 * The /resume page turns this data into a PDF using the browser's own
 * print engine, which costs the server nothing.
 */
export async function GET() {
  try {
    await connectDB();

    const docs = await PortfolioData.find({}).lean();

    const portfolio = {};
    docs.forEach((item) => {
      portfolio[item.collectionName] = {
        data: item.data,
        lastUpdate: item.lastUpdate,
      };
    });

    const cv = buildCV(portfolio);

    const lastUpdate = docs
      .map((d) => d.lastUpdate)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];

    const response = secureResponse({ ...cv, lastUpdate: lastUpdate || null });
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`
    );
    response.headers.set("Content-Type", "application/json");

    return response;
  } catch (error) {
    console.error("Error building CV data:", error);
    return secureResponse({ error: "Failed to build CV data" }, 500);
  }
}
