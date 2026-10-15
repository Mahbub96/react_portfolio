import { revalidatePath } from "next/cache";
import { adminPortfolioRoute } from "@/lib/portfolio/adminApi";
import {
  getCollection,
  updateSingleton,
} from "@/lib/portfolio/portfolioService";

export const dynamic = "force-dynamic";

export const GET = adminPortfolioRoute(async (request, { params }) => {
  const { section } = params;
  const data = await getCollection(section, { includeHidden: true });
  return { success: true, section, data };
});

export const PUT = adminPortfolioRoute(async (request, { params }, user) => {
  const { section } = params;
  const body = await request.json().catch(() => ({}));
  const result = await updateSingleton(section, body, user.username);

  try {
    revalidatePath("/");
    revalidatePath("/about");
  } catch {}

  return { success: true, ...result };
});
