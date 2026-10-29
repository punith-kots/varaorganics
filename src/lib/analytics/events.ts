import type { CartItem, Order } from "@/types";

interface AnalyticsWindow extends Window {
  dataLayer?: Record<string, unknown>[];
  __varaConsent?: boolean;
  __varaPurchases?: Set<string>;
}
const win = () => (typeof window === "undefined" ? null : (window as AnalyticsWindow));
export function analyticsConsented(): boolean {
  const w = win();
  if (!w) return false;
  if (w.__varaConsent !== undefined) return w.__varaConsent;
  try {
    return localStorage.getItem("vara-consent") === "granted";
  } catch {
    return false;
  }
}
export function pushDataLayer(event: string, payload: Record<string, unknown> = {}) {
  const w = win();
  if (!w || !analyticsConsented()) return;
  (w.dataLayer ??= []).push({ event, ...payload });
}
function ecommerce(event: string, data: Record<string, unknown>, extra = {}) {
  const w = win();
  if (!w || !analyticsConsented()) return false;
  (w.dataLayer ??= []).push({ ecommerce: null }, { event, ecommerce: data, ...extra });
  return true;
}
export function itemCategory(value: string) {
  if (/combo|bundle/i.test(value)) return "combo";
  if (/oil|sesame|gnut|coco/i.test(value)) return "oil";
  if (/honey/i.test(value)) return "honey";
  return "ghee";
}
export function trackPageView(url: string) {
  pushDataLayer("page_view", { page_location: url });
}
export function trackViewContent(item: {
  productName: string;
  price: number;
  sku: string;
  category?: string;
  size: string;
}) {
  const data = {
    currency: "INR",
    value: item.price,
    items: [
      {
        item_id: item.sku,
        item_name: item.productName,
        item_category: itemCategory(item.category ?? item.sku),
        item_variant: item.size,
        price: item.price,
        quantity: 1,
      },
    ],
  };
  const sent = ecommerce("view_item", data, { page_location: win()?.location.href });
  return sent;
}
function cartItems(items: CartItem[]) {
  return items.map((i) => ({
    item_id: i.sku,
    item_name: i.productName,
    item_category: itemCategory(i.routePrefix),
    item_variant: i.size,
    price: i.price,
    quantity: i.quantity,
  }));
}
export function trackAddToCart(item: CartItem) {
  if (!item.sku) return false; // Never substitute an unrelated variant UUID for a SKU.
  const data = { currency: "INR", value: item.price * item.quantity, items: cartItems([item]) };
  const sent = ecommerce("add_to_cart", data);
  if (sent) {
    pushDataLayer("klaviyo_added_to_cart", data);
  }
  return sent;
}
export function trackBeginCheckout(items: CartItem[]) {
  if (!items.length || items.some((i) => !i.sku)) return false;
  const data = {
    currency: "INR",
    value: Number(items.reduce((n, i) => n + i.price * i.quantity, 0).toFixed(2)),
    items: cartItems(items),
  };
  const sent = ecommerce("begin_checkout", data);
  if (sent) {
    pushDataLayer("klaviyo_started_checkout", data);
  }
  return sent;
}
export type PurchaseData = Pick<
  Order,
  "id" | "paymentStatus" | "subtotal" | "shippingAmount" | "taxAmount" | "items"
>;
export function trackPurchase(order: PurchaseData) {
  const w = win();
  if (
    !w ||
    !analyticsConsented() ||
    (order.paymentStatus !== "paid" && order.paymentStatus !== "cod_pending") ||
    window.location.pathname !== `/order-confirmed/${encodeURIComponent(order.id)}`
  )
    return false;
  const key = `va_purchase_sent_${order.id}`;
  if (w.__varaPurchases?.has(key)) return true;
  try {
    if (localStorage.getItem(key)) return true;
  } catch {
    /* In-memory dedupe remains available. */
  }
  const data = {
    transaction_id: order.id,
    currency: "INR",
    value: order.subtotal,
    shipping: order.shippingAmount,
    tax: order.taxAmount,
    coupon: undefined,
    items: order.items.map((i) => ({
      item_id: i.sku,
      item_name: i.productName,
      item_category: itemCategory(i.category ?? i.sku),
      item_variant: i.size,
      price: i.unitPrice,
      quantity: i.quantity,
    })),
  };
  const eventId = `purchase_${order.id}`;
  ecommerce("purchase", data, { event_id: eventId });
  (w.__varaPurchases ??= new Set()).add(key);
  try {
    localStorage.setItem(key, "1");
  } catch {
    /* Storage may be blocked. */
  }
  return true;
}
