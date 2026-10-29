import type { Product, ProductVariant } from "@/types";

/** Prefer in-stock 1L / 1kg; fall back to the first available catalogue size. */
export function getDisplayVariant(product: Product): ProductVariant {
  const active = product.variants.filter((v) => v.active);
  const original = active.find((v) => v.routeSlug) ?? active[0] ?? product.variants[0]!;
  if (product.isBundle) return original;
  const unit = product.category === "honey" ? "g" : "ml";
  const preferred = active.find((v) => {
    // Older catalogue rows can have stale unit_base values; size is also authoritative.
    const size = v.size.trim().toLowerCase().replace(/\s+/g, "");
    const fullSize = unit === "g" ? /^(1kg|1000g)$/ : /^(1l|1litre|1liter|1000ml)$/;
    return (v.unitBase === 1000 && v.unitType === unit) || fullSize.test(size);
  });
  return (
    (preferred && preferred.stock > 0 ? preferred : undefined) ??
    active.find((v) => v.stock > 0) ??
    preferred ??
    original
  );
}
