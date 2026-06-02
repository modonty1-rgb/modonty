import Image from "next/image";
import Link from "next/link";

import { getOptimizedLogoUrl } from "@/lib/image-utils";
import { getBrandMedia } from "@/lib/settings/get-brand-media";
import { BRAND_AR } from "@/lib/brand";

interface LogoNavProps {
  className?: string;
  /** "full" = wide wordmark (desktop) · "icon" = small mark (mobile, falls back to full). */
  variant?: "full" | "icon";
}

// Logo is admin-managed (Settings, single source of truth):
//   - full  → Settings.logoUrl (desktop)
//   - icon  → Settings.logoIconUrl, falling back to logoUrl (mobile)
// If neither exists, we gracefully show the brand name as text — the admin is alerted to
// upload the logo(s) via the EssentialSeoDialog in the admin app.
export async function LogoNav({ className, variant = "full" }: LogoNavProps) {
  const { logoUrl, logoIconUrl } = await getBrandMedia();
  const src = variant === "icon" ? logoIconUrl || logoUrl : logoUrl;

  const isIcon = variant === "icon";
  const width = isIcon ? 40 : 120;
  const height = 40;
  const imgClass = isIcon
    ? "object-contain h-9 w-9"
    : "object-contain h-9 w-[100px] md:h-10 md:w-[120px]";

  return (
    <Link
      href="/"
      className="inline-block shrink-0 transition-transform duration-200 hover:scale-[1.03]"
      aria-label={`${BRAND_AR} - الصفحة الرئيسية`}
    >
      {src ? (
        <Image
          src={getOptimizedLogoUrl(src)}
          alt={BRAND_AR}
          width={width}
          height={height}
          loading="eager"
          fetchPriority="high"
          sizes={isIcon ? "40px" : "120px"}
          className={`${imgClass} ${className ?? ""}`}
        />
      ) : (
        <span className="text-lg font-bold text-primary">{BRAND_AR}</span>
      )}
    </Link>
  );
}
