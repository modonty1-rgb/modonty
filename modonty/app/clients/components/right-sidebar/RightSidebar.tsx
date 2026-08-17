import { cn } from "@/lib/utils";
import { messages } from "@/lib/i18n/messages";
import { LinkCard } from "@/components/shared/link-card/LinkCard";
import { StickyRail } from "@modonty/shared/components/sticky-rail/StickyRail";
import { TrustCard } from "@/app/clients/components/trust-card/TrustCard";
import { IndustriesFilter } from "@/app/clients/components/industries-filter/IndustriesFilter";
import { IconPlay, IconVolume2 } from "@/lib/icons";
import type { IndustryFilterRow } from "@/app/clients/helpers/count-industries";
import type { PartnersQuery } from "@/app/clients/helpers/parse-partners-query";

const text = messages.clients.sidebars;

interface RightSidebarProps {
  rows: IndustryFilterRow[];
  total: number;
  query: PartnersQuery;
  className?: string;
}

// Rendered FIRST in the row, so in RTL it is the visually RIGHT rail — the same slot the
// homepage gives to «الشركاء والمجالات». Here the top card is the page's own trust card
// and المجالات become the filter, because on this page the industry is how you narrow the
// list, not somewhere else to go.
export function RightSidebar({ rows, total, query, className }: RightSidebarProps) {
  return (
    <StickyRail
      label={text.partnersRailAriaLabel}
      className={cn("hidden w-[300px] shrink-0 self-start min-[1240px]:sticky min-[1240px]:block", className)}
    >
      <div className="space-y-4">
        <TrustCard />
        <IndustriesFilter rows={rows} total={total} query={query} />
        <LinkCard href="/reels" title={text.reelsCardTitle} description={text.reelsCardSubtitle} icon={IconPlay} />
        <LinkCard href="/audio" title={text.audioCardTitle} description={text.audioCardSubtitle} icon={IconVolume2} />
      </div>
    </StickyRail>
  );
}
