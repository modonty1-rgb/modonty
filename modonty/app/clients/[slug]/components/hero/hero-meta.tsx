import type { ClientHeroClient, ClientHeroStats } from "./types";

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

      <p className="text-sm text-muted-foreground">
        {stats.followers.toLocaleString("ar-SA")} متابع ·{" "}
        {stats.articles.toLocaleString("ar-SA")} مقال ·{" "}
        {stats.totalViews.toLocaleString("ar-SA")} مشاهدة
      </p>

      {client.legalName && client.legalName !== client.name && (
        <p className="text-xs md:text-sm text-muted-foreground">
          {client.legalName}
        </p>
      )}

      {client.commercialRegistrationNumber && (
        <p className="text-[11px] md:text-xs text-muted-foreground">
          منشأة مسجلة في {client.addressCountry || "السعودية"} · رقم السجل التجاري:{" "}
          <span dir="ltr" className="font-mono">
            {client.commercialRegistrationNumber}
          </span>
        </p>
      )}
    </>
  );
}
