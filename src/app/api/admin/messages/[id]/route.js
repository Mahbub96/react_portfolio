import connectDB from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import { requireAdmin, adminDenied } from "@/lib/adminSession";
import { secureResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const auth = await requireAdmin(request);
  if (!auth.valid) return adminDenied(auth);

  try {
    await connectDB();
    const { id } = params;
    const doc = await ContactMessage.findById(id).lean();
    if (!doc) {
      return secureResponse({ error: "Message not found" }, 404);
    }

    return secureResponse({
      message: {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        subject: doc.subject,
        message: doc.message,
        ip: doc.ip,
        userAgent: doc.userAgent,
        status: doc.status,
        emailError: doc.emailError,
        createdAt: doc.createdAt?.toISOString?.() || doc.createdAt,
        updatedAt: doc.updatedAt?.toISOString?.() || doc.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error retrieving contact message:", error);
    return secureResponse({ error: "Failed to retrieve contact message" }, 500);
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (!auth.valid) return adminDenied(auth);

  try {
    await connectDB();
    const { id } = params;
    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) {
      return secureResponse({ error: "Message not found" }, 404);
    }

    return secureResponse({ success: true, message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return secureResponse({ error: "Failed to delete contact message" }, 500);
  }
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request);
  if (!auth.valid) return adminDenied(auth);

  try {
    await connectDB();
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { status } = body;

    const allowedStatuses = ["pending", "sent", "saved_locally", "failed"];
    if (status && !allowedStatuses.includes(status)) {
      return secureResponse({ error: "Invalid status value" }, 400);
    }

    const update = {};
    if (status) update.status = status;

    const updated = await ContactMessage.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) {
      return secureResponse({ error: "Message not found" }, 404);
    }

    return secureResponse({
      success: true,
      message: {
        id: updated._id.toString(),
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("Error updating contact message:", error);
    return secureResponse({ error: "Failed to update contact message" }, 500);
  }
}
