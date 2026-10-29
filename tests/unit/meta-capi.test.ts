// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import type { Order } from "@/types";
const env = vi.hoisted(() => ({
  values: { META_CAPI_TOKEN: "secret-token" } as Record<string, string>,
}));
vi.mock("@/lib/validation/env", () => ({
  USE_MOCK_DATA: false,
  SITE_URL: "https://varaorganic.com",
  publicEnv: { NEXT_PUBLIC_META_PIXEL_ID: "1623537109216457" },
  optionalServerEnv: (k: string) => env.values[k],
}));
import { metaPurchaseEvent, normalizeMetaPhone, sendMetaPurchase } from "@/lib/analytics/meta-capi";
const order = {
  id: "paid-123",
  paymentStatus: "paid",
  paidAt: "2026-10-14T10:00:00Z",
  email: " BUYER@EXAMPLE.COM ",
  address: { phone: "09876543210" },
  subtotal: 1199,
  totalAmount: 1278,
  items: [{ sku: "VARA-GHEE-500", quantity: 1, unitPrice: 1199 }],
  analyticsContext: { consent: true, ip: "203.0.113.1", userAgent: "Browser", fbp: "fb.1.123.456" },
} as Order;
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
describe("Meta CAPI paid purchases", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    env.values = { META_CAPI_TOKEN: "secret-token" };
  });
  it("hashes normalized email and Indian phone, preserves SKU and excludes shipping", () => {
    expect(normalizeMetaPhone("+91 98765 43210")).toBe("919876543210");
    expect(metaPurchaseEvent(order)).toMatchObject({
      event_id: "purchase_paid-123",
      event_name: "Purchase",
      user_data: {
        em: [hash("buyer@example.com")],
        ph: [hash("919876543210")],
        client_ip_address: "203.0.113.1",
      },
      custom_data: {
        value: 1199,
        currency: "INR",
        content_ids: ["VARA-GHEE-500"],
        contents: [{ id: "VARA-GHEE-500", quantity: 1, item_price: 1199 }],
      },
    });
  });
  it("excludes unpaid, COD-pending and non-consenting orders", () => {
    expect(metaPurchaseEvent({ ...order, paymentStatus: "cod_pending" })).toBeNull();
    expect(metaPurchaseEvent({ ...order, paymentStatus: "pending" })).toBeNull();
    expect(metaPurchaseEvent({ ...order, analyticsContext: null })).toBeNull();
  });
  it("sends the token only in the Authorization header and supports Test Events", async () => {
    env.values.META_CAPI_TEST_EVENT_CODE = "TEST123";
    const fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ events_received: 1 }) });
    vi.stubGlobal("fetch", fetch);
    expect(await sendMetaPurchase(order)).toBe(true);
    const [url, options] = fetch.mock.calls[0]!;
    expect(url).toBe("https://graph.facebook.com/v26.0/1623537109216457/events");
    expect(options.headers.Authorization).toBe("Bearer secret-token");
    expect(JSON.parse(options.body)).toMatchObject({
      test_event_code: "TEST123",
      data: [{ event_id: "purchase_paid-123" }],
    });
  });
  it("skips missing tokens and delivered events; errors do not fail checkout", async () => {
    const fetch = vi.fn().mockRejectedValue(new Error("network"));
    vi.stubGlobal("fetch", fetch);
    env.values = {};
    expect(await sendMetaPurchase(order)).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    env.values = { META_CAPI_TOKEN: "secret-token" };
    expect(await sendMetaPurchase({ ...order, metaPurchaseSentAt: "2026-10-14" })).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    expect(await sendMetaPurchase(order)).toBe(false);
  });
});

it("counts placed COD without marking it paid and retains the ID/time after collection", () => {
  const cod = { ...order, paymentMethod: "cod" as const, paymentStatus: "cod_pending" as const, paidAt: null, createdAt: "2026-10-25T10:00:00Z" };
  const event = metaPurchaseEvent(cod);
  expect(event).toMatchObject({ event_id: `purchase_${cod.id}`, event_time: Date.parse(cod.createdAt) / 1000, custom_data: { value: 1199 } });
  expect(metaPurchaseEvent({ ...cod, paymentStatus: "paid", paidAt: "2026-10-26T10:00:00Z" })).toEqual(event);
  expect(metaPurchaseEvent({ ...cod, analyticsContext: null })).toBeNull();
});
