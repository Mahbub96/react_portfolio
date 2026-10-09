import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { getAdminFromCookies } from "@/lib/adminSession";
import { safeAdminNext } from "@/lib/blog/safeNext.mjs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function AdminLoginPage({ searchParams }) {
  const next = safeAdminNext(searchParams?.next);
  if (await getAdminFromCookies()) redirect(next);
  return <LoginForm next={next} />;
}
