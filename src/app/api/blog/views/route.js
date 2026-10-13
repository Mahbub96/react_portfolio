import connectDB from "@/lib/mongodb";
import { blogModels } from "@/models/Blog";
import Visitor from "@/models/Visitor";
import { secureResponse } from "@/lib/auth";
import { hasAdminCookie } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim();

    await connectDB();
    const { BlogPost } = blogModels();

    if (slug) {
      const post = await BlogPost.findOne({ slug }).select("views slug status").lean();
      if (!post) {
        return secureResponse({ success: false, error: "Post not found" }, 404);
      }
      return secureResponse({
        success: true,
        slug: post.slug,
        views: typeof post.views === "number" ? post.views : 0,
      });
    }

    // Return total views and individual post views for all published posts
    const posts = await BlogPost.find({ status: "published" }).select("slug views").lean();
    const postViews = {};
    let totalViews = 0;

    posts.forEach((p) => {
      const v = typeof p.views === "number" ? p.views : 0;
      postViews[p.slug] = v;
      totalViews += v;
    });

    return secureResponse({
      success: true,
      totalViews,
      postViews,
    });
  } catch (error) {
    console.error("Error fetching blog views:", error);
    return secureResponse({ success: false, error: "Failed to fetch views" }, 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = body?.slug?.trim();

    if (!slug) {
      return secureResponse({ success: false, error: "Slug is required" }, 400);
    }

    await connectDB();
    const { BlogPost } = blogModels();

    // If an authenticated admin views the post, don't increment view count
    if (hasAdminCookie(request)) {
      const post = await BlogPost.findOne({ slug }).select("views slug").lean();
      return secureResponse({
        success: true,
        slug,
        views: post?.views || 0,
        ignored: "admin_session",
      });
    }

    // Atomically increment post view count
    const updated = await BlogPost.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    ).select("views slug").lean();

    if (!updated) {
      return secureResponse({ success: false, error: "Post not found" }, 404);
    }

    // Best-effort record in Visitor collection for overall site analytics
    try {
      const pagePath = `/blog/${slug}/`;
      const userAgent = request.headers.get("user-agent") || "";
      const ip =
        request.headers.get("cf-connecting-ip") ||
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const referrer = request.headers.get("referer") || "direct";

      await Visitor.create({
        ip,
        userAgent,
        page: pagePath,
        country: "Unknown",
        city: "Unknown",
        region: "Unknown",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer,
      });
    } catch (e) {
      // Non-blocking log
    }

    return secureResponse({
      success: true,
      slug: updated.slug,
      views: updated.views,
    });
  } catch (error) {
    console.error("Error incrementing blog view:", error);
    return secureResponse({ success: false, error: "Failed to record view" }, 500);
  }
}
