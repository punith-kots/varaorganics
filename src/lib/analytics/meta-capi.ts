import "server-only";
import { createHash } from "node:crypto";
import { optionalServerEnv, USE_MOCK_DATA, SITE_URL, publicEnv } from "@/lib/validation/env";
import { safeError } from "@/lib/security/redact";
import type { Order } from "@/types";

const hash = (value: string) =>
  createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
export function normalizeMetaPhone(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.length === 10 ? `91${digits}` : digits;
}

export function purchaseEventTime(order: Order): string | null {
  if (
    order.paymentMethod === "cod" &&
    (order.paymentStatus === "cod_pending" || order.paymentStatus === "paid")
  ) return order.createdAt;
  return order.paymentStatus === "paid" ? (order.paidAt ?? null) : null;
}

export function metaPurchaseEvent(order: Order) {
  const eventTime = purchaseEventTime(order);
  if (!eventTime || !Number.isFinite(Date.parse(eventTime)) || !order.analyticsContext?.consent)
    return null;
  const context = order.analyticsContext;
  return {
    event_name: "Purchase",
    event_time: Math.floor(new Date(eventTime).getTime() / 1000),
    event_id: `purchase_${order.id}`,
    action_source: "website",
    event_source_url: `${SITE_URL}/order-confirmed/${encodeURIComponent(order.id)}`,
    user_data: {
      em: [hash(order.email)],
      ph: [hash(normalizeMetaPhone(order.address.phone))],
      fbp: context.fbp,
      fbc: context.fbc,
      client_ip_address: context.ip,
      client_user_agent: context.userAgent,
    },
    custom_data: {
      currency: "INR",
      value: order.subtotal,
      content_type: "product",
      content_ids: order.items.map((i) => i.sku),
      contents: order.items.map((i) => ({
        id: i.sku,
        quantity: i.quantity,
        item_price: i.unitPrice,
      })),
      num_items: order.items.reduce((n, i) => n + i.quantity, 0),
    },
  };
}

/** No token, customer payload or raw Meta error response is logged. */
export async function sendMetaPurchase(order: Order): Promise<boolean> {
  const event = metaPurchaseEvent(order);
  if (!event || order.metaPurchaseSentAt || USE_MOCK_DATA) return false;
  const token = optionalServerEnv("META_CAPI_TOKEN");
  const pixelId = publicEnv.NEXT_PUBLIC_META_PIXEL_ID;
  if (!token || !pixelId) return false;
  // Matches Meta's official Node SDK API version, checked 2026-10-14.
  const version = optionalServerEnv("META_GRAPH_API_VERSION") ?? "v26.0";
  try {
    const response = await fetch(`https://graph.facebook.com/${version}/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        data: [event],
        test_event_code: optionalServerEnv("META_CAPI_TEST_EVENT_CODE"),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      safeError("meta-capi", "Purchase rejected", { orderId: order.id, status: response.status });
      return false;
    }
    const result = (await response.json()) as { events_received?: number };
    return result.events_received === 1;
  } catch {
    safeError("meta-capi", "Purchase delivery failed", { orderId: order.id });
    return false;
  }
}
