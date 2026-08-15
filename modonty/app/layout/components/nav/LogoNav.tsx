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
      className="inline-block shrink-0 transition-transform duration-200 hover:scale-[1.03]"
      aria-label={`${BRAND_AR} - الصفحة الرئيسية`}
    >
      {source ? (
        <OptimizedImage
          media={asMedia(source, BRAND_AR)}
          alt={BRAND_AR}
          width={96}
          height={96}
          loading="eager"
          fetchPriority="high"
          sizes="40px"
          className={`h-9 w-9 object-contain md:h-10 md:w-10 ${className ?? ""}`}
        />
      ) : (
        <span className="text-lg font-bold text-primary">{BRAND_AR}</span>
      )}
    </Link>
  );
}
