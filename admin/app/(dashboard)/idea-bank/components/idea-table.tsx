"use client";

import { useState } from "react";
import { CalendarClock, Infinity as InfinityIcon, Sparkles } from "lucide-react";

import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DetailCard, Fact, FactGroup } from "@/components/shared/advanced-table";
import { cn } from "@/lib/utils";
import { IdeaActions } from "./idea-actions";
import { ArticleLinker } from "./article-linker";

/**
 * جدول «بنك الأفكار» على وصفة Advanced Table (خالد ١٥ أكتوبر ٢٠٢٦: «اليو اي واليو اكس محتاج
 * تحسين… في لخبطة»). الصفّ الأساسيّات فقط — الموضوع · المجال · كم استمرّ · قوّته · القرار —
 * والزاوية المقترحة والمصدر والأرقام خلف «+». الدرجة الخام لا تُعرض رقماً بلا معنى: تُترجم قوّةً.
 */
export interface IdeaRowData {
  id: string;
  topic: string;
  suggestedAngle: string | null;
  whyItMatters: string | null;
  fieldName: string | null;
  sector: string | null;
  sourcePlatform: string;
  sourceUrl: string | null;
  sourceTitle: string | null;
  saudiRelevance: number;
  opportunityScore: number;
  status: "NEW" | "WATCH" | "APPROVED" | "REJECTED" | "USED";
  firstSeenAt: string;
  lastSeenAt: string;
  daysSeen: number;
  intent: string | null;
  fieldType: string | null;
  /** معلومة لا قرار — انظر `helpers/get-idea-insights.ts`. */
  insight: {
    written: { title: string; url: string }[];
    clients: { id: string; name: string }[];
    gsc: { impressions: number; clicks: number; topQuery: string | null } | null;
  };
}

const PLATFORM_LABEL: Record<string, string> = {
  google_trends: "قوقل ترندز",
  google_suggest: "بحث قوقل",
  google_news: "أخبار قوقل",
  competitor: "منافس",
  youtube: "يوتيوب",
  x: "إكس",
};

/** «مستمرّة» = ظهرت ٥ أيام فأكثر — العتبة التي طلبها خالد (أسبوع إلى ١٠ أيام). */
const LASTING_DAYS = 5;

const NUM = new Intl.NumberFormat("ar-EG");
const dayFmt = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short" });
// الرصد مرّتان في الأسبوع — «اليوم» يكون صفراً أغلب الأيام، فالجديد = ما ظهر في آخر تحديث (١٢ ساعة من أحدثه)
const isLatest = (iso: string, latest: number) => latest - new Date(iso).getTime() < 12 * 3600_000;

