import { revalidatePath } from "next/cache";
import { adminPortfolioRoute } from "@/lib/portfolio/adminApi";
import { reorderCollection } from "@/lib/portfolio/portfolioService";

export const dynamic = "force-dynamic";

export const PUT = adminPortfolioRoute(async (request, { params }, user) => {
  const { collectionName } = params;
  const body = await request.json().catch(() => ({}));
  const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds : [];

  const result = await reorderCollection(collectionName, orderedIds, user.username);

  try {
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/skills");
    revalidatePath("/about");
  } catch {}

  return { success: true, ...result };
});
