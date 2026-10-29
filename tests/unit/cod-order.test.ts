// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
import type { CreateOrderInput } from "@/lib/validation/checkout";
const m = vi.hoisted(() => ({ save: vi.fn(), price: 1199 }));
vi.mock("@/lib/validation/env", () => ({
  USE_MOCK_DATA: true,
  SITE_URL: "https://varaorganic.com",
  publicEnv: {},
  optionalServerEnv: () => undefined,
}));
vi.mock("@/features/products/queries", () => ({
  getVariantById: async () => ({
    product: {
      id: "p",
      slug: "ghee",
      category: "ghee",
      routePrefix: "ghee",
      productName: "Ghee",
      images: [],
    },
    variant: {
      id: "v",
      sku: "VARA-GHEE-1000",
      size: "1L",
      active: true,
      stock: 100,
      get price() {
        return m.price;
      },
    },
  }),
  getAllProducts: async () => [],
}));
vi.mock("@/features/combos/queries", () => ({ getComboByCheckoutSku: async () => null }));
vi.mock("@/features/settings/queries", () => ({
  getSiteSettings: async () => ({ freeShippingThreshold: 999 }),
}));
vi.mock("@/features/orders/store", () => ({
  saveOrder: m.save,
  findOrderIdByIdempotency: async () => null,
  getOrder: vi.fn(),
  updateOrder: vi.fn(),
  findOrderByRazorpayOrderId: vi.fn(),
}));
import { createPendingOrder } from "@/features/orders/service";
const input = {
  customer: {
    fullName: "Buyer",
    email: "buyer@example.com",
    phone: "9876543210",
    addressLine1: "12 Road",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560001",
    country: "India",
    paymentMethod: "cod",
  },
  items: [{ variantId: "v", quantity: 1 }],
} as CreateOrderInput;
beforeEach(() => {
  m.price = 1199;
  m.save.mockClear();
});
it("persists server-calculated 99 fee without changing product subtotal", async () => {
  const { order } = await createPendingOrder(input, "cod-test");
  expect(order).toMatchObject({
    subtotal: 1199,
    shippingAmount: 99,
    codFee: 99,
    totalAmount: 1298,
    paymentStatus: "cod_pending",
  });
  expect(m.save).toHaveBeenCalledWith(expect.objectContaining({ codFee: 99 }), "cod-test");
});
it("charges ordinary shipping plus COD below threshold, no COD fee for online", async () => {
  m.price = 400;
  expect((await createPendingOrder(input, "low")).order).toMatchObject({
    subtotal: 400,
    shippingAmount: 178,
    codFee: 99,
    totalAmount: 578,
  });
  expect(
    (
      await createPendingOrder(
        { ...input, customer: { ...input.customer, paymentMethod: "upi" } },
        "online",
      )
    ).order,
  ).toMatchObject({ subtotal: 400, shippingAmount: 79, codFee: 0, totalAmount: 479 });
});
