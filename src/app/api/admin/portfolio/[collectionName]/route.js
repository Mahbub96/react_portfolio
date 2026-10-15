import { revalidatePath } from "next/cache";
import { adminPortfolioRoute } from "@/lib/portfolio/adminApi";
import {
  getCollection,
  createItem,
} from "@/lib/portfolio/portfolioService";

export const dynamic = "force-dynamic";

export const GET = adminPortfolioRoute(async (request, { params }) => {
  const { collectionName } = params;
  const items = await getCollection(collectionName, { includeHidden: true });
  return { success: true, collectionName, items };
});

export const POST = adminPortfolioRoute(async (request, { params }, user) => {
  const { collectionName } = params;
  const body = await request.json().catch(() => ({}));
  const result = await createItem(collectionName, body, user.username);

  // Revalidate home and relevant section routes
  try {
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/skills");
    revalidatePath("/about");
  } catch {
    // Ignore in non-edge contexts
  }

  return { success: true, ...result };
});
