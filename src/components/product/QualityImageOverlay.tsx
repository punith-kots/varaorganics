"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import styles from "./QualityImageOverlay.module.css";

/** Sits inside a positioned product image frame without changing its layout. */
export function QualityImageOverlay({ name, href }: { name: string; href?: string }) {
  const [revealed, setRevealed] = useState(false);
  const pointer = useRef("mouse");

  function handleClick(event: MouseEvent<HTMLElement>) {
    if (!href) {
      setRevealed((value) => !value);
    } else if (pointer.current !== "mouse" && event.detail !== 0 && !revealed) {
      event.preventDefault();
      setRevealed(true);
    }
  }

  const props = {
    className: styles.trigger,
    "data-revealed": revealed,
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      pointer.current = event.pointerType;
    },
    onBlur: () => setRevealed(false),
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Escape") {
        setRevealed(false);
        event.currentTarget.blur();
      }
    },
    onClick: handleClick,
  };
  const artwork = (
    <span className={styles.artwork} aria-hidden="true">
      <Image
        src="/product-images/quality-checks.jpeg"
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-contain"
        data-quality-artwork
      />
      {href && revealed && <span className={styles.hint}>Tap again to view product</span>}
    </span>
  );

  return href ? (
    <Link
      {...props}
      href={href}
      aria-label={`${name} — view product; hover or tap for quality checks`}
    >
      {artwork}
    </Link>
  ) : (
    <button
      {...props}
      type="button"
      aria-label={`${name} — show quality checks`}
      aria-pressed={revealed}
    >
      {artwork}
    </button>
  );
}
