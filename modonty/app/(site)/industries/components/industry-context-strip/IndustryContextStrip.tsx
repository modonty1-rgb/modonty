import { formatArticlesCount, formatClientsCount } from "@/app/(site)/industries/helpers/format-counts";
import { IconChevronDown } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { IndustryTone } from "@/app/(site)/industries/helpers/industry-tones";
import type { ReactNode } from "react";

interface IndustryContextStripProps {
  industryName: string;
  articlesCount: number;
  partnersCount: number;
  /** The selected field's tone — the strip wears the same color as the card the visitor tapped. */
  tone: IndustryTone;
  /** The partners grid — revealed IN PLACE when the visitor asks for it. */
  children?: ReactNode;
}

/**
 * Orientation after picking a field (NN/g): where am I, what will I find. Wears the SAME
 * tone as the tapped card (Khalid, 21 Aug), and the partners open as a COLLAPSE right
 * here — native `<details>`, zero JS — instead of jumping the visitor to the end of the
 * page (Khalid: «collapse better than shift to the end»). Mobile only — ≥1240px the
 * rails carry both.
 */
export function IndustryContextStrip({ industryName, articlesCount, partnersCount, tone, children }: IndustryContextStripProps) {
  const info = (
    <div className="min-w-0 flex-1">
      <p className="truncate text-[15px] font-black text-foreground">{industryName}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {formatArticlesCount(articlesCount)} · {formatClientsCount(partnersCount)}
      </p>
    </div>
  );

  if (partnersCount === 0 || !children) {
    return (
      <div className={cn("flex items-center gap-3 rounded-lg border-s-4 px-3 py-2.5", tone.stripBorder, tone.stripBg)}>{info}</div>
    );
  }

  return (
    <details className={cn("group rounded-lg border-s-4", tone.stripBorder, tone.stripBg)}>
      {/* 1024-1239px the PartnersRail is already on screen — the collapse and its button
          hide there so the same partners never render twice; the strip stays info-only. */}
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:pointer-events-none [&::-webkit-details-marker]:hidden">
        {info}
        <span className={cn("flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-[11px] font-black lg:hidden", tone.chip)}>
          شركاء المجال
          <IconChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden />
        </span>
      </summary>
      <div className="px-3 pb-3 lg:hidden">{children}</div>
    </details>
  );
}
