import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon } from "@/components/ui/Icons";
import { LandingCTA } from "@/components/lp/LandingCTA";
import { LpStickyBar } from "@/components/lp/LpStickyBar";
import {
  ComparisonTable,
  HonestSection,
  LabCard,
  LpFaq,
  LpHeroImage,
  LpTrustStrip,
  PainPointColumns,
  ProcessSteps,
  StorySection,
} from "@/components/lp/sections";
import { Logo } from "@/components/layout/Logo";
import { getLandingPage } from "@/features/articles/landing";
import { findByRouteSlug } from "@/features/products/queries";
import { site } from "@/config/site";

// SSR, personalised per campaign (Dev Kit §07). noindex/nofollow — paid traffic
// only. Lives outside the (store) group so there is NO site navigation.
export const dynamic = "force-dynamic";

const HERO_ID = "lp-hero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lp = await getLandingPage(slug);
  return {
    title: lp?.metaTitle ?? lp?.headline ?? "Vara Organic",
    description: lp?.subheadline,
    robots: lp?.noindex === false ? undefined : { index: false, follow: false },
  };
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lp = await getLandingPage(slug);
  if (!lp) notFound();

  const resolved = await findByRouteSlug(lp.productSlug);
  if (!resolved) notFound();
  const { product } = resolved;
  const variant =
    product.variants.find((v) => v.active && v.size === lp.variantSize) ??
    product.variants.find((v) => v.active)!;

  const cartItem = {
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
  };

  return (
    <main id="main" className="bg-ivory">
      {/* Announcement bar */}
      {lp.announcement && (
        <div className="bg-navy text-gold-lt px-4 py-2.5 text-center text-xs font-light tracking-[0.1em]">
          {lp.announcement}
        </div>
      )}

      {/* Logo only — no navigation on landing pages */}
      <div className="px-6 py-6 md:px-[8%]">
        <Logo />
      </div>

      {/* Hero */}
      <section
        id={HERO_ID}
        className="from-navy-mid to-navy-deep bg-gradient-to-b px-6 py-12 md:px-[8%] md:py-16"
      >
        <div className="mx-auto grid max-w-[1100px] items-center gap-10 md:grid-cols-2">
          <div>
            {lp.eyebrow && (
              <p className="text-gold mb-4 text-[11px] font-medium tracking-[0.28em] uppercase">
                {lp.eyebrow}
              </p>
            )}
            <h1 className="text-ivory mb-4 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.08] font-semibold">
              {lp.headline}
              {lp.headlineEm && (
                <>
                  {" "}
                  <em className="text-gold italic">{lp.headlineEm}</em>
                </>
              )}
            </h1>

            {lp.openingCopy ? (
              lp.openingCopy.split("\n\n").map((para, i, arr) => (
                <p
                  key={para.slice(0, 32)}
                  className={
                    i === arr.length - 1 && arr.length > 1
                      ? "text-ivory mb-6 font-medium"
                      : "text-ivory/70 mb-4 max-w-md text-[15px] leading-relaxed font-light"
                  }
                >
                  {para}
                </p>
              ))
            ) : (
              <p className="text-ivory/70 mb-6 max-w-md text-[15px] leading-relaxed font-light">
                {lp.subheadline}
              </p>
            )}

            {lp.trustBullets.length > 0 && (
              <ul className="mb-8 space-y-2.5">
                {lp.trustBullets.map((bullet) => (
                  <li key={bullet} className="text-ivory/85 flex items-center gap-3 text-[14px]">
                    <span className="bg-gold-lt/20 text-gold-lt flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                      <CheckIcon width={12} height={12} />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            )}

            <LandingCTA
              label={lp.ctaLabel}
              sku={variant.sku}
              item={cartItem}
              tone={lp.ctaButtonColor}
            />
            <p className="text-ivory/45 mt-4 text-sm font-light">
              Free Bangalore delivery · Ships within 48 hours · Report delivery issues within 24 hours
            </p>
          </div>

          <div>
            {lp.showLabCard && product.currentBatch ? (
              <LabCard batch={product.currentBatch} productName={product.productName} />
            ) : (
              <LpHeroImage
                src={product.category === "ghee" ? (product.images[0]?.url ?? null) : lp.heroImage}
                alt={product.productName}
              />
            )}
          </div>
        </div>
      </section>

      {/* Composable sections — toggled from the database */}
      {lp.showComparison && <ComparisonTable rows={lp.comparisonRows} />}
      <LpTrustStrip
        items={[
          "NABL tested — every batch",
          "Own farm · Gir cows · Gujarat",
          "Scan QR · see your batch report",
        ]}
      />
      {lp.showPainPoints && <PainPointColumns pairs={lp.painPoints} />}
      {lp.showProcess && <ProcessSteps steps={lp.processSteps} />}
      {lp.showStory && lp.storyCopy && (
        <StorySection
          heading={lp.storyHeading ?? "Why we started"}
          copy={lp.storyCopy}
          attribution={lp.storyAttribution}
        />
      )}
      {lp.showHonest && lp.honestCopy && <HonestSection copy={lp.honestCopy} />}
      <LpFaq faqs={lp.faqs} />

      {/* Closing CTA */}
      <section className="bg-navy px-6 py-16 text-center md:px-[8%]">
        <div className="mx-auto max-w-[520px]">
          <LandingCTA
            label={lp.secondaryCtaLabel ?? lp.ctaLabel}
            sku={variant.sku}
            item={cartItem}
            tone="navy-on-dark"
          />
          {lp.variantNote && (
            <p className="text-ivory/55 mt-4 text-sm font-light">{lp.variantNote}</p>
          )}
          <p className="text-ivory/40 mt-2 text-xs font-light">
            Free Bangalore delivery on orders ₹999+ · Ships within 48 hours
          </p>
        </div>
      </section>

      {/* Minimal footer — no nav links */}
      <footer className="bg-navy-deep px-6 py-8 text-center md:px-[8%]">
        <p className="text-ivory/45 text-xs font-light">
          © {new Date().getFullYear()} {site.name} · By {site.legalName}
          {site.fssaiLicence ? ` · FSSAI ${site.fssaiLicence}` : " · FSSAI applied"}
        </p>
        <p className="text-ivory/35 mt-2 text-xs font-light">
          Looking for our full website?{" "}
          <Link href="/" className="text-gold-lt underline">
            Visit {site.url.replace(/^https?:\/\//, "")}
          </Link>
        </p>
      </footer>

      <LpStickyBar item={cartItem} ctaLabel="Add to Cart" sku={variant.sku} heroId={HERO_ID} />
    </main>
  );
}
