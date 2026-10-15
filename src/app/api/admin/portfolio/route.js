import { adminPortfolioRoute } from "@/lib/portfolio/adminApi";
import { ALL_COLLECTION_NAMES, isSingletonCollection } from "@/lib/portfolio/schemas";
import { getCollection } from "@/lib/portfolio/portfolioService";

export const dynamic = "force-dynamic";

export const GET = adminPortfolioRoute(async () => {
  const result = {};

  for (const name of ALL_COLLECTION_NAMES) {
    result[name] = {
      isSingleton: isSingletonCollection(name),
      data: await getCollection(name, { includeHidden: true }),
    };
  }

  return { success: true, collections: result };
});
