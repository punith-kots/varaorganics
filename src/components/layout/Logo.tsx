import Image from "next/image";
import Link from "next/link";

/** Official Vara wordmark (white margins trimmed). Scales by height, never clips. */
export function Logo() {
  return (
    <Link href="/" aria-label="Vara Organics — home" className="block shrink-0">
      <Image
        src="/brand/varaorganic-wordmark.png"
        alt="Vara Organics"
        width={1105}
        height={386}
        priority
        className="h-8 w-auto md:h-10"
      />
    </Link>
  );
}
