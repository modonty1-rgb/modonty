import type { ComponentType } from "react";
import { getGa4FooterStats } from "@/lib/analytics/ga4";
import { getFooterStats } from "@/app/api/helpers/stats-queries";
import {
  IconArticle,
  IconViews,
  IconActivity,
  IconClients,
  IconUsers,
  IconTrending,
  IconTotal,
} from "@/lib/icons";

// «بالأرقام» — site-wide traffic from GA4 (sessions / page views / activity /
// interactions), cached ~1min so the global footer stays fast. If GA4 is
// unavailable it falls back to live DB record counts — the footer never breaks.
// Server Component → zero client JS.

function Stat({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 py-3 text-center">
      <Icon className={`h-4 w-4 ${highlight ? "text-primary-foreground" : "text-primary-foreground/55"}`} />
      <span className="text-xl font-extrabold tabular-nums leading-none text-primary-foreground">
        {value}
      </span>
      <span className="text-[11px] font-medium text-primary-foreground/70 leading-tight">{label}</span>
    </div>
  );
}

export async function FooterStats() {
  const ga4 = await getGa4FooterStats();

  if (ga4) {
    return (
      <div className="w-full rounded-lg bg-primary overflow-hidden shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-x-reverse divide-primary-foreground/15">
          <Stat icon={IconTrending} label="زيارات"  value={ga4.sessions.toLocaleString("ar-SA")} />
          <Stat icon={IconViews}    label="مشاهدات" value={ga4.pageViews.toLocaleString("ar-SA")} highlight />
          <Stat icon={IconTotal}    label="نشاط"    value={ga4.events.toLocaleString("ar-SA")} />
          <Stat icon={IconActivity} label="تفاعلات" value={ga4.interactions.toLocaleString("ar-SA")} />
        </div>
      </div>
    );
  }

  // Fallback — live DB record counts (GA4 unavailable).
  const stats = await getFooterStats();
  return (
    <div className="w-full rounded-lg bg-primary overflow-hidden shadow-sm">
      <div className="grid grid-cols-3 sm:grid-cols-5 divide-x divide-x-reverse divide-primary-foreground/15">
        <Stat icon={IconArticle}  label="المقالات" value={stats.articles.toLocaleString("ar-SA")} />
        <Stat icon={IconViews}    label="مشاهدات"  value={stats.views.toLocaleString("ar-SA")} highlight />
        <Stat icon={IconActivity} label="تفاعلات"  value={stats.interactions.toLocaleString("ar-SA")} />
        <Stat icon={IconUsers}    label="إعجابات"  value={stats.likes.toLocaleString("ar-SA")} />
        <Stat icon={IconClients}  label="الشركاء"  value={stats.partners.toLocaleString("ar-SA")} />
      </div>
    </div>
  );
}