const columns = (showField: boolean): Column<IdeaRowData>[] => [
  {
    key: "topic",
    header: "الموضوع",
    sortable: true,
    render: (r) => (
      <span className="flex max-w-[460px] flex-wrap items-center gap-2">
        <span dir="auto" className="font-semibold leading-snug" title={r.topic}>{r.topic}</span>
        {r.insight.written.length > 0 && (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300" title={r.insight.written.map((w) => w.title).join(" · ")}>
            كتبنا عنه
          </span>
        )}
      </span>
    ),
  },
  ...(showField
    ? [{
        key: "fieldName",
        header: "المجال",
        render: (r: IdeaRowData) => (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs">{r.fieldName ?? r.sector ?? "—"}</span>
        ),
      } satisfies Column<IdeaRowData>]
    : []),
  {
    // من أين جاءت الفكرة — في الصفّ لا خلف «+» (خالد ١٥ أكتوبر ٢٠٢٦: «المصدر من فين جاي؟»).
    key: "sourcePlatform",
    header: "المصدر",
    render: (r) => {
      const label = PLATFORM_LABEL[r.sourcePlatform] ?? r.sourcePlatform;
      return r.sourceUrl ? (
        <a
          href={r.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="whitespace-nowrap text-sm text-primary hover:underline"
          title={r.sourceTitle ?? undefined}
        >
          {label}
        </a>
      ) : (
        <span className="whitespace-nowrap text-sm text-muted-foreground">{label}</span>
      );
    },
  },
  {
    key: "daysSeen",
    header: "أيام الظهور",
    sortable: true,
    sortFn: (a, b) => a.daysSeen - b.daysSeen,
    className: "text-center",
    render: (r) => (
      <span
        className={cn(
          "inline-block rounded-md px-2 py-1 text-xs font-bold tabular-nums",
          r.daysSeen >= LASTING_DAYS
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            : "bg-muted text-muted-foreground",
        )}
      >
        {r.daysSeen} {r.daysSeen === 1 ? "يوم" : "أيام"}
      </span>
    ),
  },
  {
    // رقمٌ مقيس وحده — «قوية/جيدة» (تقدير Claude) أُزيلت بقرار خالد ١٥ أكتوبر ٢٠٢٦: «ما لها داعي».
    key: "opportunityScore",
    header: "ظهورنا في قوقل",
    sortable: true,
    sortFn: (a, b) => (a.insight.gsc?.impressions ?? -1) - (b.insight.gsc?.impressions ?? -1),
    className: "text-center",
    render: (r) => {
      const g = r.insight.gsc;
      return (
        <span
          className={cn("text-sm tabular-nums", g && g.impressions > 0 ? "font-semibold" : "text-muted-foreground")}
          title="ظهور مدونتي في قوقل على عبارات قريبة — آخر ٢٨ يوماً (Search Console)"
        >
          {g === null ? "—" : g.impressions > 0 ? NUM.format(g.impressions) : "لا ظهور"}
        </span>
      );
    },
  },
  {
    key: "status",
    header: "القرار",
    render: (r) => <IdeaActions id={r.id} status={r.status} compact />,
  },
];

function IdeaDetails({ r }: { r: IdeaRowData }) {
  return (
    <DetailCard
      columns="lg:grid-cols-[minmax(0,2fr)_1px_minmax(0,1fr)_1px_auto]"
      groups={[
        <FactGroup key="article" title="المقال المقترح">
          {/* نصّ يُقرأ لا رقمٌ يُلمح: حجم قراءة عادي — `Fact` مصمَّم لأرقام قصيرة كبيرة. */}
          <Fact label="العنوان" value={<span dir="auto" className="block whitespace-normal text-sm font-semibold leading-relaxed">{r.suggestedAngle ?? "—"}</span>} />
          <Fact label="ليش الآن" value={<span dir="auto" className="block whitespace-normal text-sm font-normal leading-relaxed text-muted-foreground">{r.whyItMatters ?? "—"}</span>} />
        </FactGroup>,
        <FactGroup key="source" title="المصدر">
          <Fact
            label={PLATFORM_LABEL[r.sourcePlatform] ?? r.sourcePlatform}
            value={
              r.sourceUrl ? (
                <a
                  href={r.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  dir="auto"
                  className="block whitespace-normal text-sm font-medium leading-relaxed text-primary hover:underline"
                >
                  {r.sourceTitle || "افتح المصدر"}
                </a>
              ) : (
                <span dir="auto">{r.sourceTitle ?? "—"}</span>
              )
            }
          />
        </FactGroup>,
        <FactGroup key="numbers" title="الأرقام">
          <Fact label="أول ظهور" value={dayFmt.format(new Date(r.firstSeenAt))} />
          <Fact label="آخر ظهور" value={dayFmt.format(new Date(r.lastSeenAt))} />
          <Fact label="صلة بالسعودية" value={`${r.saudiRelevance} / 100`} />
          <Fact label="نوعه" value={r.intent === "evergreen" ? "يُبحث عنه دائماً" : "موجة مؤقتة"} />
        </FactGroup>,
      ]}
      footer={
        <div className="space-y-3">
          <IdeaInfo r={r} />
          {r.status === "APPROVED" && <ArticleLinker ideaId={r.id} defaultQuery={r.topic} />}
          <IdeaActions id={r.id} status={r.status} />
        </div>
      }
    />
  );
}

/** معلومات تساعد القرار ولا تأخذه: هل كتبنا عنه · عملاء صناعته · ظهورنا في قوقل. */
function IdeaInfo({ r }: { r: IdeaRowData }) {
  const { written, clients, gsc } = r.insight;
  return (
    <div className="grid gap-3 text-sm sm:grid-cols-3">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground">كتبنا عنه قبل؟</p>
        {written.length === 0 ? (
          <p className="text-muted-foreground">لا مقال قريب منشور — موضوع جديد على مدونتي.</p>
        ) : (
          <ul className="space-y-1">
            {written.map((w) => (
              <li key={w.url}>
                <a href={w.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} dir="auto" className="text-amber-700 hover:underline dark:text-amber-300">
                  {w.title}
                </a>
              </li>
            ))}
            <li className="text-xs text-muted-foreground">تحديث المقال القائم قد يكون أنفع من مقال جديد ينافسه.</li>
          </ul>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground">عملاء هذه الصناعة</p>
        {clients.length === 0 ? (
          <p className="text-muted-foreground">
            {r.fieldType === "industry" ? "لا عملاء في هذه الصناعة بعد." : "يظهر لأفكار الصناعات فقط — الأقسام والقطاعات بلا عملاء مرتبطين."}
          </p>
        ) : (
          <p>
            <span className="font-semibold">{NUM.format(clients.length)} عميل</span>
            <span className="text-muted-foreground"> · {clients.slice(0, 5).map((c) => c.name).join(" · ")}{clients.length > 5 ? " …" : ""}</span>
          </p>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground">ظهورنا في قوقل (آخر ٢٨ يوماً)</p>
        {gsc === null ? (
          <p className="text-muted-foreground">Search Console غير متاح الآن.</p>
        ) : gsc.impressions === 0 ? (
          <p className="text-muted-foreground">لا نظهر على عبارات قريبة — فرصة لم نلمسها بعد.</p>
        ) : (
          <p>
            <span className="font-semibold">{NUM.format(gsc.impressions)} ظهور · {NUM.format(gsc.clicks)} نقرة</span>
            {gsc.topQuery && <span dir="auto" className="block text-xs text-muted-foreground">أعلى عبارة: {gsc.topQuery}</span>}
          </p>
        )}
      </div>
    </div>
  );
}

type KpiKey = "today" | "lasting" | "evergreen";
const KPIS: Record<KpiKey, KpiMeta & { icon: React.ComponentType<{ className?: string }>; test: (r: IdeaRowData, latest: number) => boolean }> = {
  today: { label: "جديدة في آخر تحديث", tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400", ring: "ring-sky-500", icon: Sparkles, test: (r, latest) => isLatest(r.firstSeenAt, latest) },
  lasting: { label: `ظهرت ${LASTING_DAYS} أيام فأكثر`, tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500", icon: CalendarClock, test: (r) => r.daysSeen >= LASTING_DAYS },
  evergreen: { label: "يُبحث عنها دائماً", tone: "bg-violet-500/15 text-violet-600 dark:text-violet-400", ring: "ring-violet-500", icon: InfinityIcon, test: (r) => r.intent === "evergreen" },
};

export function IdeaTable({ items, showField = true }: { items: IdeaRowData[]; showField?: boolean }) {
  const [kpi, setKpi] = useState<KpiKey | null>(null);
  const latest = Math.max(0, ...items.map((r) => new Date(r.firstSeenAt).getTime()));
  const visible = kpi ? items.filter((r) => KPIS[kpi].test(r, latest)) : items;

  const kpiRow = (
    <div className="flex flex-wrap items-center gap-2">
      {(Object.keys(KPIS) as KpiKey[]).map((key) => {
        const k = KPIS[key];
        const hits = items.filter((r) => k.test(r, latest)).length;
        return (
          <KpiToggle
            key={key}
            meta={k}
            icon={k.icon}
            value={hits}
            active={kpi === key}
            disabled={hits === 0}
            onClick={() => setKpi(kpi === key ? null : key)}
          />
        );
      })}
    </div>
  );

  return (
    <DataTable
      data={visible}
      columns={columns(showField)}
      searchKey="topic"
      searchPlaceholder="ابحث في المواضيع…"
      toolbar={kpiRow}
      pageSize={25}
      emptyText="لا أفكار هنا"
      arabic
      renderExpanded={(r) => <IdeaDetails r={r} />}
      expandLabel={(r) => `تفاصيل ${r.topic}`}
    />
  );
}
