// @vitest-environment node
import {expect,it,vi} from "vitest";
vi.mock("@/lib/validation/env",()=>({USE_MOCK_DATA:true}));
import {getVariantById,resolveProductRoute} from "@/features/products/queries";
import {catalog} from "@/data/catalog";
import {getDisplayVariant} from "@/features/products/helpers";
it("uses default on product entry but exact requested variant for checkout",async()=>{
 const product=catalog[0]!;
 const small=product.variants.find(v=>v.size==="500ml")!;
 expect((await getVariantById(small.id))?.variant.id).toBe(small.id);
 expect((await resolveProductRoute(product.routePrefix,small.routeSlug!))?.variant.id).toBe(getDisplayVariant(product).id);
 expect(await getVariantById("nonexistent")).toBeNull();
});
