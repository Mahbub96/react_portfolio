import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminFromCookies } from "@/lib/adminSession";
import { safeAdminNext } from "@/lib/blog/safeNext.mjs";

export const dynamic = "force-dynamic";

// Server-side gate: nothing under /admin renders without a valid session.
export default async function ProtectedAdminLayout({ children }) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    const next = safeAdminNext(headers().get("x-admin-path"));
    redirect(`/admin/login/?next=${encodeURIComponent(next)}`);
  }
  return <AdminShell>{children}</AdminShell>;
}
