"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, X } from "lucide-react";

import { LeadsList } from "./leads-list";
import { type DueFilter } from "./signal-cards";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterCard, FilterRow } from "./filter-card";
import { cn } from "@/lib/utils";
import { SILENT_AFTER_DAYS, describeSilence } from "../helpers/describe-silence";
import { formatCount } from "../helpers/format-count";
import { MARKETS, MARKET_DOT, MARKET_LABEL, NO_MARKET } from "../helpers/markets";
import {
  PICKABLE_STAGES, STAGE_DOT, STAGE_LABEL, describeDue, formatMoney, type Stage,
} from "../helpers/funnel";
import type { SalesLeadRow } from "../helpers/get-sales-leads";
import { NO_SOURCE, type LeadsSummary } from "../helpers/summarize-leads";

const DUE_LABEL: Record<Exclude<DueFilter, "all">, string> = {
  overdue: "متأخّر",
  today: "موعد اليوم",
  noDate: "بلا موعد",
  silent: "ساكت ٣٠+ يوم",
};

/** «ساكت» يُقاس على الماضي لا على الموعد، فله فرعه — والباقي نغمةُ `describeDue`. */
const TONE_OF: Record<"overdue" | "today" | "noDate", string> = {
  overdue: "overdue",
  today: "today",
  noDate: "none",
};

const isClosed = (r: SalesLeadRow) => r.stage === "WON" || r.stage === "LOST";

/**
 * البحث في الرقم يتجاهل فراغاته ورمز البلد وشكله المرئي؛ فـ `+966 50 123 4567`
 * و`0501234567` يجب أن يصلا إلى العميل نفسه. الاسم والشركة يبقيان بحثاً نصياً عادياً.
 */
const phoneDigits = (value: string | null) => (value ?? "").replace(/\D/g, "");

/**
 * مالك المرشّحات الوحيد.
 *
 * الإشارات والمراحل والجدول ثلاثتها تعرض نفس الصفوف من زوايا مختلفة، فحالةُ ترشيحٍ في كلٍّ
 * منها تعني ثلاث حقائق تتخالف: تضغط «متأخّر» فيتغيّر الجدول ولا يتغيّر عدّاد المرحلة. فالحالة
 * هنا وحدها، والثلاثة تقرأ منها.
 *
 * والإشارات تُحسب على **كل** المفتوح دائماً، لا على المعروض: عدّادٌ يتقلّص كلّما رشّحتَ يفقد
 * معناه — «كم متأخّراً عندي؟» سؤالٌ عن الكلّ لا عن الشاشة.
 */
