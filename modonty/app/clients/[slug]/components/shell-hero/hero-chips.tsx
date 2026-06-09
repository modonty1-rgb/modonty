import { localizeCountry } from "../hero/utils";

interface HeroChipsClient {
  industry?: { name: string } | null;
  addressCity?: string | null;
  addressCountry?: string | null;
  foundingDate?: Date | null;
}

interface HeroChipsProps {
  client: HeroChipsClient;
}

/** Industry / location / founding-year pills under the tagline. Hide-if-empty. */
export function HeroChips({ client }: HeroChipsProps) {
  const country = localizeCountry(client.addressCountry);
  const location = [client.addressCity, country].filter(Boolean).join("، ");
  const foundingYear = client.foundingDate
    ? new Date(client.foundingDate).getFullYear()
    : null;

  if (!client.industry?.name && !location && !foundingYear) return null;

  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {client.industry?.name && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/[0.08] px-2.5 py-1 text-[11.5px] font-bold text-primary">
          🏷️ {client.industry.name}
        </span>
      )}
      {location && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[11.5px] text-muted-foreground">
          📍 {location}
        </span>
      )}
      {foundingYear && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-[11.5px] text-muted-foreground">
          🗓️ تأسست {foundingYear}
        </span>
      )}
    </div>
  );
}
