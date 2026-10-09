/**
 * Wrapper for /api/admin/blog/* route handlers: admin session (and
 * same-origin check for writes) first, then uniform JSON errors.
 */
import { ZodError } from "zod";
import { secureResponse } from "@/lib/auth";
import { adminDenied, requireAdmin } from "@/lib/adminSession";
import { BlogError } from "./adminPosts";
import { MediaError } from "./media";

export function adminRoute(handler) {
  return async (request, context) => {
    const auth = await requireAdmin(request);
    if (!auth.valid) return adminDenied(auth);
    try {
      const result = await handler(request, context, auth.user);
      return result instanceof Response ? result : secureResponse(result);
    } catch (error) {
      if (error instanceof BlogError) {
        return secureResponse({ error: error.message, ...(error.details ? { details: error.details } : {}) }, error.status);
      }
      if (error instanceof MediaError) return secureResponse({ error: error.message }, 422);
      if (error instanceof ZodError) {
        return secureResponse({ error: "Invalid request", issues: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }, 422);
      }
      if (error instanceof SyntaxError) return secureResponse({ error: "Invalid JSON body" }, 400);
      console.error("Blog admin API error:", error);
      return secureResponse({ error: "Internal server error" }, 500);
    }
  };
}
