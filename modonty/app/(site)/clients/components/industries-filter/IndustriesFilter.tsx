import { IndustryTile } from "@/components/shared/industry-tile/IndustryTile";
import { buildPartnersHref } from "@/app/(site)/clients/helpers/build-partners-href";
import { messages, formatCount } from "@/lib/i18n/messages";
import { industryArtwork } from "@/lib/industry-artwork";
import type { IndustryFilterRow } from "@/app/(site)/clients/helpers/count-industries";
import type { PartnersQuery } from "@/app/(site)/clients/helpers/parse-partners-query";
import type { IndustryListItem } from "@/lib/types";

const text = messages.clients.industryFilter;

interface IndustriesFilterProps {
  rows: IndustryFilterRow[];
  industries: IndustryListItem[];
  /** Partners before the industry filter — the number beside «الكل». */
  total: number;
  query: PartnersQuery;
}

/**
 * The rail filter uses the same compact visual cards as `/industries`. The chosen field
 * remains in the URL, so the filtered directory stays shareable, crawlable and refresh-safe.
 */
export function IndustriesFilter({ rows, industries, total, query }: IndustriesFilterProps) {
  const artwork = new Map(industries.map((industry) => [industry.slug, industry]));

  return (
    <nav aria-label={text.navAriaLabel} className="rounded-lg bg-card p-3 ring-1 ring-primary/10">
      <h2 className="mb-2 flex items-center justify-between px-2 text-xs font-medium text-muted-foreground">
        <span>{text.sectionTitle}</span>
        <span>{formatCount(total, messages.clients.counts.partnersCount)}</span>
      </h2>
      <ul className="grid grid-cols-2 gap-2" role="list">
        {rows.map((option) => {
          const isActive = query.industry === option.slug;
          const industry = artwork.get(option.slug);
          return (
            <li key={option.slug}>
              <IndustryTile
                item={{
                  name: option.name,
                  slug: option.slug,
                  count: option.count,
                  image: industryArtwork(industry?.socialImage),
                  imageAlt: industry?.socialImageAlt,
                }}
                href={buildPartnersHref(query, { industry: isActive ? "" : option.slug })}
                isActive={isActive}
                variant="compact"
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
