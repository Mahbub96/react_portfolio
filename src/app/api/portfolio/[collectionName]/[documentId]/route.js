import { NextResponse } from "next/server";
import { adminDenied, requireAdmin } from "@/lib/adminSession";
import { hasPermission } from "@/config/admin";
import {
  updateItem,
  updateSingleton,
  deleteItem,
  PortfolioError,
  normalizeCollectionName,
} from "@/lib/portfolio/portfolioService";
import { isSingletonCollection } from "@/lib/portfolio/schemas";

export async function PUT(request, { params }) {
  try {
    const { collectionName: rawCol, documentId } = params;
    const auth = await requireAdmin(request);
    if (!auth.valid) return adminDenied(auth);

    if (!hasPermission(auth.user.role, "write:portfolio")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const updatedData = await request.json().catch(() => ({}));
    const collectionName = normalizeCollectionName(rawCol);

    let result;
    if (isSingletonCollection(collectionName) || (collectionName === "portfolio_data" && documentId === "profile")) {
      result = await updateSingleton("profile", updatedData, auth.user.username);
    } else {
      result = await updateItem(collectionName, documentId, updatedData, auth.user.username);
    }

    const response = NextResponse.json({ success: true, ...result });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response;
  } catch (error) {
    if (error instanceof PortfolioError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { collectionName: rawCol, documentId } = params;
    const auth = await requireAdmin(request);
    if (!auth.valid) return adminDenied(auth);

    if (!hasPermission(auth.user.role, "delete:portfolio")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const collectionName = normalizeCollectionName(rawCol);
    const result = await deleteItem(collectionName, documentId, auth.user.username);

    const response = NextResponse.json({ success: true, ...result });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response;
  } catch (error) {
    if (error instanceof PortfolioError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete document" },
      { status: 500 }
    );
  }
}