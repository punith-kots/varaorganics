import type { OrderItem } from "@/types";

/** Packed single ghee jars: dimensions in cm, gross weight in kg. */
export const GHEE_PACKAGES = {
  "VARA-GHEE-1000": { length: 13.5, breadth: 13.5, height: 22, weight: 1.55 },
  "VARA-GHEE-500": { length: 12, breadth: 12, height: 17.5, weight: 0.8 },
  "VARA-GHEE-250": { length: 11, breadth: 11, height: 16, weight: 0.5 },
} as const;

export function singleGheePackage(items: Pick<OrderItem, "sku" | "quantity">[]) {
  const item = items[0];
  if (items.length !== 1 || !item || item.quantity !== 1) return null;
  const sku = item.sku;
  if (!Object.hasOwn(GHEE_PACKAGES, sku)) return null;
  return GHEE_PACKAGES[sku as keyof typeof GHEE_PACKAGES];
}
