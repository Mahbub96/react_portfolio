import { secureResponse } from "@/lib/auth";
import { requireAdmin } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

// Lets the client confirm the httpOnly session cookie is still valid (it
// cannot read the cookie itself). Only called when the client has a local
// "logged in until" marker, so public visitors never hit it.
export async function GET(request) {
  const auth = await requireAdmin(request);
  if (!auth.valid) {
    return secureResponse({ authenticated: false });
  }
  return secureResponse({
    authenticated: true,
    role: auth.user.role,
    expiresAt: new Date(auth.user.exp * 1000).toISOString(),
  });
}
