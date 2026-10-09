import { adminRoute } from "@/lib/blog/adminApi";
import { aiStatus } from "@/lib/ai/service";

export const dynamic = "force-dynamic";

// Whether AI suggestions are configured, and how many calls are left.
export const GET = adminRoute(async () => aiStatus());
