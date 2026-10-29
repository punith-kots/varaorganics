// @vitest-environment node
import { describe, expect, it } from "vitest";
import { singleGheePackage } from "@/lib/shiprocket/packages";

describe("Shiprocket single-jar packaging", () => {
  it.each([
    ["VARA-GHEE-1000", 13.5, 22, 1.55],
    ["VARA-GHEE-500", 12, 17.5, 0.8],
    ["VARA-GHEE-250", 11, 16, 0.5],
  ] as const)("uses the supplied packed measurements for %s", (sku, width, height, weight) => {
    expect(singleGheePackage([{ sku, quantity: 1 }])).toEqual({
      length: width, breadth: width, height, weight,
    });
  });

  it("does not apply a single-jar box to multiple jars or other products", () => {
    expect(singleGheePackage([{ sku: "VARA-GHEE-500", quantity: 2 }])).toBeNull();
    expect(singleGheePackage([{ sku: "VARA-HONEY-500", quantity: 1 }])).toBeNull();
    expect(singleGheePackage([{ sku: "VARA-GHEE-500", quantity: 1 }, { sku: "VARA-GHEE-250", quantity: 1 }])).toBeNull();
    expect(singleGheePackage([])).toBeNull();
  });
});
