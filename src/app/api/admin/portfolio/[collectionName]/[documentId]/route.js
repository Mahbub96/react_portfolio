import { revalidatePath } from "next/cache";
import { adminPortfolioRoute } from "@/lib/portfolio/adminApi";
import {
  getItem,
  updateItem,
  deleteItem,
} from "@/lib/portfolio/portfolioService";

export const dynamic = "force-dynamic";

export const GET = adminPortfolioRoute(async (request, { params }) => {
  const { collectionName, documentId } = params;
  const item = await getItem(collectionName, documentId);
  if (!item) {
    return new Response(JSON.stringify({ error: "Item not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  return { success: true, item };
});

export const PUT = adminPortfolioRoute(async (request, { params }, user) => {
  const { collectionName, documentId } = params;
  const body = await request.json().catch(() => ({}));
  const result = await updateItem(collectionName, documentId, body, user.username);

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

export const DELETE = adminPortfolioRoute(async (request, { params }, user) => {
  const { collectionName, documentId } = params;
  const result = await deleteItem(collectionName, documentId, user.username);

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
