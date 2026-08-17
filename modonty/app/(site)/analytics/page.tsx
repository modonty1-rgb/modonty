import type { Metadata } from "next";
import { getSiteAnalytics, type NameVal } from "@/lib/analytics/ga4";
import {
  IconTrending,
  IconViews,
  IconTotal,
  IconActivity,
  IconUsers,
} from "@/lib/icons";

export const metadata: Metadata = {
  title: "تحاليل مدوّنتي — الأرقام الحقيقية",
  description: "تحاليل مباشرة لمنصة مدوّنتي من Google Analytics: زيارات، مشاهدات، مصادر، أجهزة، دول، وتفاعلات.",
  robots: { index: false, follow: false },
};

// Public Looker Studio report (anyone-with-link, owner credentials) — Google-hosted,
// read-only proof the numbers come straight from Google Analytics.
const LOOKER_PUBLIC_URL = "https://datastudio.google.com/s/nBnyGkiUdGw";

// ── format helpers ───────────────────────────────────────────────────────────
const ar = (n: number) => Math.round(n).toLocaleString("ar-SA");
function prettyDate(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(6, 8)}/${yyyymmdd.slice(4, 6)}`;
}
const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const EVENT_AR: Record<string, string> = {
  page_view: "مشاهدة صفحة",
  user_engagement: "تفاعل",
  scroll: "تمرير",
  session_start: "بداية جلسة",
  first_visit: "زيارة أولى",
  web_vitals: "قياس أداء",
  outbound_click: "نقرة رابط خارجي",
  client_view: "زيارة صفحة عميل",
  article_view: "قراءة مقال",
  form_start: "بدء نموذج",
  click: "نقرة",
  conversion_complete: "تحويل",
  follow_client: "متابعة عميل",
  article_share: "مشاركة مقال",
  client_share: "مشاركة عميل",
  client_favorite: "حفظ عميل",
  article_favorite: "حفظ مقال",
  article_like: "إعجاب",
  ask_client_submit: "سؤال مباشر",
  client_comment_submit: "تعليق",
  contact_submit: "رسالة تواصل",
  newsletter_subscribe: "اشتراك نشرة",
  view_search_results: "بحث",
};
const arEvent = (k: string) => EVENT_AR[k] ?? k;

// ── presentational pieces (Server Components, zero client JS) ─────────────────
function Kpi({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-1">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-2xl font-extrabold tabular-nums leading-none">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      {sub ? <span className="text-[11px] text-muted-foreground/70">{sub}</span> : null}
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold">{title}</h2>
        {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Bars({ items, format = ar, labelMap }: { items: NameVal[]; format?: (n: number) => string; labelMap?: (s: string) => string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return <p className="text-xs text-muted-foreground">لا توجد بيانات بعد.</p>;
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((it, idx) => (
        <div key={idx} className="flex items-center gap-3 text-xs">
          <span className="w-28 shrink-0 truncate text-muted-foreground" title={it.name}>{labelMap ? labelMap(it.name) : it.name || "—"}</span>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="absolute inset-y-0 end-0 rounded-full bg-primary" style={{ width: `${(it.value / max) * 100}%` }} />
          </div>
          <span className="w-14 shrink-0 text-start font-semibold tabular-nums">{format(it.value)}</span>
        </div>
      ))}
    </div>
  );
}

function TimeSeries({ data }: { data: Array<{ date: string; sessions: number; pageViews: number }> }) {
  if (!data.length) return <p className="text-xs text-muted-foreground">لا توجد بيانات بعد.</p>;
  const max = Math.max(1, ...data.map((d) => d.pageViews));
  return (
    <div>
      <div className="flex h-32 items-end gap-px" dir="ltr">
        {data.map((d, i) => (
          <div key={i} className="group relative flex-1 rounded-t bg-primary/80 hover:bg-primary" style={{ height: `${Math.max(2, (d.pageViews / max) * 100)}%` }} title={`${prettyDate(d.date)} — ${ar(d.pageViews)} مشاهدة · ${ar(d.sessions)} زيارة`} />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground" dir="ltr">
        <span>{prettyDate(data[0]?.date ?? "")}</span>
        <span>{prettyDate(data[data.length - 1]?.date ?? "")}</span>
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const a = await getSiteAnalytics();

  if (!a) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">تحاليل مدوّنتي</h1>
        <p className="mt-4 text-muted-foreground">التحاليل غير متاحة حاليًا. حاول لاحقًا.</p>
      </main>
    );
  }

  const k = a.kpis;
  const dowItems: NameVal[] = a.byDayOfWeek
    .slice()
    .sort((x, y) => Number(x.name) - Number(y.name))
    .map((d) => ({ name: DAYS_AR[Number(d.name)] ?? d.name, value: d.value }));
  const hourItems: NameVal[] = a.byHour
    .slice()
    .sort((x, y) => Number(x.name) - Number(y.name))
    .map((h) => ({ name: `${Number(h.name).toLocaleString("ar-SA")}:٠٠`, value: h.value }));
  const sourceItems: NameVal[] = a.sources.map((s) => ({ name: `${s.source} / ${s.medium}`, value: s.sessions }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">تحاليل مدوّنتي</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          أرقام حقيقية مباشرة من Google Analytics — لا تقديرات. كل النشاط على منصة مدوّنتي.
        </p>
        <a
          href={LOOKER_PUBLIC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors hover:bg-muted"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[conic-gradient(at_center,_#ea4335,_#fbbc05,_#34a853,_#4285f4,_#ea4335)] text-[10px] font-black text-white">G</span>
          شاهد الأرقام مباشرة على Google
          <span aria-hidden>↗</span>
        </a>
      </header>

      {/* KPI grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi icon={IconUsers} label="زوّار" value={ar(k.users)} sub={`${ar(k.newUsers)} جديد`} />
        <Kpi icon={IconTrending} label="زيارات" value={ar(k.sessions)} />
        <Kpi icon={IconViews} label="مشاهدات الصفحات" value={ar(k.pageViews)} sub={`${k.viewsPerSession.toLocaleString("ar-SA", { maximumFractionDigits: 1 })} لكل زيارة`} />
        <Kpi icon={IconTotal} label="إجمالي النشاط" value={ar(k.events)} />
        <Kpi icon={IconActivity} label="تفاعلات مباشرة" value={ar(k.interactions)} />
      </div>

      {/* Time series */}
      <div className="mb-6">
        <Panel title="الزيارات عبر الزمن" hint="آخر ٩٠ يوم">
          <TimeSeries data={a.byDate} />
        </Panel>
      </div>

      {/* Two-column panels */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="مصادر الزيارات" hint="القنوات">
          <Bars items={a.channels} />
        </Panel>
        <Panel title="المصادر التفصيلية">
          <Bars items={sourceItems} />
        </Panel>
        <Panel title="الأجهزة">
          <Bars items={a.devices} labelMap={(s) => ({ mobile: "جوال", desktop: "سطح مكتب", tablet: "تابلت", smart_tv: "تلفاز", unknown: "غير معروف" }[s] ?? s)} />
        </Panel>
        <Panel title="أنظمة التشغيل">
          <Bars items={a.os} />
        </Panel>
        <Panel title="المتصفّحات">
          <Bars items={a.browsers} />
        </Panel>
        <Panel title="اللغات">
          <Bars items={a.languages} />
        </Panel>
        <Panel title="الدول">
          <Bars items={a.countries} />
        </Panel>
        <Panel title="المدن">
          <Bars items={a.cities} />
        </Panel>
        <Panel title="نمط الأيام">
          <Bars items={dowItems} />
        </Panel>
        <Panel title="نمط الساعات">
          <Bars items={hourItems} />
        </Panel>
      </div>

      {/* Top pages */}
      <div className="mt-4">
        <Panel title="أعلى الصفحات" hint="حسب المشاهدات">
          <div className="flex flex-col gap-2.5">
            {a.topPages.length === 0 ? (
              <p className="text-xs text-muted-foreground">لا توجد بيانات بعد.</p>
            ) : (
              a.topPages.map((p, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="min-w-0 flex-1 truncate" title={p.title || p.path}>{p.title || p.path}</span>
                  <span className="shrink-0 truncate text-muted-foreground/70" dir="ltr">{p.path}</span>
                  <span className="w-14 shrink-0 text-start font-semibold tabular-nums">{ar(p.views)}</span>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {/* Landing pages + events */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="صفحات الدخول" hint="أول صفحة في الزيارة">
          <Bars items={a.landingPages} />
        </Panel>
        <Panel title="تفصيل الأحداث">
          <Bars items={a.events.slice(0, 15)} labelMap={arEvent} />
        </Panel>
      </div>

      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        المصدر: Google Analytics · النطاق: كامل منصة مدوّنتي · يُحدّث دوريًا.
      </p>
    </main>
  );
}
