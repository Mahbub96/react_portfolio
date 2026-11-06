import { requireAdmin, adminDenied } from "@/lib/adminSession";
import { secureResponse } from "@/lib/auth";
import buildInfo from "@/config/buildInfo.json";
import releaseNotes from "@/config/releaseNotes.json";

export const dynamic = "force-dynamic";

/**
 * Release notes for the footer version badge. Admin-only: the changelog
 * describes internal tooling, so it is never published as a static file.
 */
export async function GET(request) {
  const auth = await requireAdmin(request);
  if (!auth.valid) return adminDenied(auth);

  return secureResponse({
    version: buildInfo.version,
    buildNumber: buildInfo.buildNumber,
    commitHash: buildInfo.commitHash,
    buildDate: buildInfo.buildDate,
    releases: releaseNotes.releases || [],
  });
}
