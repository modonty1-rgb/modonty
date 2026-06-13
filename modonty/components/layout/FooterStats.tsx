import type { ComponentType } from "react";
import { getFooterStats } from "@/app/api/helpers/stats-queries";
import {
  IconArticle,
  IconViews,
  IconActivity,
  IconLike,
  IconClients,
} from "@/lib/icons";

// «بالأرقام» — moved here from the homepage left sidebar so low early-stage numbers
// don't greet a partner the moment they land. Every value is a live COUNT of real
// records, cached ~1min ("use cache", minutes) so rendering this on every page
// (global footer) stays static/fast. Server Component → zero client JS.
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
  const stats = await getFooterStats();

  return (
    <div className="w-full rounded-lg bg-primary overflow-hidden shadow-sm">
      <div className="grid grid-cols-3 sm:grid-cols-5 divide-x divide-x-reverse divide-primary-foreground/15">
        <Stat icon={IconArticle}  label="المقالات" value={stats.articles.toLocaleString("ar-SA")} />
        <Stat icon={IconViews}    label="مشاهدات"  value={stats.views.toLocaleString("ar-SA")} highlight />
        <Stat icon={IconActivity} label="تفاعلات"  value={stats.interactions.toLocaleString("ar-SA")} />
        <Stat icon={IconLike}     label="إعجابات"  value={stats.likes.toLocaleString("ar-SA")} />
        <Stat icon={IconClients}  label="الشركاء"  value={stats.partners.toLocaleString("ar-SA")} />
      </div>
    </div>
  );
}
