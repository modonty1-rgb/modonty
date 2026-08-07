import { OptimizedImage, asMedia } from "@modonty/database/components/optimized-image";

import Link from "@/components/link";
import { BRAND_AVATAR_RADIUS } from "@/lib/brand-avatar";
import { IconFilter } from "@/lib/icons";
import { stripCloudinaryTransforms } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { PartnerRow } from "./PartnerRow";

interface NewClientItemProps {
  clientName: string;
  clientSlug: string;
  clientLogo?: string;
  industry?: string;
  articleCount?: number;
}

export function NewClientItem({ clientName, clientSlug, clientLogo, industry, articleCount = 0 }: NewClientItemProps) {
  // next/image (not Radix Avatar): Radix probes every logo via `new Image()` on hydration,
  // which ignores loading="lazy" + display:none — so all sidebar logos fetched full-size on
  // mobile (hidden lg:block) and competed with the LCP. next/image is truly lazy (respects the
  // hidden container) and serves a 28px AVIF. Strip baked-in w_auto so Next resizes cleanly.
  const logoSrc = stripCloudinaryTransforms(clientLogo);

  return (
    <PartnerRow>
      {/* Primary action — visit the partner profile */}
      <Link href={`/clients/${clientSlug}`} className="flex flex-1 min-w-0 items-start gap-3 py-1 px-1">
        <div
          className={cn(
            "relative h-7 w-7 shrink-0 overflow-hidden mt-0.5 flex items-center justify-center bg-primary text-primary-foreground",
            BRAND_AVATAR_RADIUS
          )}
        >
          {logoSrc ? (
            <OptimizedImage
              media={asMedia(logoSrc, clientName)}
              alt={clientName}
              width={28}
              height={28}
              sizes="28px"
              quality={75}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-medium">{clientName?.slice(0, 1) ?? "?"}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground break-words">{clientName}</p>
          {industry && (
            <span className="text-xs text-muted-foreground truncate block">{industry}</span>
          )}
        </div>
      </Link>
      {/* Secondary action — filter the home feed to this partner's articles (hidden when 0) */}
      {articleCount > 0 && (
        <Link
          href={`/?client=${encodeURIComponent(clientSlug)}`}
          aria-label={`اعرض مقالات ${clientName} في الموجز (${articleCount})`}
          title={`مقالات ${clientName}`}
          className="me-1 mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
        >
          <IconFilter className="h-3.5 w-3.5" aria-hidden />
          <span className="tabular-nums">{new Intl.NumberFormat("ar-SA").format(articleCount)}</span>
        </Link>
      )}
    </PartnerRow>
  );
}
