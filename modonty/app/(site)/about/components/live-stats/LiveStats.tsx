import { ModontyPartnerMark } from "@/components/icons/modonty-partner-mark";
import { ModontyIndustriesMark } from "@/components/icons/modonty-industries-mark";
import { messages } from "@/lib/i18n/messages";
import type { ComponentType } from "react";

const text = messages.about.liveStats;

interface LiveStatsProps {
  partnerCount: number;
  industryCount: number;
}

function Stat({ icon: Icon, value, label }: { icon: ComponentType<{ className?: string }>; value: number; label: string }) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-lg border border-border bg-card p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xl font-bold text-foreground">{value.toLocaleString("ar-SA")}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

/**
 * Two numbers, both counted live from the same query the directory pages use — never a
 * rounded-up marketing figure (modonty is in its founding phase; an inflated number here
 * would be the first thing a partner could catch us lying about). No growth claim, no
 * comparison to last month — just what is true on the page right now.
 */
export function LiveStats({ partnerCount, industryCount }: LiveStatsProps) {
  return (
    <section aria-labelledby="live-stats-heading" className="space-y-3">
      <h2 id="live-stats-heading" className="text-sm font-medium text-muted-foreground">
        {text.sectionTitle}
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Stat icon={ModontyPartnerMark} value={partnerCount} label={text.partnersSuffix} />
        <Stat icon={ModontyIndustriesMark} value={industryCount} label={text.industriesSuffix} />
      </div>
    </section>
  );
}
