"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/features/cart/store";
import { formatPrice, unitPrice, cn } from "@/lib/utils";
import { useConsentTracking } from "@/lib/analytics/useConsentTracking";
import { trackViewContent } from "@/lib/analytics/events";
import { MinusIcon, PlusIcon, CheckIcon } from "@/components/ui/Icons";
import type { Product, ProductVariant } from "@/types";

/**
 * Above-the-fold purchase controls. Selecting a size updates the price inline
 * (no reload) and, when the variant has its own indexable slug, updates the URL
 * to that canonical path via history (§C3). Add-to-cart wires the global store.
 */
export function PurchasePanel({
  product,
  initialVariantId,
}: {
  product: Product;
  initialVariantId: string;
}) {
  const trustItems =
    product.category === "oils"
      ? ["NABL Tested", "Wooden Ghani Pressed", "Unrefined", "Batch Traced"]
      : product.category === "honey"
        ? [
            "NABL Tested",
            "Raw and Unprocessed",
            product.slug.includes("wild") ? "Wild Forest" : "Natural Honey",
            "Batch Traced",
          ]
        : ["NABL Tested", "Bilona Method", "No Antibiotics", "Batch Traced"];
  const activeVariants = product.variants.filter((v) => v.active);
  const [variantId, setVariantId] = useState(initialVariantId);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const variant = activeVariants.find((v) => v.id === variantId) ?? activeVariants[0]!;
  const unit = unitPrice(variant.price, variant.unitBase, variant.unitType);
  const inStock = variant.stock > 0;

  // Keep the displayed size and URL aligned before the impression is queued.
  useEffect(() => {
    const path = variant.routeSlug
      ? `/${product.routePrefix}/${variant.routeSlug}`
      : `/${product.routePrefix}/${product.slug}?size=${encodeURIComponent(variant.size)}`;
    const url = new URL(window.location.href);
    const selected = new URL(path, url.origin);
    url.pathname = selected.pathname;
    if (selected.searchParams.has("size")) url.searchParams.set("size", variant.size);
    else url.searchParams.delete("size");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [product.routePrefix, product.slug, variant.routeSlug, variant.size]);

  useConsentTracking(
    () =>
      trackViewContent({
        productName: product.productName,
        price: variant.price,
        sku: variant.sku,
        size: variant.size,
        category: product.isBundle ? "combo" : product.category,
      }),
    variant.sku,
  );

  function select(v: ProductVariant) {
    setVariantId(v.id);
  }

  function add() {
    addItem({
      variantId: variant.id,
      sku: variant.sku,
      productId: product.id,
      slug: product.slug,
      routePrefix: product.routePrefix,
      productName: product.productName,
      size: variant.size,
      price: variant.price,
      unitLabel: variant.unitLabel,
      image: product.images[0]?.url ?? null,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline gap-3" aria-live="polite">
        <span className="text-navy font-serif text-3xl font-semibold">
          {formatPrice(variant.price)}
        </span>
        {variant.compareAtPrice && (
          <span className="text-navy/40 text-lg font-light line-through">
            {formatPrice(variant.compareAtPrice)}
          </span>
        )}
      </div>
      {unit && <p className="text-navy/50 mb-5 text-sm font-light">{unit}</p>}

      {activeVariants.length > 1 && (
        <div className="mb-5">
          <p className="text-navy/50 mb-2 text-xs font-medium tracking-[0.12em] uppercase">Size</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Select size">
            {activeVariants.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={v.id === variantId}
                onClick={() => select(v)}
                className={cn(
                  "rounded-[2px] border px-4 py-2 text-sm transition-colors",
                  v.id === variantId
                    ? "border-navy bg-navy text-ivory"
                    : "border-navy/15 text-navy/70 hover:border-navy",
                )}
              >
                {v.size}
                {v.stock <= 0 ? " — Out of stock" : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className={cn("mb-5 text-sm font-medium", inStock ? "text-success" : "text-danger")}>
        {inStock ? `In stock — ships in 48 hours` : "Currently out of stock"}
      </p>

      <div className="mb-6 flex items-center gap-4">
        <div className="border-navy/15 flex items-center overflow-hidden rounded-[2px] border">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="text-navy hover:bg-navy/5 flex h-11 w-11 items-center justify-center"
          >
            <MinusIcon width={16} height={16} />
          </button>
          <span className="text-navy flex h-11 w-11 items-center justify-center" aria-live="polite">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            className="text-navy hover:bg-navy/5 flex h-11 w-11 items-center justify-center"
          >
            <PlusIcon width={16} height={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={!inStock}
          className="bg-navy text-ivory hover:bg-amber flex-1 rounded-[2px] px-8 py-4 text-xs font-semibold tracking-[0.16em] uppercase transition-colors disabled:opacity-50"
        >
          {added ? "✓ Added to Cart" : "Add to Cart"}
        </button>
      </div>

      <ul className="border-navy/10 grid grid-cols-2 gap-3 border-t pt-5 sm:grid-cols-4">
        {trustItems.map((item) => (
          <li key={item} className="text-navy/65 flex items-center gap-1.5 text-[11px] font-medium">
            <span className="bg-success/15 text-success flex h-4 w-4 items-center justify-center rounded-full">
              <CheckIcon width={10} height={10} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
