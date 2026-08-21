import Link from "next/link";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";


import { getBrandMedia } from "@/lib/settings/get-brand-media";
import { BRAND_AR } from "@/constants";

interface LogoNavProps {
  className?: string;
}

// The navbar uses the compact logomark. The full wordmark is reserved for surfaces
// with enough room, such as the publisher sticker in the Home experience.
export async function LogoNav({ className }: LogoNavProps) {
  const { logoIconUrl, logoUrl } = await getBrandMedia();
  const source = logoIconUrl ?? logoUrl;

  return (
    <Link
      href="/"
      className="inline-flex min-h-11 max-w-full shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-[1.03]"
      aria-label={`${BRAND_AR} - الصفحة الرئيسية`}
    >
      {source ? (
        // Fixed HEIGHT, free width. When no compact icon is set, this is the full wordmark
        // (~4:1) — forcing it into a 40×40 square squeezed it to 10px tall and requested
        // a 48px-wide file (measured 2026-08-15). A square icon uploaded later still fits:
        // the browser keeps the natural aspect and only the height is fixed.
        <OptimizedImage
          media={asMedia(source, BRAND_AR)}
          alt={BRAND_AR}
          width={160}
          height={40}
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 767px) 104px, 160px"
          className={`h-7 w-auto max-w-full object-contain md:h-8 ${className ?? ""}`}
        />
      ) : (
        <span className="text-lg font-bold text-link">{BRAND_AR}</span>
      )}
    </Link>
  );
}
