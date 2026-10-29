// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("razorpay", () => ({
  default: class {
    payments = { fetch: mocks.fetch };
  },
}));
vi.mock("@/lib/validation/env", () => ({
  USE_MOCK_DATA: false,
  publicEnv: { NEXT_PUBLIC_RAZORPAY_KEY_ID: "test" },
  optionalServerEnv: () => "secret",
}));
import { confirmCapturedPayment } from "@/lib/razorpay/server";
const payment = {
  id: "pay_test",
  order_id: "order_test",
  status: "captured",
  captured: true,
  amount: 127800,
  currency: "INR",
};
describe("captured payment verification", () => {
  beforeEach(() => {
    mocks.fetch.mockResolvedValue(payment);
  });
  it("accepts matching captured total including shipping", async () => {
    expect(await confirmCapturedPayment("pay_test", "order_test", 1278, "INR")).toBe(true);
  });
  it.each([
    { status: "authorized", captured: false },
    { status: "failed" },
    { order_id: "other" },
    { amount: 119900 },
    { currency: "USD" },
    { id: "other" },
  ])("rejects mismatched or uncaptured payment %j", async (change) => {
    mocks.fetch.mockResolvedValue({ ...payment, ...change });
    expect(await confirmCapturedPayment("pay_test", "order_test", 1278, "INR")).toBe(false);
  });
  it("fails closed when provider is unavailable", async () => {
    mocks.fetch.mockRejectedValue(new Error("offline"));
    await expect(confirmCapturedPayment("pay_test", "order_test", 1278, "INR")).rejects.toThrow();
  });
});
