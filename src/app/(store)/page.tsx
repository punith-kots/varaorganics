import { getDisplayVariant } from "@/features/products/helpers";
import { getStoreProducts, getFeaturedProducts, getBundle } from "@/features/products/queries";
import { getSiteSettings } from "@/features/settings/queries";
import { getPublishedCombos } from "@/features/combos/queries";
import { BenefitsBar } from "@/components/home/BenefitsBar";
import { Hero } from "@/components/home/Hero";
import { GheeComparison } from "@/components/product/GheeComparison";
import { PainPoints } from "@/components/home/PainPoints";
import { ProductGrid } from "@/components/home/ProductGrid";
import { WhyVara } from "@/components/home/WhyVara";
import { QRProof } from "@/components/home/QRProof";
import { Process } from "@/components/home/Process";
import { Bundle } from "@/components/home/Bundle";
import { FirstOrderCTA } from "@/components/home/FirstOrderCTA";
import { CategoryQuickNav } from "@/components/home/CategoryQuickNav";
import { CombosPreview } from "@/components/home/CombosPreview";
import { StickyCart } from "@/components/layout/StickyCart";
import { JsonLd } from "@/components/schema/JsonLd";
import { organizationSchema, websiteSchema, faqSchema } from "@/components/schema/builders";
import { homeFaqs } from "@/data/homeFaqs";
import { categoryLabel } from "@/lib/utils";
import type { Category } from "@/types";

// Homepage: SSG with ISR (Dev Kit §06 — revalidate 60s for price freshness).
export const revalidate = 60;

const PRODUCTS_ANCHOR = "home-products";

export default async function HomePage() {
  const [products, featured, bundle, settings, combos] = await Promise.all([
    getStoreProducts(),
    getFeaturedProducts(),
    getBundle("wellness-starter"),
    getSiteSettings(),
    getPublishedCombos(),
  ]);

  // Featured ghee drives Hero / StickyCart / FirstOrderCTA.
  const heroProduct = featured.find((p) => p.category === "ghee") ?? products[0]!;
  const heroVariant = getDisplayVariant(heroProduct);
  const availableCategories = (["ghee", "honey", "oils"] as Category[])
    .map((category) => ({
      key: category,
      label: categoryLabel(category),
      count: products.filter((product) => product.category === category).length,
    }))
    .filter((category) => category.count > 0);

  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={faqSchema(homeFaqs)} />

      <CategoryQuickNav categories={availableCategories} />
      {/* Static two-column hero (Website Changes §02 — carousel removed). */}
      <div>
        <Hero
          product={heroProduct}
          variant={heroVariant}
          headline={settings.heroHeadline}
          headlineEm={settings.heroHeadlineEm}
        />
      </div>
      <div className="bg-ivory hidden px-6 py-12 md:block">
        <GheeComparison batch={heroProduct.currentBatch} />
      </div>
      {/* Single trust strip below the hero (consolidated from two). */}
      <BenefitsBar />
      <PainPoints />

      <div id={PRODUCTS_ANCHOR} className="scroll-mt-[68px]">
        <ProductGrid products={products} />
      </div>

      <CombosPreview combos={combos} />

      <WhyVara product={heroProduct} />
      <QRProof />
      <Process />
      {bundle && <Bundle bundle={bundle} />}
      <FirstOrderCTA product={heroProduct} variant={heroVariant} />

      <StickyCart
        targetId={PRODUCTS_ANCHOR}
        note="Free Bengaluru delivery"
        item={{
          variantId: heroVariant.id,
          sku: heroVariant.sku,
          productId: heroProduct.id,
          slug: heroProduct.slug,
          routePrefix: heroProduct.routePrefix,
          productName: heroProduct.productName,
          size: heroVariant.size,
          price: heroVariant.price,
          unitLabel: heroVariant.unitLabel,
          image: heroProduct.images[0]?.url ?? null,
        }}
      />
    </>
  );
}
