import Image from "next/image";
import Link from "next/link";

import { getOptimizedLogoUrl } from "@/lib/image-utils";
import { getBrandMedia } from "@/lib/settings/get-brand-media";
import { BRAND_AR } from "@/lib/brand";

interface LogoNavProps {
  className?: string;
}

// One logo for the whole navbar — the wide wordmark (Settings.logoUrl, single source of truth).
// Same logo on desktop and mobile; only the size differs (mobile is rendered larger for legibility).
// If no logo is set, we gracefully show the brand name as text — the admin is alerted to
// upload the logo via the EssentialSeoDialog in the admin app.
export async function LogoNav({ className }: LogoNavProps) {
  const { logoUrl } = await getBrandMedia();

  return (
    <Link
      href="/"
      className="inline-block shrink-0 transition-transform duration-200 hover:scale-[1.03]"
      aria-label={`${BRAND_AR} - الصفحة الرئيسية`}
    >
      {logoUrl ? (
        <Image
          src={getOptimizedLogoUrl(logoUrl)}
          alt={BRAND_AR}
          width={351}
          height={85}
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 768px) 150px, 120px"
          className={`object-contain h-9 w-[150px] md:h-10 md:w-[120px] ${className ?? ""}`}
        />
      ) : (
        <span className="text-lg font-bold text-primary">{BRAND_AR}</span>
      )}
    </Link>
  );
}
