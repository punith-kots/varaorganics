import { StrictMode } from "react";
import { render, waitFor, cleanup, act } from "@testing-library/react";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { PurchaseTracker } from "@/components/checkout/PurchaseTracker";
import type { PurchaseData } from "@/lib/analytics/events";
const order: PurchaseData = {
  id: "f78ead52-0f5b-4fc1-a61c-275ec03c49e7",
  paymentStatus: "paid",
  subtotal: 1199,
  shippingAmount: 79,
  taxAmount: 0,
  items: [
    {
      sku: "VARA-GHEE-500",
      productName: "Ghee",
      size: "500ml",
      quantity: 1,
      unitPrice: 1199,
      lineTotal: 1199,
    },
  ],
};
const w = window as unknown as {
  __varaConsent: boolean;
  __varaPurchases?: Set<string>;
  dataLayer: Record<string, any>[];
};
let claimed = false;
let request: ReturnType<typeof vi.fn>;
beforeEach(() => {
  claimed = false;
  localStorage.clear();
  w.__varaConsent = true;
  w.__varaPurchases = new Set();
  w.dataLayer = [];
  window.history.replaceState({}, "", `/order-confirmed/${order.id}`);
  request = vi.fn(async () => {
    const won = !claimed;
    claimed = true;
    return { ok: true, json: async () => ({ claimed: won }) };
  });
  vi.stubGlobal("fetch", request);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("emits once under Strict Mode and cannot re-emit from a new browser", async () => {
  render(
    <StrictMode>
      <PurchaseTracker order={order} />
    </StrictMode>,
  );
  await waitFor(() => expect(w.dataLayer.filter((e) => e.event === "purchase")).toHaveLength(1));
  expect(w.dataLayer.find((e) => e.event === "purchase")).toMatchObject({
    event_id: `purchase_${order.id}`,
    ecommerce: { value: 1199, shipping: 79 },
  });
  cleanup();
  localStorage.clear();
  w.__varaPurchases = new Set();
  w.dataLayer = [];
  render(<PurchaseTracker order={order} />);
  await waitFor(() => expect(request.mock.calls.length).toBeGreaterThanOrEqual(3));
  expect(w.dataLayer.filter((e) => e.event === "purchase")).toHaveLength(0);
});
it("does not consume claim before consent", async () => {
  w.__varaConsent = false;
  render(<PurchaseTracker order={order} />);
  expect(request).not.toHaveBeenCalled();
  act(() => {
    w.__varaConsent = true;
    window.dispatchEvent(new Event("vara:consent"));
  });
  await waitFor(() => expect(w.dataLayer.filter((e) => e.event === "purchase")).toHaveLength(1));
});
it("does not emit on claim failure or for unpaid orders", async () => {
  request.mockResolvedValue({ ok: false, json: async () => ({ claimed: false }) });
  const page = render(<PurchaseTracker order={order} />);
  await waitFor(() => expect(request).toHaveBeenCalledOnce());
  expect(w.dataLayer).toEqual([]);
  page.rerender(<PurchaseTracker order={{ ...order, paymentStatus: "pending" }} />);
  expect(request).toHaveBeenCalledOnce();
});

it("emits a placed COD purchase once with the same server event ID", async () => {
  const cod = { ...order, paymentStatus: "cod_pending" as const };
  const page = render(<PurchaseTracker order={cod} />);
  await waitFor(() => expect(w.dataLayer.filter((e) => e.event === "purchase")).toHaveLength(1));
  expect(w.dataLayer.find((e) => e.event === "purchase")).toMatchObject({ event_id: `purchase_${order.id}`, ecommerce: { value: 1199, shipping: 79 } });
  page.unmount();
  render(<PurchaseTracker order={cod} />);
  await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  expect(w.dataLayer.filter((e) => e.event === "purchase")).toHaveLength(1);
});

it("automatically recovers from a temporary claim error without duplicate purchase", async () => {
  request.mockResolvedValueOnce({ ok: false, status: 503 });
  render(<PurchaseTracker order={order} />);
  await waitFor(() => expect(w.dataLayer.filter((e) => e.event === "purchase")).toHaveLength(1), { timeout: 3000 });
  expect(request).toHaveBeenCalledTimes(2);
});
it("does not retry rejected requests or emit a purchase", async () => {
  request.mockResolvedValue({ ok: false, status: 403 });
  render(<PurchaseTracker order={order} />);
  await waitFor(() => expect(request).toHaveBeenCalledOnce());
  act(() => window.dispatchEvent(new Event("online")));
  expect(request).toHaveBeenCalledOnce();
  expect(w.dataLayer).toEqual([]);
});
