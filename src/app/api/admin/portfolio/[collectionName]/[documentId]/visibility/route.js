import { revalidatePath } from "next/cache";
import { adminPortfolioRoute } from "@/lib/portfolio/adminApi";
import { toggleVisibility } from "@/lib/portfolio/portfolioService";

export const dynamic = "force-dynamic";

export const PATCH = adminPortfolioRoute(async (request, { params }, user) => {
  const { collectionName, documentId } = params;
  const body = await request.json().catch(() => ({}));
  const published = body.published !== undefined ? Boolean(body.published) : true;

  const result = await toggleVisibility(collectionName, documentId, published, user.username);

  try {
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/skills");
    revalidatePath("/about");
    revalidatePath("/experience");
    revalidatePath("/education");
  } catch {}

  return { success: true, ...result };
});
