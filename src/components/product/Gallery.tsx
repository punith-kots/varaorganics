"use client";

import Image from "next/image";
import { QualityImageOverlay } from "@/components/product/QualityImageOverlay";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

/** Accessible image carousel with a thumbnail strip (Dev Kit §08, §19). */
export function Gallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return <div className="bg-paper aspect-square w-full rounded" aria-hidden="true" />;
  }

  return (
    <div>
      <div className="border-navy/10 bg-ivory relative aspect-square w-full overflow-hidden rounded border">
        <Image
          src={current.url}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={current.url.includes("/vara-ghee-") ? "object-contain" : "object-cover"}
        />
        <QualityImageOverlay key={current.id} name={productName} />
      </div>
      <div
        className="mt-3 grid grid-cols-4 gap-3"
        role="tablist"
        aria-label={`${productName} images`}
      >
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`View image ${i + 1}`}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-square overflow-hidden rounded border transition-colors",
              i === active ? "border-amber" : "border-navy/10 hover:border-navy/30",
            )}
          >
            <Image
              src={img.url}
              alt=""
              fill
              sizes="120px"
              className={img.url.includes("/vara-ghee-") ? "object-contain" : "object-cover"}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
