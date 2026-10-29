import { z } from "zod";
import { safeError } from "@/lib/security/redact";
import { SITE_URL } from "@/lib/validation/env";
import { claimBrowserPurchase } from "@/lib/analytics/purchase-claim";

export const runtime = "nodejs";
const schema = z.object({ orderId: z.uuid(), consent: z.literal(true) });

export async function POST(req: Request) {
  // The confirmation link's unguessable order UUID is its existing bearer access.
  // Only same-origin browser requests can consume its claim; no customer data is returned.
  const origin = req.headers.get("origin");
  const allowedOrigins = [new URL(req.url).origin, new URL(SITE_URL).origin];
  if (!origin || !allowedOrigins.includes(origin))
    return Response.json({ claimed: false }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ claimed: false }, { status: 422 });
  try {
    return Response.json(
      { claimed: await claimBrowserPurchase(parsed.data.orderId) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    safeError("tracking/purchase", "Purchase claim unavailable; check order database and migration 0009");
    return Response.json({ claimed: false }, { status: 503 });
  }
}
