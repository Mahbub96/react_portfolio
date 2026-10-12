import connectDB from "@/lib/mongodb";
import ContactMessage from "@/models/ContactMessage";
import { requireAdmin, adminDenied } from "@/lib/adminSession";
import { secureResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (!auth.valid) return adminDenied(auth);

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const q = (searchParams.get("q") || "").trim();

    const filter = {};
    if (status !== "all") {
      filter.status = status;
    }

    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: regex }, { email: regex }, { subject: regex }, { message: regex }];
    }

    const [items, totalCount, savedLocallyCount, sentCount, failedCount] = await Promise.all([
      ContactMessage.find(filter).sort({ createdAt: -1 }).limit(100).lean(),
      ContactMessage.countDocuments({}),
      ContactMessage.countDocuments({ status: "saved_locally" }),
      ContactMessage.countDocuments({ status: "sent" }),
      ContactMessage.countDocuments({ status: "failed" }),
    ]);

    const formattedItems = items.map((doc) => ({
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
    }));

    return secureResponse({
      items: formattedItems,
      stats: {
        total: totalCount,
        saved_locally: savedLocallyCount,
        sent: sentCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error("Error fetching contact messages for admin:", error);
    return secureResponse({ error: "Failed to fetch contact messages" }, 500);
  }
}
