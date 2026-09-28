"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarCheck, CalendarClock, CalendarX2, ExternalLink, MessageCircle, Pencil, Phone, Plus, Users2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CountTab } from "@/components/admin/count-tab";
import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DetailCard, Fact, FactGroup, FilterRow } from "@/components/shared/advanced-table";
import { cn } from "@/lib/utils";
import { DeleteLeadDialog } from "./delete-lead-dialog";
import { LogForm } from "./log-form";
import { NoAnswerButton } from "./no-answer-button";
import { CHANNEL_ICON } from "../helpers/channel-icon";
import { SILENCE_TONE, describeSilence } from "../helpers/describe-silence";
import { formatCount } from "../helpers/format-count";
import { MARKETS, MARKET_DOT, MARKET_LABEL, NO_MARKET } from "../helpers/markets";
import {
  CHANNEL_LABEL, DUE_TONE, PICKABLE_STAGES, STAGE_DOT, STAGE_LABEL, STAGE_TEXT, describeDue, formatMoney, waNumber, type Channel, type Stage,
} from "../helpers/funnel";
import type { SalesLeadRow } from "../helpers/get-sales-leads";
import { NO_SOURCE } from "../helpers/summarize-leads";
import { SOURCE_ICON } from "../helpers/source-icon";

/**
 * **العملاء المحتملون بجدول Advanced Table** (خالد ٢٨ سبتمبر ٢٠٢٦: «أحسّها معقّدة وملخبطة»).
 * كانت بطاقةً بارتفاع ~١٤٠px لكل عميل (الصفحة ٣٢٣٩px لعشرين) والمرشّحات في خمسة أماكن. صارت
 * وصفةَ Client Quotas: المرشّحات يساراً والأرقام يميناً فوق، صفٌّ واحدٌ بالأساسيّات، و«+» للباقي.
 * بالعربية بقرار خالد. المقفول (كسبناه · خسرناه) خارج الجدول — «هذا الجدول للمتابعة» (٥ سبتمبر).
 */

const DATE = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", year: "numeric" });
const SHORT_DAY = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", timeZone: "Asia/Riyadh" });
const phoneDigits = (v: string | null) => (v ?? "").replace(/\D/g, "");
const isClosed = (r: SalesLeadRow) => r.stage === "WON" || r.stage === "LOST";

type Row = SalesLeadRow & { searchText: string; silenceDays: number };

const sourceText = (r: SalesLeadRow, labels: Record<string, string>) =>
  r.source ? labels[r.source] ?? r.source : null;

