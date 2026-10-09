import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PortfolioData from "@/models/PortfolioData";
import { adminDenied, requireAdmin } from "@/lib/adminSession";

export async function PUT(
  request,
  { params }
) {
  try {
    const { collectionName, documentId } = params;
    const updatedData = await request.json();

    const auth = await requireAdmin(request);
    if (!auth.valid) return adminDenied(auth);

    await connectDB();

    // For profile image updates, we need to handle the special case
    if (collectionName === "portfolio_data" && documentId === "profile") {
      // Update the profile data in the profile collection
      const result = await PortfolioData.findOneAndUpdate(
        { collectionName: "profile" },
        {
          $set: {
            "data.image": updatedData.image,
            lastUpdate: new Date(),
          },
        },
        { new: true, upsert: true }
      );

      return NextResponse.json({ success: true, data: result });
    }

    // For other updates, find and update the specific document
    const result = await PortfolioData.findOneAndUpdate(
      { 
        collectionName,
        "data.id": documentId 
      },
      {
        $set: {
          "data.$": { ...updatedData, id: documentId, updatedAt: new Date() },
          lastUpdate: new Date(),
        },
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Clear cache by setting no-cache headers
    const response = NextResponse.json({ success: true, data: result });
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );

    return response;
  } catch (error) {
    console.log("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request,
  { params }
) {
  try {
    const { collectionName, documentId } = params;

    const auth = await requireAdmin(request);
    if (!auth.valid) return adminDenied(auth);

    await connectDB();

    // Remove the specific item from the collection
    const result = await PortfolioData.findOneAndUpdate(
      { collectionName },
      {
        $pull: { data: { id: documentId } },
        lastUpdate: new Date(),
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Clear cache by setting no-cache headers
    const response = NextResponse.json({ success: true });
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );

    return response;
  } catch (error) {
    console.log("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
} 