import "server-only";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { getOrder } from "@/features/orders/store";

const state = globalThis as typeof globalThis & { __varaPurchaseClaims?: Set<string> };

export async function claimBrowserPurchase(orderId: string): Promise<boolean> {
  if (USE_MOCK_DATA) {
    const order = await getOrder(orderId);
    if (!order || (order.paymentStatus !== "paid" && !(order.paymentMethod === "cod" && order.paymentStatus === "cod_pending"))) return false;
    const claims = (state.__varaPurchaseClaims ??= new Set());
    if (claims.has(orderId)) return false;
    claims.add(orderId);
    return true;
  }
  const sb = getAdminSupabase();
  if (!sb) throw new Error("Order database unavailable");
  // One conditional UPDATE: concurrent requests cannot both claim this row.
  const { data, error } = await sb
    .from("orders")
    .update({ browser_purchase_claimed_at: new Date().toISOString() })
    .eq("id", orderId)
    .or("payment_status.eq.paid,and(payment_method.eq.cod,payment_status.eq.cod_pending)")
    .is("browser_purchase_claimed_at", null)
    .select("id");
  if (error) throw error;
  return data?.length === 1;
}
