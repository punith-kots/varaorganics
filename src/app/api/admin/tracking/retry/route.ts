import type { NextRequest } from "next/server";
import { getAdminUser } from "@/lib/supabase/auth";
import { getOrder, updateOrder } from "@/features/orders/store";
import { sendMetaPurchase, purchaseEventTime } from "@/lib/analytics/meta-capi";
import { ok, fail, serverError } from "@/lib/api/respond";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) return fail(401, "unauthorized", "Sign in to continue");
  const body = await req.json().catch(() => null);
  if (typeof body?.orderId !== "string") return fail(422, "invalid_order", "Order ID is required");
  try {
    const order = await getOrder(body.orderId);
    if (!order) return fail(404, "not_found", "Order not found");
    if (order.metaPurchaseSentAt) return ok({ alreadySent: true });
    const eventTime = purchaseEventTime(order);
    if (!eventTime || !Number.isFinite(Date.parse(eventTime)) || !order.analyticsContext?.consent) {
      return fail(
        409,
        "not_eligible",
        "Order needs verified payment or placed COD, and checkout analytics consent",
      );
    }
    if (Date.now() - new Date(eventTime).getTime() > 7 * 24 * 60 * 60 * 1000) {
      return fail(409, "too_old", "Purchase is outside the event delivery window");
    }
    if (!(await sendMetaPurchase(order)))
      return fail(503, "not_sent", "Check Meta configuration and server logs");
    await updateOrder(order.id, { metaPurchaseSentAt: new Date().toISOString() });
    return ok({ sent: true });
  } catch (error) {
    return serverError("tracking/retry", error);
  }
}
