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
    const grandTotal = ga4.sessions + ga4.pageViews + ga4.events + ga4.interactions;

    return (
      <div className="w-full overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-[#0d1424] to-[#111827] shadow-[0_0_40px_rgba(99,102,241,0.08)]">
        <div className="flex divide-x divide-x-reverse divide-white/[0.06]">

          {/* Stats: grand-total hero + 4 secondary */}
          <div className="flex flex-1 divide-x divide-x-reverse divide-white/[0.06]">
            {/* Hero — الأثر الرقمي (grand total) */}
            <div className="flex flex-col items-center justify-center px-6 py-5">
              <span className="text-3xl font-black leading-none tracking-tight text-white sm:text-4xl">
                {grandTotal.toLocaleString("ar-SA")}
              </span>
              <span className="mt-1.5 text-[11px] font-medium text-white/40">الأثر الرقمي</span>
            </div>
            {/* Secondary */}
            <div className="grid flex-1 grid-cols-2 divide-x divide-x-reverse divide-white/[0.06] sm:grid-cols-4">
              <div className="flex flex-col items-center justify-center py-5">
                <span className="text-lg font-black leading-none text-white/80 sm:text-xl">{ga4.events.toLocaleString("ar-SA")}</span>
                <span className="mt-1.5 text-[10px] font-medium text-white/35">نشاط</span>
              </div>
              <div className="flex flex-col items-center justify-center py-5">
                <span className="text-lg font-black leading-none text-white/80 sm:text-xl">{ga4.sessions.toLocaleString("ar-SA")}</span>
                <span className="mt-1.5 text-[10px] font-medium text-white/35">زيارات</span>
              </div>
              <div className="hidden sm:flex flex-col items-center justify-center py-5">
                <span className="text-lg font-black leading-none text-white/80 sm:text-xl">{ga4.pageViews.toLocaleString("ar-SA")}</span>
                <span className="mt-1.5 text-[10px] font-medium text-white/35">مشاهدات</span>
              </div>
              <div className="hidden sm:flex flex-col items-center justify-center py-5">
                <span className="text-lg font-black leading-none text-white/80 sm:text-xl">{ga4.interactions.toLocaleString("ar-SA")}</span>
                <span className="mt-1.5 text-[10px] font-medium text-white/35">تفاعلات</span>
              </div>
            </div>
          </div>

          {/* Google anchor — trust badge */}
          <div className="hidden sm:flex flex-col items-center justify-center gap-2.5 bg-white/[0.03] px-6 py-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8" aria-label="Google">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <p className="text-center text-[10px] leading-tight text-white/45">
              موثّق من<br />
              <span className="font-semibold text-white/65">Google Analytics</span>
            </p>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              ✓ بيانات حقيقية
            </span>
          </div>

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
