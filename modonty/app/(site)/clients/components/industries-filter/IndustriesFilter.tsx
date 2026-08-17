import Link from "next/link";
import { cn } from "@/lib/utils";
import { buildPartnersHref } from "@/app/(site)/clients/helpers/build-partners-href";
import { messages, formatCount } from "@/lib/i18n/messages";
import type { IndustryFilterRow } from "@/app/(site)/clients/helpers/count-industries";
import type { PartnersQuery } from "@/app/(site)/clients/helpers/parse-partners-query";

const text = messages.clients.industryFilter;

interface IndustriesFilterProps {
  rows: IndustryFilterRow[];
  /** Partners before the industry filter — the number beside «الكل». */
  total: number;
  query: PartnersQuery;
}

/**
 * The rail filter: one row per industry, the partner count on the end, «الكل» on top.
 * Plain links, not a control — the chosen industry lives in the URL, so the filtered
 * list is shareable, crawlable, and survives a refresh, and the page ships no JavaScript
 * for it.
 */
export function IndustriesFilter({ rows, total, query }: IndustriesFilterProps) {
  const options = [{ name: text.allIndustriesOption, slug: "", count: total }, ...rows];

  return (
    <nav aria-label={text.navAriaLabel} className="rounded-lg bg-card p-3 ring-1 ring-primary/10">
      <h2 className="mb-2 flex items-center justify-between px-2 text-xs font-medium text-muted-foreground">
        <span>{text.sectionTitle}</span>
        <span>{formatCount(total, messages.clients.counts.partnersCount)}</span>
      </h2>
      <ul>
        {options.map((option) => {
          const isActive = query.industry === option.slug;
          return (
            <li key={option.slug || "all"}>
              <Link
                href={buildPartnersHref(query, { industry: option.slug })}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex min-h-9 items-center justify-between gap-2 rounded-full px-2 text-sm transition-colors sm:hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive ? "bg-primary/[.07] font-medium text-link" : "text-foreground",
                )}
              >
                <span className="truncate">{option.name}</span>
                <span className={cn("shrink-0 text-xs", isActive ? "text-link" : "text-muted-foreground")}>
                  {option.count.toLocaleString("ar-SA")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
