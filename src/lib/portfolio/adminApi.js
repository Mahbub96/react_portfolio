import { ZodError } from "zod";
import { secureResponse } from "@/lib/auth";
import { adminDenied, requireAdmin } from "@/lib/adminSession";
import { PortfolioError } from "./portfolioService.js";

/**
 * Standard admin route handler wrapper for portfolio management APIs.
 * Enforces admin session authentication, anti-CSRF origin checks on writes,
 * and standard JSON error responses.
 */
export function adminPortfolioRoute(handler, { requiredPermission = "write:portfolio" } = {}) {
  return async (request, context) => {
    const auth = await requireAdmin(request);
    if (!auth.valid) return adminDenied(auth);

    try {
      const result = await handler(request, context, auth.user);
      return result instanceof Response ? result : secureResponse(result);
    } catch (error) {
      if (error instanceof PortfolioError) {
        return secureResponse(
          { error: error.message, ...(error.details ? { details: error.details } : {}) },
          error.status
        );
      }
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
        return secureResponse({ error: "Validation error", issues }, 422);
      }
      if (error instanceof SyntaxError) {
        return secureResponse({ error: "Malformed JSON body" }, 400);
      }
      console.error("Portfolio Admin API Error:", error);
      return secureResponse({ error: "Internal server error" }, 500);
    }
  };
}
