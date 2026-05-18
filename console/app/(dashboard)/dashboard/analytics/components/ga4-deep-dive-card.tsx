import { Suspense, Fragment } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Globe2, CalendarClock, Filter } from "lucide-react";
import {
  getTopArticles,
  getTrafficSources,
  getDayPattern,
  getConversionFunnel,
} from "@/lib/analytics/ga4-data-api";

const DAY_NAMES_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function formatNumber(n: number): string {
  return new Intl.NumberFormat("ar-SA").format(n);
}

function pct(part: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

// ─── 1. Top Articles ─────────────────────────────────────────────────────────

async function TopArticlesWidget({ clientId }: { clientId: string }) {
  let data;
  try {
    data = await getTopArticles(clientId, 10);
  } catch {
    return <ErrorState />;
  }
  if (data.length === 0) return <EmptyState message="لا توجد بيانات مشاهدات بعد." />;
  const max = data[0]?.views || 1;
  return (
    <div className="space-y-2">
      {data.map((a, i) => (
        <div key={a.slug} className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex-1 truncate text-foreground">
              <span className="me-2 text-xs text-muted-foreground">#{i + 1}</span>
              {a.title || a.slug}
            </span>
            <span className="font-mono font-semibold text-foreground">{formatNumber(a.views)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
              style={{ width: `${(a.views / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 2. Traffic Sources ──────────────────────────────────────────────────────

const SOURCE_LABEL_AR: Record<string, string> = {
  "(direct)": "زيارة مباشرة",
  "google": "Google",
  "facebook.com": "Facebook",
  "twitter.com": "Twitter / X",
  "linkedin.com": "LinkedIn",
  "instagram.com": "Instagram",
  "youtube.com": "YouTube",
  "t.co": "Twitter / X",
  "bing.com": "Bing",
};

async function TrafficSourcesWidget({ clientId }: { clientId: string }) {
  let data;
  try {
    data = await getTrafficSources(clientId, 8);
  } catch {
    return <ErrorState />;
  }
  if (data.length === 0) return <EmptyState message="لا توجد بيانات مصادر زيارات بعد." />;
  const total = data.reduce((acc, s) => acc + s.sessions, 0);
  return (
    <div className="space-y-2">
      {data.map((s) => {
        const label = SOURCE_LABEL_AR[s.source] ?? s.source;
        const share = total ? Math.round((s.sessions / total) * 100) : 0;
        return (
          <div key={`${s.source}-${s.medium}`} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex-1 truncate text-foreground">
                {label}
                <span className="ms-2 text-xs text-muted-foreground">{s.medium}</span>
              </span>
              <span className="font-mono text-foreground">
                {formatNumber(s.sessions)} <span className="text-xs text-muted-foreground">({share}%)</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
                style={{ width: `${share}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 3. Day × Hour Heatmap ───────────────────────────────────────────────────

async function DayPatternWidget({ clientId }: { clientId: string }) {
  let cells;
  try {
    cells = await getDayPattern(clientId);
  } catch {
    return <ErrorState />;
  }
  if (cells.length === 0) return <EmptyState message="لا توجد بيانات نشاط أسبوعي بعد." />;
  const grid = new Map<string, number>();
  let max = 0;
  for (const c of cells) {
    const k = `${c.dayOfWeek}-${c.hour}`;
    grid.set(k, c.events);
    if (c.events > max) max = c.events;
  }
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid grid-cols-[auto_repeat(24,minmax(14px,1fr))] gap-px text-[10px] text-muted-foreground" dir="ltr">
          <div></div>
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="text-center">{h % 3 === 0 ? h : ""}</div>
          ))}
          {DAY_NAMES_AR.map((name, dow) => (
            <Fragment key={`row-${dow}`}>
              <div className="pe-2 text-end text-foreground" dir="rtl">{name}</div>
              {Array.from({ length: 24 }, (_, h) => {
                const events = grid.get(`${dow}-${h}`) ?? 0;
                const intensity = max ? events / max : 0;
                const opacity = events === 0 ? 0.06 : 0.15 + intensity * 0.85;
                return (
                  <div
                    key={`cell-${dow}-${h}`}
                    title={`${name} ${h}:00 — ${events} حدث`}
                    className="aspect-square rounded-[2px]"
                    style={{ backgroundColor: `rgba(34, 197, 94, ${opacity})` }}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        كل خلية = حدث واحد في يوم وساعة محدّدة (آخر 28 يوم). كلما زاد اللون الأخضر، زاد النشاط.
      </p>
    </div>
  );
}

// ─── 4. Conversion Funnel ────────────────────────────────────────────────────

async function FunnelWidget({ clientId }: { clientId: string }) {
  let f;
  try {
    f = await getConversionFunnel(clientId);
  } catch {
    return <ErrorState />;
  }
  if (f.views + f.engagements + f.intents + f.conversions === 0) {
    return <EmptyState message="لا توجد بيانات قمع تحويل بعد." />;
  }
  const steps = [
    { label: "مشاهدات", value: f.views, color: "from-blue-500 to-blue-400", textColor: "text-blue-900" },
    { label: "تفاعل", value: f.engagements, color: "from-emerald-500 to-emerald-400", textColor: "text-emerald-900" },
    { label: "اهتمام", value: f.intents, color: "from-amber-500 to-amber-400", textColor: "text-amber-900" },
    { label: "تحويل", value: f.conversions, color: "from-violet-500 to-violet-400", textColor: "text-violet-900" },
  ];
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const width = max ? (s.value / max) * 100 : 0;
        const dropRate = i > 0 && steps[i - 1].value > 0
          ? Math.round(((steps[i - 1].value - s.value) / steps[i - 1].value) * 100)
          : null;
        return (
          <div key={s.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{s.label}</span>
              <span className="flex items-center gap-2">
                {dropRate !== null && dropRate > 0 && (
                  <span className="text-xs text-red-600">−{dropRate}%</span>
                )}
                <span className={`font-mono font-bold ${s.textColor}`}>{formatNumber(s.value)}</span>
              </span>
            </div>
            <div className="h-6 overflow-hidden rounded-md bg-muted">
              <div
                className={`h-full rounded-md bg-gradient-to-r ${s.color} transition-all`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground">
        نسبة التحويل النهائية: <span className="font-semibold text-foreground">{pct(f.conversions, f.views)}</span> من المشاهدات إلى تحويل مكتمل.
      </p>
    </div>
  );
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return <p className="rounded-md border border-dashed bg-muted/30 p-4 text-center text-xs text-muted-foreground">{message}</p>;
}

function ErrorState() {
  return (
    <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
      ⚠️ تعذّر جلب البيانات من GA4 حالياً.
    </p>
  );
}

function WidgetSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-6 animate-pulse rounded bg-muted/40" />
      ))}
    </div>
  );
}

// ─── Card wrappers ───────────────────────────────────────────────────────────

function DeepDiveCard({
  title,
  description,
  icon: Icon,
  iconBg,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className={`rounded-full p-1.5 ${iconBg}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function GA4DeepDiveCard({ clientId }: { clientId: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DeepDiveCard
        title="أكثر المقالات مشاهدة (28 يوم)"
        description="أعلى 10 مقالات شاهدها زوّارك من GA4"
        icon={Newspaper}
        iconBg="bg-blue-100 text-blue-700"
      >
        <Suspense fallback={<WidgetSkeleton />}>
          <TopArticlesWidget clientId={clientId} />
        </Suspense>
      </DeepDiveCard>

      <DeepDiveCard
        title="مصادر الزيارات (28 يوم)"
        description="من أين يأتي زوّارك — Google، Facebook، مباشر، إلخ"
        icon={Globe2}
        iconBg="bg-violet-100 text-violet-700"
      >
        <Suspense fallback={<WidgetSkeleton />}>
          <TrafficSourcesWidget clientId={clientId} />
        </Suspense>
      </DeepDiveCard>

      <DeepDiveCard
        title="نمط النشاط الأسبوعي (28 يوم)"
        description="أي يوم وساعة فيها أعلى تفاعل من زوّارك"
        icon={CalendarClock}
        iconBg="bg-emerald-100 text-emerald-700"
      >
        <Suspense fallback={<WidgetSkeleton />}>
          <DayPatternWidget clientId={clientId} />
        </Suspense>
      </DeepDiveCard>

      <DeepDiveCard
        title="قمع التحويل (28 يوم)"
        description="مشاهدة → تفاعل → اهتمام → تحويل"
        icon={Filter}
        iconBg="bg-amber-100 text-amber-700"
      >
        <Suspense fallback={<WidgetSkeleton />}>
          <FunnelWidget clientId={clientId} />
        </Suspense>
      </DeepDiveCard>
    </div>
  );
}
