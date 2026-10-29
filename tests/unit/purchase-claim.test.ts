// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({
  claimed: false,
  paid: true,
  cod: false,
  error: false,
  eq: vi.fn(),
  neq: vi.fn(),
  or: vi.fn(),
  is: vi.fn(),
  select: vi.fn(),
}));
vi.mock("@/lib/validation/env", () => ({
  USE_MOCK_DATA: false,
  SITE_URL: "https://varaorganic.com",
}));
vi.mock("@/features/orders/store", () => ({ getOrder: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabase: () => ({
    from: () => {
      const q = { update: () => q, eq: m.eq, neq: m.neq, or: m.or, is: m.is, select: m.select };
      m.eq.mockReturnValue(q);
      m.or.mockReturnValue(q);
      m.neq.mockReturnValue(q);
      m.is.mockReturnValue(q);
      m.select.mockImplementation(async () => {
        if (m.error) return { data: null, error: new Error("database down") };
        const winner = (m.paid || m.cod) && !m.claimed;
        if (winner) m.claimed = true;
        return { data: winner ? [{ id: "order" }] : [], error: null };
      });
      return q;
    },
  }),
}));
import { claimBrowserPurchase } from "@/lib/analytics/purchase-claim";
import { POST } from "@/app/api/tracking/purchase/route";
describe("durable browser purchase claim", () => {
  beforeEach(() => {
    m.claimed = false;
    m.paid = true;
    m.cod = false;
    m.error = false;
    vi.clearAllMocks();
  });
  it("allows only one concurrent browser and rejects reopened links", async () => {
    expect(
      await Promise.all([claimBrowserPurchase("order"), claimBrowserPurchase("order")]),
    ).toEqual([true, false]);
    expect(await claimBrowserPurchase("order")).toBe(false);
    expect(m.or).toHaveBeenCalledWith("payment_status.eq.paid,and(payment_method.eq.cod,payment_status.eq.cod_pending)");
    expect(m.is).toHaveBeenCalledWith("browser_purchase_claimed_at", null);
  });
  it("rejects unpaid online orders and claims placed COD once", async () => {
    m.paid = false;
    expect(await claimBrowserPurchase("order")).toBe(false);
    m.cod = true;
    expect(await claimBrowserPurchase("order")).toBe(true);
    expect(await claimBrowserPurchase("order")).toBe(false);
  });
  it("fails closed on database errors", async () => {
    m.error = true;
    await expect(claimBrowserPurchase("order")).rejects.toThrow();
  });
  it("rejects cross-origin requests and absent consent", async () => {
    const req = (origin: string, consent: boolean) =>
      new Request("https://varaorganic.com/api/tracking/purchase", {
        method: "POST",
        headers: { origin, "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: "f78ead52-0f5b-4fc1-a61c-275ec03c49e7", consent }),
      });
    expect((await POST(req("https://other.example", true))).status).toBe(403);
    expect((await POST(req("https://varaorganic.com", false))).status).toBe(422);
    expect(m.claimed).toBe(false);
    expect(await (await POST(req("https://varaorganic.com", true))).json()).toEqual({
      claimed: true,
    });
  });
});
