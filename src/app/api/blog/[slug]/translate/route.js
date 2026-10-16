import connectDB from "@/lib/mongodb";
import { blogModels } from "@/models/Blog";
import { secureResponse } from "@/lib/auth";
import { translatePostToBangla, TranslationError } from "@/lib/blog/translate.mjs";
import { requireAdmin, getClientIP } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

// In-memory sliding window rate limiter per client IP
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_MIN = 20;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_REQUESTS_PER_MIN) {
    return true;
  }
  entry.count += 1;
  return false;
}

export async function GET(request, { params }) {
  try {
    const clientIp = getClientIP(request);
    if (isRateLimited(clientIp)) {
      return secureResponse(
        { success: false, error: "Rate limit exceeded. Please wait a minute." },
        429
      );
    }

    const slug = params?.slug?.trim();
    if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug) || slug.length > 200) {
      return secureResponse({ success: false, error: "Invalid article slug" }, 400);
    }

    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get("lang") || "bn").toLowerCase().trim();

    if (lang !== "bn") {
      return secureResponse(
        { success: false, error: `Unsupported language: ${lang}. Supported: bn` },
        400
      );
    }

    await connectDB();
    const { BlogPost } = blogModels();

    const post = await BlogPost.findOne({ slug }).lean();
    if (!post) {
      return secureResponse({ success: false, error: "Post not found" }, 404);
    }

    // Security: verify if requester is admin
    const auth = await requireAdmin(request);
    const isAdmin = Boolean(auth?.valid);

    // Draft protection: never expose unpublished drafts to public users
    if (post.status !== "published" && !isAdmin) {
      return secureResponse({ success: false, error: "Post not found" }, 404);
    }

    // Anti-DoS: Only authenticated admins can force AI re-translation
    const refreshRequested =
      searchParams.get("refresh") === "1" || searchParams.get("force") === "1";
    const allowRefresh = refreshRequested && isAdmin;

    // 1. Check if translation exists in MongoDB cache
    const existingTranslation =
      post.translations?.[lang] ||
      (post.translations instanceof Map ? post.translations.get(lang) : null);

    if (!allowRefresh && existingTranslation && existingTranslation.html && existingTranslation.title) {
      return secureResponse({
        success: true,
        cached: true,
        translation: existingTranslation,
      });
    }

    // 2. If not cached, translate with AI service
    const contentToTranslate = post.live || post;
    const translation = await translatePostToBangla(contentToTranslate, lang);

    const translationData = {
      ...translation,
      lang,
      sourceVersion: post.liveVersion || post.version || 1,
      translatedAt: new Date(),
    };

    // 3. Save into MongoDB for permanent caching
    await BlogPost.updateOne(
      { _id: post._id },
      { $set: { [`translations.${lang}`]: translationData } }
    );

    return secureResponse({
      success: true,
      cached: false,
      translation: translationData,
    });
  } catch (error) {
    console.error("Error in blog translation route:", error);
    if (error instanceof TranslationError) {
      return secureResponse(
        { success: false, error: error.message, code: error.code },
        error.status || 500
      );
    }
    return secureResponse(
      { success: false, error: error.message || "Failed to translate post" },
      500
    );
  }
}

export async function POST(request, { params }) {
  // Support both GET and POST
  return GET(request, { params });
}
