import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { catalog } from "@/data/catalog";
import { getDisplayVariant } from "@/features/products/helpers";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { useCart } from "@/features/cart/store";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/lib/useHydrated", () => ({ useHydrated: () => true }));
const product = {
  ...catalog[0]!,
  variants: catalog[0]!.variants.map((v) => ({ ...v, active: true, stock: 10 })),
};
beforeEach(() => {
  localStorage.clear();
  useCart.setState({ items: [] });
  Object.assign(window, { __varaConsent: true, dataLayer: [] });
});
afterEach(cleanup);
describe("default sizes", () => {
  it("prefers 1L and falls back when unavailable", () => {
    expect(getDisplayVariant(product).size).toBe("1L");
    const fallback = getDisplayVariant({
      ...product,
      variants: product.variants.map((v) => ({ ...v, stock: v.unitBase === 1000 ? 0 : 10 })),
    });
    expect(fallback.stock).toBeGreaterThan(0);
    expect(fallback.unitBase).not.toBe(1000);
  });
  it("prefers 1kg honey and preserves bundles", () => {
    const honey = catalog.find((p) => p.category === "honey")!;
    expect(
      getDisplayVariant({
        ...honey,
        variants: honey.variants.map((v) => ({ ...v, active: true, stock: 10 })),
      }).unitBase,
    ).toBe(1000);
    const bundle = { ...product, isBundle: true };
    expect(getDisplayVariant(bundle)).toEqual(product.variants.find((v) => v.routeSlug));
  });
  it("recognizes full-size labels when old unit metadata is missing", () => {
    const legacy = { ...product, variants: product.variants.map((v) => ({ ...v, unitBase: 0 })) };
    expect(getDisplayVariant(legacy).sku).toBe("VARA-GHEE-1000");
    const honey = catalog.find((p) => p.category === "honey")!;
    expect(getDisplayVariant({ ...honey, variants: honey.variants.map((v) => ({ ...v, active: true, stock: 10, unitBase: 0 })) }).size).toBe("1kg");
  });
  it("tracks and adds the selected SKU, including a manual size change", () => {
    const initial = getDisplayVariant(product);
    render(<PurchasePanel product={product} initialVariantId={initial.id} />);
    expect(screen.getByRole("button", { name: "1L" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Add to Cart" }));
    expect(useCart.getState().items[0]).toMatchObject({ sku: "VARA-GHEE-1000", size: "1L", price: 2199 });
    const events = (window as unknown as { dataLayer: Record<string, any>[] }).dataLayer;
    expect(events.find((e) => e.event === "view_item")!.ecommerce.items[0].item_id).toBe(
      initial.sku,
    );
    expect(events.find((e) => e.event === "add_to_cart")!.ecommerce.items[0].item_id).toBe(
      initial.sku,
    );
    fireEvent.click(screen.getByRole("button", { name: "500ml" }));
    expect(screen.getByRole("button", { name: "500ml" })).toHaveAttribute("aria-pressed", "true");
  });
});
it("adds and removes COD fee as checkout payment choice changes", () => {
  const v = getDisplayVariant(product);
  useCart.setState({
    items: [
      {
        variantId: v.id,
        sku: v.sku,
        productId: product.id,
        slug: product.slug,
        routePrefix: product.routePrefix,
        productName: product.productName,
        size: v.size,
        price: 1199,
        quantity: 1,
        unitLabel: v.unitLabel,
        image: null,
      },
    ],
  });
  render(<CheckoutForm freeThreshold={999} />);
  expect(screen.queryByText("COD charges:")).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: "Cash on Delivery" }));
  expect(screen.getByText("COD charges:")).toBeInTheDocument();
  expect(screen.getByText("₹99")).toBeInTheDocument();
  expect(screen.getByText("₹1,298")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("radio", { name: "UPI" }));
  expect(screen.queryByText("COD charges:")).toBeNull();
  expect(screen.queryByText("₹1,298")).toBeNull();
});

it("uses category-specific badges and labels unavailable sizes", () => {
  const oil = {
    ...product,
    category: "oils" as const,
    routePrefix: "oils" as const,
    variants: product.variants.map((v) => ({ ...v, stock: 0 })),
  };
  render(<PurchasePanel product={oil} initialVariantId={oil.variants[0]!.id} />);
  expect(screen.getByText("Wooden Ghani Pressed")).toBeInTheDocument();
  expect(screen.queryByText("Bilona Method")).toBeNull();
  expect(screen.getByRole("button", { name: "Add to Cart" })).toBeDisabled();
  expect(screen.getAllByRole("button", { name: /Out of stock/ }).length).toBe(oil.variants.length);
});