function buildColumns(sourceLabels: Record<string, string>): Column<Row>[] {
  return [
    {
      key: "name",
      header: "العميل",
      sortable: true,
      render: (r) => {
        const due = describeDue(r.nextActionAt);
        return (
          <span className="flex items-center gap-2">
            <span className="min-w-0">
              <Link
                href={`/sales-leads/${r.id}`}
                onClick={(e) => e.stopPropagation()}
                className="block max-w-[260px] truncate font-medium hover:text-primary hover:underline"
                title={r.name}
              >
                {r.name}
              </Link>
              {r.company ? <span className="block max-w-[260px] truncate text-[11px] text-muted-foreground">{r.company}</span> : null}
              {/* آخر ما سُجّل في السطر نفسه (خالد ٢٨ سبتمبر ٢٠٢٦: «أضيف الملاحظة… ما تظهر»):
                  كانت تحت «+» وحدها، فبدت الملاحظة المحفوظة كأنها ضاعت. */}
              {r.lastNote ? (
                <span className="block max-w-[260px] truncate text-[11px] text-muted-foreground" title={r.lastNote}>
                  {r.lastNote}
                </span>
              ) : null}
            </span>
            {/* الشيء الوحيد الذي يحتاج أحداً اليوم يبقى ظاهراً بلا فتح الصفّ. */}
            {due.tone === "overdue" || due.tone === "today" ? (
              <span
                className={cn(
                  "whitespace-nowrap rounded-full px-1.5 text-[10px] font-semibold leading-4 ring-1",
                  due.tone === "overdue"
                    ? "bg-rose-500/15 text-rose-700 ring-rose-500/30 dark:text-rose-300"
                    : "bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-300",
                )}
              >
                {due.tone === "overdue" ? "متأخّر" : "اليوم"}
              </span>
            ) : null}
          </span>
        );
      },
    },
    {
      key: "stage",
      header: "المرحلة",
      sortable: true,
      sortFn: (a, b) => PICKABLE_STAGES.indexOf(a.stage as never) - PICKABLE_STAGES.indexOf(b.stage as never),
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className={cn("size-2 rounded-full", STAGE_DOT[r.stage as Stage])} aria-hidden />
          <span className={cn("text-xs font-medium", STAGE_TEXT[r.stage as Stage])}>{STAGE_LABEL[r.stage as Stage]}</span>
        </span>
      ),
    },
    {
      key: "countryCode",
      header: "السوق",
      sortable: true,
      render: (r) =>
        r.countryCode ? (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs">
            <span className={cn("size-2 rounded-full", MARKET_DOT[r.countryCode] ?? "bg-muted")} aria-hidden />
            {MARKET_LABEL[r.countryCode] ?? r.countryCode}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "source",
      header: "المصدر",
      sortable: true,
      render: (r) => (
        <span className="flex flex-col text-xs">
          <span>{sourceText(r, sourceLabels) ?? <span className="text-muted-foreground">بلا مصدر</span>}</span>
          {r.isPaidAd ? (
            <span className="max-w-[160px] truncate text-[10px] font-medium text-amber-700 dark:text-amber-400">
              مدفوع{r.campaign ? ` · ${r.campaign}` : ""}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "silenceDays",
      header: <span title="منذ آخر تواصل مسجّل">آخر تواصل</span>,
      sortable: true,
      sortFn: (a, b) => a.silenceDays - b.silenceDays,
      className: "w-[1%] whitespace-nowrap",
      render: (r) => {
        const s = describeSilence(r.lastTouchAt);
        return <span className={cn("text-xs font-medium tabular-nums", SILENCE_TONE[s.tone])}>{s.text}</span>;
      },
    },
    {
      key: "nextActionAt",
      header: "الموعد القادم",
      sortable: true,
      // بلا موعد في الآخر أيّاً كان الاتّجاه — ليس «أقرب» ولا «أبعد».
      sortFn: (a, b) => (a.nextActionAt ? +new Date(a.nextActionAt) : Infinity) - (b.nextActionAt ? +new Date(b.nextActionAt) : Infinity),
      className: "w-[1%] whitespace-nowrap",
      render: (r) => {
        const d = describeDue(r.nextActionAt);
        return <span className={cn("text-xs font-medium", DUE_TONE[d.tone])}>{d.text}</span>;
      },
    },
    {
      key: "dealTotal",
      header: "قيمة الصفقة",
      sortable: true,
      sortFn: (a, b) => (a.dealTotal ?? -1) - (b.dealTotal ?? -1),
      className: "w-[1%] whitespace-nowrap tabular-nums",
      render: (r) => formatMoney(r.dealTotal, r.currency) ?? <span className="text-muted-foreground">—</span>,
    },
  ];
}

/** كل ما عدا الأساسيّات — تحت «+»: كيف أصل له، وما الصفقة، وما آخر ما قيل، وماذا أفعل الآن. */
function LeadDetails({ r, onLogged }: { r: Row; onLogged: () => void }) {
  const wa = waNumber(r.phone, r.countryCode);
  const due = describeDue(r.nextActionAt);
  return (
    <DetailCard
      columns="lg:grid-cols-[auto_1px_auto_1px_minmax(0,1fr)]"
      groups={[
        /* Empty facts are left out, not drawn as «—» (28 Sep 2026 review: the deal group read
           «غير معروفة · — · —»). A group with nothing in it says so in one line. */
        <FactGroup key="contact" title="التواصل">
          {r.phone ? <Fact label="الجوال" value={<span dir="ltr">{r.phone}</span>} /> : null}
          {r.email ? <Fact label="الإيميل" value={<span dir="ltr" className="text-sm">{r.email}</span>} /> : null}
          {r.ownerName ? <Fact label="المسؤول" value={r.ownerName} /> : null}
          {!r.phone && !r.email ? <Fact label="الجوال" value={<span className="text-sm font-normal text-muted-foreground">لا رقم ولا إيميل</span>} /> : null}
        </FactGroup>,
        <FactGroup key="deal" title="الصفقة">
          {r.planName ? (
            <>
              <Fact label="الباقة" value={r.planName} />
              {r.expectedMonths ? <Fact label="المدّة" value={`${formatCount(r.expectedMonths)} شهور`} /> : null}
            </>
          ) : (
            <Fact label="الباقة" value={<span className="text-sm font-normal text-muted-foreground">لم تُحدَّد بعد</span>} />
          )}
          {r.industryName ? <Fact label="المجال" value={r.industryName} /> : null}
          <Fact label="أُضيف" value={DATE.format(new Date(r.createdAt))} />
        </FactGroup>,
        <FactGroup key="next" title="آخر التواصل">
          {r.recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">لم يُسجَّل شيء بعد — أوّل تواصل يُسجَّل تحت.</p>
          ) : (
            <ol className="w-full space-y-1.5">
              {r.recent.map((f, i) => {
                const Icon = CHANNEL_ICON[f.channel as Channel] ?? CHANNEL_ICON.NOTE;
                return (
                  <li key={i} className="flex min-w-0 items-start gap-2 text-sm">
                    <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-label={CHANNEL_LABEL[f.channel as Channel] ?? "ملاحظة"} />
                    <span className="shrink-0 text-[11px] tabular-nums leading-5 text-muted-foreground">{SHORT_DAY.format(new Date(f.happenedAt))}</span>
                    <span className="min-w-0 truncate leading-5" title={f.body}>{f.body}</span>
                  </li>
                );
              })}
            </ol>
          )}
          {r.nextActionAt ? (
            <p className={cn("w-full text-xs font-medium", DUE_TONE[due.tone])}>
              الموعد القادم: {due.text}
              {r.nextActionNote ? <span className="font-normal text-muted-foreground"> — {r.nextActionNote}</span> : null}
            </p>
          ) : null}
        </FactGroup>,
      ]}
      footer={
        /* Khalid, 28 Sep 2026: the log box holds only logging — channel, date and «تسجيل» on one
           line, the text under it — and every button goes to one row below it: reach the lead
           (اتصال · واتساب), open or edit it, and delete at the far end. */
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          {/* Its own colour (Khalid, 28 Sep 2026): the grey box melted into the grey card around it. */}
          <section aria-label="تسجيل تواصل" className="rounded-md border-2 border-primary/40 bg-primary/5 p-3">
            <LogForm leadId={r.id} compact onLogged={onLogged} />
          </section>
          <div className="flex flex-wrap items-center gap-1.5">
            {r.phone ? (
              <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <a href={`tel:${r.phone}`}>
                  <Phone className="size-3.5" aria-hidden /> اتصال
                </a>
              </Button>
            ) : null}
            {r.phone ? <NoAnswerButton leadId={r.id} onLogged={onLogged} /> : null}
            {wa ? (
              <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-3.5" aria-hidden /> واتساب
                </a>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Link href={`/sales-leads/${r.id}`}>
                <ExternalLink className="size-3.5" aria-hidden /> متابعة العميل
              </Link>
            </Button>
            {/* Edit and delete manage the record, not the follow-up (Khalid, 28 Sep 2026): same line
                to save space, but pushed to the far end together, apart from the working buttons. */}
            <span className="ms-auto flex items-center gap-1.5">
              <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
                <Link href={`/sales-leads/${r.id}/edit`}>
                  <Pencil className="size-3.5" aria-hidden /> تعديل
                </Link>
              </Button>
              <DeleteLeadDialog leadId={r.id} leadName={r.name} className="h-8" />
            </span>
          </div>
        </div>
      }
    />
  );
}

/**
 * المربّعات الأربعة — كلٌّ منها مرشِّحه (معيار كيانات الأدمن #٤): اختبارٌ واحد يختار الصفوف
 * والرقم يُعدّ على تلك الصفوف نفسها، فلا يعد المربّع بأكثر مما يُظهره الضغط.
 *
 * «عليّ اليوم» (المتأخّر + موعد اليوم) هو ما كانت صفحة «المتابعة» المستقلّة تعرضه — دُمجت هنا
 * (خالد ٢٨ سبتمبر ٢٠٢٦: «ما نحتاج… فور مستقل، نعملها داخل الجدول»)، والصفحة تفتح عليه.
 */
type KpiKey = "due" | "upcoming" | "none" | "all";
/**
 * The first three split every open lead once (Khalid, 28 Sep 2026: «العملاء اللي عندهم متابعة
 * يكونوا ظاهرين في التوجل»): due today or late · a date later on · no date at all. So they add
 * up to «كل المفتوح», and a lead with a call booked next week is one click away, not lost among
 * the rest. «متأخّر» stays visible as the red badge beside the name.
 */
const dueTone = (r: Row) => describeDue(r.nextActionAt).tone;
const isDue = (r: Row) => dueTone(r) === "overdue" || dueTone(r) === "today";
const KPIS: Record<KpiKey, KpiMeta & { icon: React.ComponentType<{ className?: string }>; test: (r: Row) => boolean }> = {
  due: {
    label: "عليّ اليوم",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500",
    icon: CalendarCheck,
    test: isDue,
  },
  upcoming: {
    label: "موعد قادم",
    tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500",
    icon: CalendarClock,
    test: (r) => dueTone(r) === "soon" || dueTone(r) === "later",
  },
  none: {
    label: "بدون موعد",
    tone: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
    ring: "ring-slate-500",
    icon: CalendarX2,
    test: (r) => dueTone(r) === "none",
  },
  all: { label: "كل المفتوح", tone: "bg-blue-500/15 text-blue-600 dark:text-blue-400", ring: "ring-blue-500", icon: Users2, test: () => true },
};

export function LeadsTable({
  rows,
  sourceLabels,
  activeSources,
}: {
  /** المقروء + المستحقّ من استعلامه غير المسقوف، مدموجَين في الصفحة — فلا يضيع موعدٌ خلف سقف الألفين. */
  rows: SalesLeadRow[];
  /** من `lead_source_options` — تصل محلولةً من السيرفر. */
  sourceLabels: Record<string, string>;
  /** القنوات المفعَّلة بترتيب خالد — تُعرض ولو بصفر: «انستقرام ٠» جوابٌ لا فراغ (٥ سبتمبر). */
  activeSources: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const stage = params.get("stage") as Stage | null;
  const market = params.get("market");
  const source = params.get("source");
  const kpiParam = params.get("kpi") as KpiKey | null;
  const justCreated = params.get("new");
  /**
   * مَن سُجِّل له شيءٌ في هذه الجلسة يبقى ظاهراً ولو خرج من المرشّح. بلا هذا، ملاحظةٌ بلا موعد
   * على «عليّ اليوم» تُخرج العميل فوراً فيختفي الصفّ وملاحظته معه — مقيس: «سلطان · اليوم» ←
   * «لا أحد عليك اليوم» (٢٨ سبتمبر ٢٠٢٦). يسقط الاستثناء عند إعادة فتح الصفحة.
   */
  const [logged, setLogged] = useState<ReadonlySet<string>>(new Set());
  const markLogged = (id: string) => setLogged((s) => new Set(s).add(id));
  const setParam = (key: "stage" | "market" | "source" | "kpi", value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("new");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // المفتوح وحده، والأطول صمتاً أوّلاً — ترتيب القائمة القديم الافتراضيّ.
  const base = useMemo<Row[]>(
    () =>
      rows
        .filter((r) => !isClosed(r))
        .map((r) => ({
          ...r,
          searchText: `${r.name} ${r.company ?? ""} ${r.phone ?? ""} ${phoneDigits(r.phone)}`,
          silenceDays: describeSilence(r.lastTouchAt).days ?? 0,
        }))
        // The lead just saved (`?new=`) first: sorted by silence it would sink to the bottom
        // (silence 0) and its highlight would sit off-screen.
        .sort((a, b) => Number(b.id === justCreated) - Number(a.id === justCreated) || b.silenceDays - a.silenceDays),
    [rows, justCreated],
  );

  // من الأعرض إلى الأضيق — السوق (بجانب العنوان) ثم المرحلة ثم المصدر، وكلٌّ يعدّ داخل ما قبله.
  const byMarket = market ? base.filter((r) => (r.countryCode || NO_MARKET) === market) : base;
  const byStage = stage ? byMarket.filter((r) => r.stage === stage) : byMarket;
  const bySource = source ? byStage.filter((r) => (r.source || NO_SOURCE) === source) : byStage;
  // Opens on «عليّ اليوم» when someone is due; with no one due it would open on an empty table,
  // so it falls back to everything. «كل المفتوح» is written to the URL as `kpi=all`.
  // Right after saving a lead (`?new=`) it opens on everything too: the new lead has no date
  // yet, so «عليّ اليوم» would hide the row just saved (caught in the live test, 28 Sep 2026).
  const kpi: KpiKey =
    kpiParam && KPIS[kpiParam] ? kpiParam : !justCreated && bySource.some(isDue) ? "due" : "all";
  const visible = bySource.filter((r) => KPIS[kpi].test(r) || logged.has(r.id));

  const count = (list: Row[], test: (r: Row) => boolean) => list.filter(test).length;
  const noMarket = count(base, (r) => !r.countryCode);
  const sourceKeys = useMemo(() => {
    const keys = new Set<string>([...activeSources.map((s) => s.value), ...base.map((r) => r.source || NO_SOURCE)]);
    const order = new Map(activeSources.map((s, i) => [s.value, i]));
    return [...keys].sort((a, b) => (a === NO_SOURCE ? 1 : b === NO_SOURCE ? -1 : (order.get(a) ?? 999) - (order.get(b) ?? 999)));
  }, [activeSources, base]);
  const sourceLabel = (k: string) => (k === NO_SOURCE ? "بلا مصدر" : sourceLabels[k] ?? k);
  // «بلا مصدر» is a data gap, not a channel: shown only when someone has it, never as silent.
  const producing = sourceKeys.filter((k) => base.some((r) => (r.source || NO_SOURCE) === k));
  const silent = sourceKeys.filter((k) => k !== NO_SOURCE && !producing.includes(k));

  const pipeline = [
    formatMoney(visible.reduce((s, r) => s + (r.currency === "SAR" ? r.dealTotal ?? 0 : 0), 0), "SAR"),
    formatMoney(visible.reduce((s, r) => s + (r.currency === "EGP" ? r.dealTotal ?? 0 : 0), 0), "EGP"),
  ]
    .filter(Boolean)
    .join(" · ");

  const columns = useMemo(() => buildColumns(sourceLabels), [sourceLabels]);

  return (
    <div className="space-y-3">
      <header className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold">العملاء المحتملون</h1>
            {/* السوق بجانب العنوان (خالد ٢٨ سبتمبر ٢٠٢٦) — أعرض مرشِّح، فأوّل ما يُختار. */}
            <div role="group" aria-label="السوق" className="flex flex-wrap items-center gap-1.5">
              <CountTab label="السوقان" count={formatCount(base.length)} active={!market} onClick={() => setParam("market", null)} />
              {MARKETS.map((m) => {
                const n = count(base, (r) => r.countryCode === m);
                return (
                  <CountTab
                    key={m}
                    label={
                      <span className="inline-flex items-center gap-1.5">
                        <span className={cn("size-1.5 rounded-full", MARKET_DOT[m])} aria-hidden />
                        {MARKET_LABEL[m]}
                      </span>
                    }
                    count={formatCount(n)}
                    active={market === m}
                    disabled={n === 0 && market !== m}
                    onClick={() => setParam("market", market === m ? null : m)}
                  />
                );
              })}
              {noMarket > 0 ? (
                <CountTab
                  label="بلا سوق"
                  count={formatCount(noMarket)}
                  active={market === NO_MARKET}
                  onClick={() => setParam("market", market === NO_MARKET ? null : NO_MARKET)}
                />
              ) : null}
            </div>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatCount(base.length)} عميل مفتوح{pipeline ? ` · قيمة الصفقات المعروضة: ${pipeline}` : ""}
          </p>
        </div>
        <Button asChild className="shrink-0 gap-1.5">
          <Link href="/sales-leads/new">
            <Plus className="size-4" aria-hidden /> إضافة عميل محتمل
          </Link>
        </Button>
      </header>

      {/* Unlike Client Quotas, the source row is long (13 channels): the filters take the free
          width and wrap, the four tiles keep a fixed share — «auto» squeezed them to a sliver. */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <section aria-label="المرشّحات" className="flex flex-col justify-center gap-2 rounded-lg border bg-card px-4 py-2.5">
          <FilterRow label="المرحلة">
            <CountTab label="المفتوح" count={formatCount(byMarket.length)} active={!stage} onClick={() => setParam("stage", null)} />
            {PICKABLE_STAGES.map((s) => {
              const n = count(byMarket, (r) => r.stage === s);
              return (
                <CountTab
                  key={s}
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <span className={cn("size-1.5 rounded-full", STAGE_DOT[s])} aria-hidden />
                      {STAGE_LABEL[s]}
                    </span>
                  }
                  count={formatCount(n)}
                  active={stage === s}
                  disabled={n === 0 && stage !== s}
                  onClick={() => setParam("stage", stage === s ? null : s)}
                />
              );
            })}
          </FilterRow>
          {sourceKeys.length > 1 ? (
            <FilterRow label="المصدر">
              <CountTab label="الكل" count={formatCount(byStage.length)} active={!source} onClick={() => setParam("source", null)} />
              {/* Channels that brought someone: full pills with their count, side by side. */}
              {producing.map((k) => {
                const n = count(byStage, (r) => (r.source || NO_SOURCE) === k);
                const Icon = SOURCE_ICON[k];
                return (
                  <CountTab
                    key={k}
                    label={
                      Icon ? (
                        <span title={sourceLabel(k)} className="inline-flex items-center">
                          <Icon className="size-4" aria-hidden />
                          <span className="sr-only">{sourceLabel(k)}</span>
                        </span>
                      ) : (
                        sourceLabel(k)
                      )
                    }
                    count={formatCount(n)}
                    active={source === k}
                    disabled={n === 0 && source !== k}
                    onClick={() => setParam("source", source === k ? null : k)}
                  />
                );
              })}
              {/*
                Channels that brought no one yet — icons alone, faded, after a thin rule (Khalid,
                28 Sep 2026: «اعرف انه هذه الايكون ما تفعلت لسه»). Judged on every open lead, not
                on the filters, so a silent channel stays silent whatever else is picked.
              */}
              {silent.length > 0 ? (
                <span className="flex items-center gap-1 border-s ps-2" aria-label="قنوات لم يأتِ منها عميل بعد">
                  {silent.map((k) => {
                    const Icon = SOURCE_ICON[k];
                    return (
                      <span
                        key={k}
                        title={`${sourceLabel(k)} — لم يأتِ منها عميل بعد`}
                        className="inline-flex size-7 items-center justify-center rounded-full border border-dashed text-muted-foreground/60"
                      >
                        {Icon ? <Icon className="size-3.5" aria-hidden /> : <span className="text-[10px]">{sourceLabel(k)}</span>}
                        <span className="sr-only">{sourceLabel(k)} — لم يأتِ منها عميل بعد</span>
                      </span>
                    );
                  })}
                </span>
              ) : null}
            </FilterRow>
          ) : null}
        </section>
        <section aria-label="الأرقام">
          <div className="grid h-full auto-rows-fr grid-cols-2 gap-2">
            {(Object.keys(KPIS) as KpiKey[]).map((key) => {
              const k = KPIS[key];
              const n = bySource.filter(k.test).length;
              return (
                <KpiToggle
                  variant="tile"
                  key={key}
                  meta={k}
                  icon={k.icon}
                  value={formatCount(n)}
                  active={kpi === key}
                  disabled={n === 0 && kpi !== key}
                  onClick={() => setParam("kpi", key)}
                />
              );
            })}
          </div>
        </section>
      </div>

      <DataTable
        data={visible}
        columns={columns}
        searchKey="searchText"
        searchPlaceholder="ابحث بالاسم أو الشركة أو رقم الجوال…"
        pageSize={50}
        emptyText={kpi === "due" ? "لا أحد عليك اليوم" : "لا عميل محتمل يطابق المرشّحات"}
        rowClassName={(r) =>
          logged.has(r.id)
            ? "!bg-emerald-500/10"
            : r.id === justCreated
              ? "!bg-primary/10"
              : // A lead we have actually spoken to stands apart (Khalid, 28 Sep 2026). Not «has any
                // history»: 14 of those 19 rows were «بدون رد» — attempts, which keep the lead
                // «جديد» (helpers/no-answer.ts). So the colour and «تواصلنا» mean the same thing.
                r.stage !== "NEW"
                ? "!bg-sky-100/70 shadow-[inset_-3px_0_0_0_rgb(14_165_233)] dark:!bg-sky-500/10"
                : undefined
        }
        renderExpanded={(r) => <LeadDetails r={r} onLogged={() => markLogged(r.id)} />}
        expandLabel={(r) => `تفاصيل ${r.name.trim()}`}
      />
    </div>
  );
}
