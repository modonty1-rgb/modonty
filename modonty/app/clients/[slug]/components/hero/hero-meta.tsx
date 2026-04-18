import { IconUsers, IconArticle, IconViews } from "@/lib/icons";
import type { ClientHeroClient, ClientHeroStats } from "./types";
import { localizeCountry } from "./utils";

interface HeroMetaProps {
  client: ClientHeroClient;
  stats: ClientHeroStats;
  tagline: string | null;
}

export function HeroMeta({ client, stats, tagline }: HeroMetaProps) {
  return (
    <>
      {tagline && (
        <p className="text-sm md:text-base text-muted-foreground line-clamp-2">
          {tagline}
        </p>
      )}

      <div className="flex items-center gap-2 sm:gap-3 flex-nowrap overflow-hidden">
        <span className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground shrink-0">
          <IconUsers className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          <span className="font-semibold text-foreground tabular-nums">
            {new Intl.NumberFormat("ar-SA").format(stats.followers)}
          </span>
          متابع
        </span>
        <span className="h-3 w-px bg-border shrink-0" aria-hidden />
        <span className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground shrink-0">
          <IconArticle className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          <span className="font-semibold text-foreground tabular-nums">
            {new Intl.NumberFormat("ar-SA").format(stats.articles)}
          </span>
          مقال
        </span>
        <span className="h-3 w-px bg-border shrink-0" aria-hidden />
        <span className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground shrink-0">
          <IconViews className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          <span className="font-semibold text-foreground tabular-nums">
            {new Intl.NumberFormat("ar-SA").format(stats.totalViews)}
          </span>
          مشاهدة
        </span>
      </div>

      {client.legalName && client.legalName !== client.name && (
        <p className="text-xs md:text-sm text-muted-foreground">
          {client.legalName}
        </p>
      )}

      {client.commercialRegistrationNumber && (
        <p className="text-[11px] md:text-xs text-muted-foreground">
          منشأة مسجلة في {localizeCountry(client.addressCountry) || "السعودية"} · رقم السجل التجاري:{" "}
          <span dir="ltr" className="font-mono">
            {client.commercialRegistrationNumber}
          </span>
        </p>
      )}
    </>
  );
}