export function LeadsBoard({
  rows,
  summary,
  sourceLabels,
  activeSources,
  title,
}: {
  rows: SalesLeadRow[];
  summary: LeadsSummary;
  /** من `lead_source_options` — تصل محلولةً من السيرفر، فلا خريطة أسماء في الكود. */
  sourceLabels: Record<string, string>;
  /** القنوات المفعَّلة كلّها بترتيب خالد — تُعرض ولو بصفر. */
  activeSources: { value: string; label: string }[];
  /**
   * العنوان نصٌّ لا عقدة.
   *
   * مرّرتُه أوّلاً عنصراً جاهزاً من الصفحة فحذّر رياكت: «Check the render method of
   * `LeadsBoard`. It was passed a child from SalesLeadsPage» — عناصر تُبنى في مكانٍ وتُوضع
   * في قائمةٍ في مكانٍ آخر تفقد مفاتيحها. والنصّ لا يحمل هذه المشكلة، والزرّ يُبنى هنا.
   */
  title: string;
}) {
  /**
   * معرّف عميلٍ سُجِّل للتوّ — يصل في العنوان من نموذج التأسيس (`?new=<id>`).
   *
   * في العنوان لا في الحالة: يبقى بعد التحديث، ويُشارَك، ولا يحتاج جسراً بين شاشتين.
   */
  const justCreated = useSearchParams().get("new");

  const [stage, setStage] = useState<Stage | null>(null);
  const [due, setDue] = useState<DueFilter>("all");
  const [query, setQuery] = useState("");
  /** `null` = كل المصادر · `NO_SOURCE` = مَن بلا مصدر. */
  const [source, setSource] = useState<string | null>(null);
  /** `null` = السوقان معاً · `NO_MARKET` = مَن بلا سوق. */
  const [market, setMarket] = useState<string | null>(null);

  /**
   * المقفول خارج القائمة — أمر خالد (٥ سبتمبر): «هذا الجدول للمتابعة».
   *
   * عميلٌ كسبناه صار عميلاً وله شاشته، وعميلٌ خسرناه أُغلق بسببه. كلاهما **لا يُتابَع**، ووجودهما
   * بين الصفوف يخلط قائمة عملٍ تُفرَغ بأرشيفٍ يُقرأ مرّة.
   *
   * وكان تحت القائمة سطرٌ يقول عددهم ويفتحهم، فحُذف بأمره (٥ سبتمبر: «remove no need»).
   * فالمقفول الآن لا يُبلَغ من هذه الشاشة: المكسوب يُفتح من «العملاء»، والخسارة من رابطها
   * المباشر. وهذا قراره لا سهوٌ منّي.
   */
  const base = useMemo(() => rows.filter((r) => !isClosed(r)), [rows]);

  /**
   * البحث مرشِّحٌ ثالث — لا ساكنٌ في `DataTable`.
   *
   * كان داخلها فيرسم صفّه الخاصّ فوق الجدول، فصار في الصفحة صفٌّ للحبّات وصفٌّ للبحث نصفه
   * فارغ (خالد ٥ سبتمبر: «شيله من هنا وحطّه جنب الـtoggle في الطرف الآخر»). ونقله إلى هنا
   * ليس نقلَ مكانٍ فحسب: هذه الشاشة **مالك المرشّحات الوحيد**، وبحثٌ يعيش في مكانٍ آخر يعني
   * عدّاداً يقول «معروض ١٧» بينما الجدول يعرض ثلاثة.
   */
  const shown = useMemo(() => {
    let out = base;
    if (stage) out = out.filter((r) => r.stage === stage);
    if (source) out = out.filter((r) => (r.source || NO_SOURCE) === source);
    if (market) out = out.filter((r) => (r.countryCode || NO_MARKET) === market);
    if (due === "silent") {
      out = out.filter((r) => {
        const d = describeSilence(r.lastTouchAt).days;
        return !isClosed(r) && d !== null && d >= SILENT_AFTER_DAYS;
      });
    } else if (due !== "all") {
      const want = TONE_OF[due];
      out = out.filter((r) => !isClosed(r) && describeDue(r.nextActionAt).tone === want);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      const phoneQuery = phoneDigits(q);
      // الاسم والشركة والجوّال معاً: تُبحث «الشفاء» فيصل مَن اسم مركزه ذلك ومَن شركته كذلك،
      // والرقم يُقارن كأرقام كي لا تمنع المسافات أو `+966` العثور عليه.
      out = out.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.company ?? "").toLowerCase().includes(q) ||
          (phoneQuery.length > 0 && phoneDigits(r.phone).includes(phoneQuery)),
      );
    }
    return out;
  }, [base, stage, source, market, due, query]);

  const filtered =
    Boolean(stage) || Boolean(source) || Boolean(market) || due !== "all" || query.trim().length > 0;

  const sourceLabelOf = (v: string) =>
    v === NO_SOURCE ? "بلا مصدر" : sourceLabels[v] ?? v;

  /**
   * **كل** القنوات تُعرض — ولو بصفر (خالد ٥ سبتمبر: «عشان أعرف إيش المصدر اللي بيديني نتائج أكتر»).
   *
   * والصفر جوابٌ لا فراغ: «انستقرام ٠» يقول إن القناة لم تجب أحداً، وهي المقارنة المطلوبة
   * نفسها. وإخفاء الأصفار كان يجعل الشاشة تعرض الفائز وحده بلا مَن خسر.
   *
   * والقائمة اتّحادُ ثلاثة: القنوات المفعَّلة، وقيمةٌ مخزَّنة لمصدرٍ أُقفل بعد استعماله
   * («سوشيال (قديم)» — ١٧ عميلاً لا يجوز أن يختفوا لأن البند أُغلق)، و«بلا مصدر» إن وُجد.
   *
   * الترتيب بالعدد تنازلياً: هو ترتيب المقارنة التي طُلبت — الأكثر إنتاجاً أوّلاً، والأصفار
   * تتكتّل آخراً بترتيب خالد نفسه. و«بلا مصدر» في الذيل: ثغرةُ إسنادٍ لا قناة.
   */
  const sourceKeys = useMemo(() => {
    const order = new Map(activeSources.map((s, i) => [s.value, i]));
    const keys = new Set<string>([
      ...activeSources.map((s) => s.value),
      ...Object.keys(summary.bySource),
    ]);
    if (!summary.bySource[NO_SOURCE]) keys.delete(NO_SOURCE);

    return [...keys].sort((a, b) => {
      if (a === NO_SOURCE) return 1;
      if (b === NO_SOURCE) return -1;
      const diff = (summary.bySource[b] ?? 0) - (summary.bySource[a] ?? 0);
      if (diff !== 0) return diff;
      return (order.get(a) ?? 999) - (order.get(b) ?? 999);
    });
  }, [activeSources, summary.bySource]);

  /**
   * ما يُخفى الآن — يُقال حيث يُقرأ.
   *
   * الترشيح الصامت يُقرأ كـ«هذا كل ما عندنا»، وهو أخطر ما في شاشةٍ فيها مرشّحات. ومكانه صفّ
   * البحث لا سطرٌ فوقه: ذلك النصف كان فارغاً، وسطرٌ مستقلّ يدفع الجدول تحت الطيّة بلا مقابل.
   */
  const status = filtered ? (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>
        معروض <span className="font-medium tabular-nums text-foreground">{formatCount(shown.length)}</span> من{" "}
        <span className="tabular-nums">{formatCount(base.length)}</span>
      </span>
      {stage && <span className="rounded-full border px-2 py-0.5">{STAGE_LABEL[stage]}</span>}
      {source && <span className="rounded-full border px-2 py-0.5">{sourceLabelOf(source)}</span>}
      {market && (
        <span className="rounded-full border px-2 py-0.5">
          {market === NO_MARKET ? "بلا سوق" : MARKET_LABEL[market] ?? market}
        </span>
      )}
      {due !== "all" && <span className="rounded-full border px-2 py-0.5">{DUE_LABEL[due]}</span>}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={() => {
          setStage(null);
          setSource(null);
          setMarket(null);
          setDue("all");
          setQuery("");
        }}
      >
        <X className="size-3" aria-hidden /> امسح الترشيح
      </Button>
    </div>
  ) : null;

  /**
   * السوق — يجاور المرحلة في الرفّ اليمين (خالد ٥ سبتمبر: «السوق يجيبوا عند المرحلة»).
   *
   * والسوقان يُعرضان دائماً ولو بصفر، كالمصادر: «السعودية ٠» جوابٌ يقول إن السوق لم يُفتح بعد،
   * وإخفاؤه يجعل الشاشة تعرض الرابح وحده. و«بلا سوق» يظهر حين يوجد فقط — ثغرةُ بياناتٍ تُسدّ
   * لا خانةٌ دائمة (٢ من ٢٠ اليوم).
   */
  const marketFilter = (
    <FilterCard
      title="السوق"
      allLabel="السوقان"
      allCount={formatCount(base.length)}
      isAll={market === null}
      onAll={() => setMarket(null)}
    >
      {MARKETS.map((m) => {
        const n = summary.byMarket[m] ?? 0;
        return (
          <FilterRow
            key={m}
            dot={MARKET_DOT[m]}
            label={MARKET_LABEL[m]}
            count={formatCount(n)}
            active={market === m}
            disabled={n === 0}
            onClick={() => setMarket(market === m ? null : m)}
          />
        );
      })}
      {(summary.byMarket[NO_MARKET] ?? 0) > 0 && (
        <FilterRow
          label="بلا سوق"
          count={formatCount(summary.byMarket[NO_MARKET] ?? 0)}
          active={market === NO_MARKET}
          onClick={() => setMarket(market === NO_MARKET ? null : NO_MARKET)}
        />
      )}
    </FilterCard>
  );

  /**
   * المرحلة — `CountTab` بحسب **معيار كيانات الأدمن #١**.
   *
   * والمراحل هنا **المفتوحة وحدها** (`PICKABLE_STAGES`): المقفول ليس مرحلةً تُتابَع.
   */
  const stageFilter = (
    <FilterCard
      title="المرحلة"
      allLabel="المفتوح"
      allCount={formatCount(base.length)}
      isAll={stage === null}
      onAll={() => setStage(null)}
    >
      {PICKABLE_STAGES.map((s) => {
        const n = summary.byStage[s] ?? 0;
        // المرحلة الفارغة تختفي — إلّا المختارة. صفوفُ أصفار تُمسح بالعين بدل أن تُقرأ.
        if (n === 0 && stage !== s) return null;
        return (
          <FilterRow
            key={s}
            dot={STAGE_DOT[s]}
            label={STAGE_LABEL[s]}
            count={formatCount(n)}
            active={stage === s}
            onClick={() => setStage(stage === s ? null : s)}
          />
        );
      })}
    </FilterCard>
  );

  /**
   * المصدر — توجل مستقلّ لكل قناة (خالد ٥ سبتمبر)، ولا يُرسم إلا بأكثر من واحدة:
   * توجلٌ واحد لا يرشّح شيئاً.
   */
  const sourceFilter = sourceKeys.length > 1 && (
    <FilterCard
      title="المصدر"
      allLabel="الكل"
      allCount={formatCount(base.length)}
      isAll={source === null}
      onAll={() => setSource(null)}
    >
      {sourceKeys.map((k) => {
        const n = summary.bySource[k] ?? 0;
        return (
          <FilterRow
            key={k}
            label={sourceLabelOf(k)}
            count={formatCount(n)}
            active={source === k}
            // الصفر يُقرأ ولا يُضغط — نفس قاعدة بطاقات الإشارات.
            disabled={n === 0}
            onClick={() => setSource(source === k ? null : k)}
          />
        );
      })}
    </FilterCard>
  );

  const dueFilter = (
    <FilterCard
      title="حالة المتابعة"
      allLabel="الكل"
      allCount={formatCount(base.length)}
      isAll={due === "all"}
      onAll={() => setDue("all")}
    >
      <FilterRow
        dot="bg-red-500"
        label="متأخر"
        count={formatCount(summary.overdue)}
        active={due === "overdue"}
        disabled={summary.overdue === 0}
        onClick={() => setDue(due === "overdue" ? "all" : "overdue")}
      />
      <FilterRow
        dot="bg-amber-500"
        label="موعد اليوم"
        count={formatCount(summary.today)}
        active={due === "today"}
        disabled={summary.today === 0}
        onClick={() => setDue(due === "today" ? "all" : "today")}
      />
      <FilterRow
        dot="bg-orange-500"
        label="بلا موعد"
        count={formatCount(summary.noDate)}
        active={due === "noDate"}
        disabled={summary.noDate === 0}
        onClick={() => setDue(due === "noDate" ? "all" : "noDate")}
      />
    </FilterCard>
  );

  const tabClass = (active: boolean) =>
    cn(
      "rounded-md px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  const topFilters = (
    <nav aria-label="تصفية العملاء المحتملين" className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y py-2">
      <div className="flex items-center gap-1 overflow-hidden rounded-lg border bg-card p-1 ps-0">
        <span className="flex self-stretch items-center border-e bg-muted/50 px-2 text-[11px] font-medium text-foreground">المرحلة</span>
        <button type="button" onClick={() => setStage(null)} aria-pressed={stage === null} className={tabClass(stage === null)}>
          المفتوح {formatCount(base.length)}
        </button>
        {PICKABLE_STAGES.map((value) => {
          const count = summary.byStage[value] ?? 0;
          if (count === 0 && stage !== value) return null;
          return (
            <button key={value} type="button" onClick={() => setStage(stage === value ? null : value)} aria-pressed={stage === value} className={tabClass(stage === value)}>
              {STAGE_LABEL[value]} {formatCount(count)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1 overflow-hidden rounded-lg border bg-card p-1 ps-0">
        <span className="flex self-stretch items-center border-e bg-muted/50 px-2 text-[11px] font-medium text-foreground">السوق</span>
        <button type="button" onClick={() => setMarket(null)} aria-pressed={market === null} className={tabClass(market === null)}>
          الكل
        </button>
        {MARKETS.map((value) => (
          <button key={value} type="button" onClick={() => setMarket(market === value ? null : value)} aria-pressed={market === value} disabled={(summary.byMarket[value] ?? 0) === 0} className={tabClass(market === value)}>
            {MARKET_LABEL[value]} {formatCount(summary.byMarket[value] ?? 0)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 overflow-hidden rounded-lg border bg-card p-1 ps-0">
        <span className="flex self-stretch items-center border-e bg-muted/50 px-2 text-[11px] font-medium text-foreground">المتابعة</span>
        {(["overdue", "today", "noDate"] as const).map((value) => (
          <button key={value} type="button" onClick={() => setDue(due === value ? "all" : value)} aria-pressed={due === value} disabled={summary[value] === 0} className={tabClass(due === value)}>
            {DUE_LABEL[value]} {formatCount(summary[value])}
          </button>
        ))}
      </div>
    </nav>
  );

  const pipelineValue = [formatMoney(summary.pipeline.SAR, "SAR"), formatMoney(summary.pipeline.EGP, "EGP")]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="container mx-auto max-w-[1128px] px-3 py-3 sm:px-4 sm:py-6">
      <header className="mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h1 className="text-xl font-semibold leading-tight">{title}</h1>
              <span className="text-sm text-muted-foreground">
                {formatCount(base.length)} عميل مفتوح
              </span>
              {pipelineValue && <span className="text-xs text-muted-foreground">قيمة الصفقات: {pipelineValue}</span>}
            </div>
          </div>
          <Button asChild className="shrink-0 gap-1.5">
            <Link href="/sales-leads/new">
              <Plus className="size-4" aria-hidden /> إضافة عميل محتمل
            </Link>
          </Button>
        </div>
        {topFilters}
      </header>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside aria-label="مصدر العملاء المحتملين" className="w-full shrink-0 lg:sticky lg:top-4 lg:w-[300px] lg:self-start">
          {sourceFilter}
        </aside>
        <main className="min-w-0 flex-1 space-y-3 pb-20 lg:pb-0">
          {/* البحث فوق البطاقات مباشرةً: هو أوّل ما يُلمس حين يكون الاسم معروفاً. */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بالاسم أو الشركة أو رقم الجوال…"
              aria-label="ابحث بالاسم أو الشركة أو رقم الجوال"
              className="h-9 ps-8 text-xs"
            />
          </div>

          {status}

          <LeadsList
            rows={shown}
            emptyBecauseFiltered={filtered && base.length > 0}
            highlightId={justCreated}
          />
        </main>
      </div>
    </div>
  );
}
