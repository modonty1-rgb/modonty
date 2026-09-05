"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, X } from "lucide-react";

import { LeadsList } from "./leads-list";
import { SignalCards, type DueFilter } from "./signal-cards";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterCard, FilterRow } from "./filter-card";
import { ThreeColumnLayout } from "@modonty/shared/components/column-layout/ThreeColumnLayout";
import { cn } from "@/lib/utils";
import { SILENT_AFTER_DAYS, describeSilence } from "../helpers/describe-silence";
import { formatCount } from "../helpers/format-count";
import { MARKETS, MARKET_DOT, MARKET_LABEL, NO_MARKET } from "../helpers/markets";
import {
  PICKABLE_STAGES, STAGE_DOT, STAGE_LABEL, describeDue, type Stage,
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
      // الاسم والشركة معاً: تُبحث «الشفاء» فيصل مَن اسم مركزه ذلك ومَن شركته كذلك.
      out = out.filter(
        (r) =>
          r.name.toLowerCase().includes(q) || (r.company ?? "").toLowerCase().includes(q),
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

  /**
   * ثلاثة أعمدة — نفس صدفة الشاشتين الأخريين (خالد ٥ سبتمبر: «طبّق الـlayout الثلاثة أعمدة»).
   *
   * والقسمة بأولويّة الاستعمال: **الوسط** للبطاقات لأنها الشغل، و**اليمين** للإشارات لأنها ما
   * يُقرأ أوّلاً في العربية، و**اليسار** للمرشّحات لأنها تُلمس عند الحاجة لا في كل نظرة.
   *
   * والمكسب الأكبر أن البطاقة نزلت من `1113` بكسلاً إلى عرض العمود: بطاقةٌ بعرض الشاشة تترك
   * وسطها فارغاً وتدفع طرفيها إلى حافّتين لا تُقرآن معاً. ومعها خرجت ثلاثة صفوفٍ من الحبّات من
   * فوق القائمة، فصارت البطاقة الأولى تُرى بلا تمرير.
   */
  return (
    <ThreeColumnLayout
      className="!px-0 !py-0"
      header={
        /* العنوان · الإشارات · زرّ الإضافة — صفٌّ واحد (خالد: «طلّعه فوق جنب إضافة عميل»). */
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="shrink-0 text-lg font-semibold leading-tight">{title}</h1>
          <div className="min-w-0 flex-1">
            <SignalCards summary={summary} active={due} onPick={setDue} />
          </div>
          <Button asChild size="sm" className="shrink-0 gap-1.5">
            <Link href="/sales-leads/new">
              <Plus className="size-4" aria-hidden /> إضافة عميل
            </Link>
          </Button>
        </div>
      }
      right={
        <aside aria-label="المرحلة والسوق" className="w-full shrink-0 lg:sticky lg:top-0 lg:w-[260px]">
          <div className="space-y-3">{stageFilter}{marketFilter}</div>
        </aside>
      }
      center={
        <div className="space-y-3">
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
              placeholder="ابحث بالاسم أو الشركة…"
              aria-label="ابحث بالاسم أو الشركة"
              className="h-9 ps-8 text-xs"
            />
          </div>

          {status}

          <LeadsList
            rows={shown}
            emptyBecauseFiltered={filtered && base.length > 0}
            highlightId={justCreated}
          />
        </div>
      }
      left={
        <aside aria-label="المصدر" className="w-full shrink-0 lg:w-[260px]">
          <div className="space-y-3">{sourceFilter}</div>
        </aside>
      }
    />
  );
}
