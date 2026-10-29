import { ButtonLink } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";

const perks = [
  "Report delivery issues within 24 hours",
  "Replacement or refund after verification",
  "Lab report on every order",
  "Free Bengaluru delivery",
];

/** Honest launch CTA — no fake reviews (design/Dev Kit). */
export function FirstOrderCTA({ product, variant }: { product: Product; variant: ProductVariant }) {
  return (
    <section className="bg-navy px-6 py-20 text-center md:px-[8%]" aria-label="Be among the first">
      <div className="mx-auto max-w-[720px]">
        <p className="text-gold mb-4 text-[11px] font-medium tracking-[0.28em] uppercase">
          Be among the first
        </p>
        <h2 className="text-ivory mb-3.5 font-serif text-[clamp(1.625rem,3vw,2.5rem)] leading-tight font-semibold">
          Vara is launching in Bengaluru.{" "}
          <em className="text-gold-lt italic">Your kitchen, our first test.</em>
        </h2>
        <p className="text-ivory/60 mx-auto mb-8 max-w-[480px] text-[15px] leading-relaxed font-light">
          We&apos;re a new brand. We don&apos;t have hundreds of reviews yet — and we won&apos;t
          pretend otherwise. What we do have is verified supply, NABL lab reports, and support for
          expired, spoiled, damaged or incorrect deliveries reported within 24 hours with photo
          proof.
        </p>
        <ul className="mb-9 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {perks.map((perk) => (
            <li key={perk} className="text-ivory/65 flex items-center gap-2 text-[12.5px]">
              <span className="border-gold-lt/40 bg-gold-lt/20 text-gold-lt flex h-[18px] w-[18px] items-center justify-center rounded-full border">
                <CheckIcon width={10} height={10} />
              </span>
              {perk}
            </li>
          ))}
        </ul>
        <ButtonLink href={`/${product.routePrefix}/${variant.routeSlug}`} variant="gold">
          Try Vara — {formatPrice(variant.price)}
        </ButtonLink>
        <p className="text-ivory/35 mt-3.5 text-[11.5px] font-light">
          {product.productName} · {variant.size} · Ships in 48 hours
        </p>
      </div>
    </section>
  );
}
