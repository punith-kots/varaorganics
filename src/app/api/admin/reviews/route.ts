import { z } from "zod";
import { getAdminUser } from "@/lib/supabase/auth";
import { moderateReview } from "@/features/reviews/store";
export const runtime = "nodejs";
export async function PATCH(req: Request) {
  if (!(await getAdminUser()))
    return Response.json({ message: "Sign in to continue" }, { status: 401 });
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(["approved", "rejected", "pending"]) })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ message: "Invalid review update" }, { status: 422 });
  try {
    if (!(await moderateReview(parsed.data.id, parsed.data.status)))
      return Response.json({ message: "Review not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ message: "Could not update review" }, { status: 503 });
  }
}
