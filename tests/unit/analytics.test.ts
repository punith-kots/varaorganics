import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
  type PurchaseData,
} from "@/lib/analytics/events";
import type { CartItem } from "@/types";
vi.mock("@/lib/validation/env", () => ({ publicEnv: { NEXT_PUBLIC_GTM_ID: "" } }));
const w = () =>
  window as unknown as {
    dataLayer: Record<string, any>[];
    __varaConsent: boolean;
    __varaPurchases?: Set<string>;
    fbq?: ReturnType<typeof vi.fn>;
    gtag?: ReturnType<typeof vi.fn>;
  };
const item: CartItem = {
  variantId: "uuid-500",
  sku: "VARA-GHEE-500",
  productId: "ghee",
  slug: "ghee",
  routePrefix: "ghee",
  productName: "Ghee",
  size: "500ml",
  price: 1199,
  unitLabel: "500ml",
  image: null,
  quantity: 2,
};
const order: PurchaseData = {
  id: "order-1",
  paymentStatus: "paid",
  subtotal: 2398,
  shippingAmount: 79,
  taxAmount: 0,
  items: [
    {
      sku: item.sku!,
      productName: "Ghee",
      size: "500ml",
      quantity: 2,
      unitPrice: 1199,
      lineTotal: 2398,
    },
  ],
};
const events = (name: string) => w().dataLayer.filter((e) => e.event === name);
describe("ecommerce tracking brief", () => {
  beforeEach(() => {
    localStorage.clear();
    w().dataLayer = [];
    w().__varaConsent = true;
    w().__varaPurchases = new Set();
    w().fbq = vi.fn();
    w().gtag = vi.fn();
    window.history.replaceState({}, "", "/order-confirmed/order-1");
  });
  it("clears stale ecommerce and sends SKU, quantity and category", () => {
    trackViewContent({
      productName: "Ghee",
      size: "500ml",
      sku: item.sku!,
      price: 1199,
      category: "ghee",
    });
    expect(w().dataLayer[0]).toEqual({ ecommerce: null });
    expect(events("view_item")[0]).toMatchObject({
      ecommerce: {
        currency: "INR",
        value: 1199,
        items: [{ item_id: "VARA-GHEE-500", item_category: "ghee", quantity: 1, price: 1199 }],
      },
    });
  });
  it("tracks each add using the added quantity, not the total cart quantity", () => {
    trackAddToCart(item);
    trackAddToCart({ ...item, quantity: 1 });
    expect(events("add_to_cart").map((e) => e.ecommerce.value)).toEqual([2398, 1199]);
    expect(events("klaviyo_added_to_cart")).toHaveLength(2);
  });
  it("tracks the full cart with one line per combo and discounted selling prices", () => {
    trackBeginCheckout([
      item,
      { ...item, sku: "VARA-COMBO-5", routePrefix: "combos", price: 3599, quantity: 1 },
    ]);
    expect(events("begin_checkout")[0]!.ecommerce).toMatchObject({
      value: 5997,
      currency: "INR",
      items: [
        { item_id: item.sku, quantity: 2 },
        { item_id: "VARA-COMBO-5", item_category: "combo", price: 3599, quantity: 1 },
      ],
    });
    expect(events("klaviyo_started_checkout")[0]!.items).toHaveLength(2);
  });
  it.each(["paid", "cod_pending"] as const)(
    "nests transaction_id for %s using the confirmation URL ID",
    (paymentStatus) => {
      const id = "3001d3bc-f645-45b2-90de-9b28f48ca613";
      window.history.replaceState({}, "", `/order-confirmed/${id}`);
      trackPurchase({ ...order, id, paymentStatus });
      const event = events("purchase")[0]!;
      expect(event.ecommerce.transaction_id).toBe(window.location.pathname.split("/").pop());
      expect(event.event_id).toBe(`purchase_${event.ecommerce.transaction_id}`);
      expect(w().dataLayer[0]).toEqual({ ecommerce: null });
    },
  );
  it("excludes shipping and deduplicates across remounts/refresh storage", () => {
    trackPurchase(order);
    w().__varaPurchases = new Set();
    trackPurchase(order);
    expect(events("purchase")).toHaveLength(1);
    expect(events("purchase")[0]).toMatchObject({
      event_id: "purchase_order-1",
      ecommerce: { transaction_id: "order-1", value: 2398, shipping: 79, currency: "INR" },
    });
  });
  it.each(["pending", "failed"] as const)("never sends purchase for %s", (paymentStatus) => {
    expect(trackPurchase({ ...order, paymentStatus })).toBe(false);
    expect(events("purchase")).toHaveLength(0);
  });
  it("waits for consent without marking the purchase sent", () => {
    w().__varaConsent = false;
    trackPurchase(order);
    trackAddToCart(item);
    expect(w().dataLayer).toEqual([]);
    w().__varaConsent = true;
    trackPurchase(order);
    expect(events("purchase")).toHaveLength(1);
  });
  it("never calls Meta or GA4 directly, even without GTM configured", () => {
    trackPageView(window.location.href);
    trackViewContent({ productName: "Ghee", size: "500ml", sku: item.sku!, price: 1199 });
    trackAddToCart(item);
    trackBeginCheckout([item]);
    trackPurchase(order);
    expect(w().fbq).not.toHaveBeenCalled();
    expect(w().gtag).not.toHaveBeenCalled();
  });
  it("keeps COD-related charges outside tracked product value", () => {
    trackPurchase({ ...order, subtotal: 400, shippingAmount: 178 });
    expect(events("purchase")[0]).toMatchObject({ ecommerce: { value: 400, shipping: 178 } });
  });
  it("does not send purchase on other routes", () => {
    window.history.replaceState({}, "", "/cart");
    trackPurchase(order);
    expect(events("purchase")).toHaveLength(0);
  });
  it("does not invent a SKU for an old cart", () => {
    trackBeginCheckout([{ ...item, sku: undefined }]);
    expect(events("begin_checkout")).toHaveLength(0);
  });
});

it("includes the current product URL and selected size in view_item", () => {
  Object.assign(window, { __varaConsent: true, dataLayer: [] });
  window.history.replaceState({}, "", "/oils/wood-pressed-coconut-oil-1l");
  trackViewContent({
    productName: "Coconut oil",
    sku: "VARA-WCOCO-1000",
    price: 1000,
    category: "oils",
    size: "1L",
  });
  expect(events("view_item")[0]).toMatchObject({
    page_location: window.location.href,
    ecommerce: { items: [{ item_id: "VARA-WCOCO-1000", item_variant: "1L" }] },
  });
});
