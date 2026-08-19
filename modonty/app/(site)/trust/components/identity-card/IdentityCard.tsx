import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";

import { Card } from "@/components/ui/card";
import { BRAND_AR } from "@/constants";
import { cn } from "@/lib/utils";
import type { LegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";

interface IdentityCardProps {
  ogImageUrl: string | null;
  legal: LegalEntityDisplay;
}

/** The company-profile header: banner, brand mark, name, and the registry line under it. */
export function IdentityCard({ ogImageUrl, legal }: IdentityCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-44 w-full overflow-hidden bg-[#0e065a] sm:h-56">
        {ogImageUrl ? (
          <OptimizedImage
            media={asMedia(ogImageUrl)}
            alt=""
            fill
            preload
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-l from-[#0e065a] to-[#3030ff]" />
        )}
        {/* Square brand mark — overlaid ON the banner (same favicon as the Google preview) */}
        <div className="absolute bottom-4 start-6 inline-flex rounded-2xl border-4 border-white bg-white shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/modonty-mark.svg"
            alt={BRAND_AR}
            width={80}
            height={80}
            className="h-20 w-20 rounded-xl"
          />
        </div>
      </div>
      <div className="px-6 pb-6 pt-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl font-semibold">{BRAND_AR}</h1>
          {/* A verification claim needs a live registration behind it — otherwise the
              badge would contradict the status row below it. */}
          {legal.cr && legal.isRegistrationActive && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
              <VerifiedBadge className="h-4 w-4" label="موثّقة لدى وزارة التجارة" />
              موثّقة لدى وزارة التجارة
            </span>
          )}
        </div>
        <p className="mt-1.5 text-base text-foreground">
          منصة المحتوى العربي للأعمال
          {legal.legalName ? ` — تعمل ضمن مظلّة ${legal.legalName}.` : "."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          {legal.crStatus && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-medium",
                legal.isRegistrationActive ? "text-green-600" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  legal.isRegistrationActive ? "bg-green-600" : "bg-muted-foreground"
                )}
              />{" "}
              السجل {legal.crStatus}
            </span>
          )}
          {legal.city && (
            <span>المقر: <span className="font-medium text-foreground">{legal.city}{legal.country ? `، ${legal.country}` : ""}</span></span>
          )}
          {legal.cr && (
            <span>السجل التجاري: <span className="font-medium text-foreground [direction:ltr]">{legal.cr}</span></span>
          )}
        </div>
      </div>
    </Card>
  );
}
