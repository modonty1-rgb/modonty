"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";

import { LeadListCard } from "./lead-list-card";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCount } from "../helpers/format-count";
import type { SalesLeadRow } from "../helpers/get-sales-leads";

/**
 * الترتيب — كان في رؤوس الجدول، والبطاقات لا رؤوس لها.
 *
 * فقدُه خسارةٌ حقيقية لا تفصيل: «مَن أطول صمتاً» هو السؤال الذي تُفتح الشاشة لأجله، وكان
 * يُجاب بضغطةٍ على رأس العمود. فصار ضابطاً صريحاً — وأوّل خياره هو الافتراضيّ، لأن الترتيب
 * بالأحدث يدفن مَن نُسي منذ شهرين في القاع.
 */
const SORTS = [
  {
    key: "silent" as const,
    label: "الأطول صمتاً",
    fn: (a: SalesLeadRow, b: SalesLeadRow) => a.lastTouchAt.getTime() - b.lastTouchAt.getTime(),
  },
  {
    key: "due" as const,
    label: "الأقرب موعداً",
    // الفارغ آخر القائمة: صفٌّ بلا موعد ليس «أقرب موعد»، وتصدّره يدفن ما له موعد فعلاً.
    fn: (a: SalesLeadRow, b: SalesLeadRow) =>
      (a.nextActionAt ? a.nextActionAt.getTime() : Number.MAX_SAFE_INTEGER) -
      (b.nextActionAt ? b.nextActionAt.getTime() : Number.MAX_SAFE_INTEGER),
  },
  {
    key: "new" as const,
    label: "الأحدث تسجيلاً",
    fn: (a: SalesLeadRow, b: SalesLeadRow) => b.createdAt.getTime() - a.createdAt.getTime(),
  },
  {
    key: "value" as const,
    label: "الأعلى قيمة",
    fn: (a: SalesLeadRow, b: SalesLeadRow) => (b.dealTotal ?? 0) - (a.dealTotal ?? 0),
  },
];

/** سقفُ أوّل رسمة — والباقي بضغطة. مئة بطاقة دفعةً واحدة تُبطئ الصفحة ولا تُقرأ. */
const PAGE = 20;

export function LeadsList({
  rows,
  /** فارغٌ بسبب الترشيح لا بسبب القاعدة — والفرق يغيّر نصّ الحالة الفارغة كلّه. */
  emptyBecauseFiltered = false,
  /** معرّف عميلٍ سُجِّل للتوّ — يُثبَّت أوّلاً ويُعلَّم مهما كان الترتيب. */
  highlightId,
}: {
  rows: SalesLeadRow[];
  emptyBecauseFiltered?: boolean;
  highlightId?: string | null;
}) {
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("silent");
  const [limit, setLimit] = useState(PAGE);

  /**
   * الجديد يتصدّر مهما كان الترتيب.
   *
   * الترتيب الافتراضي «الأطول صمتاً» يضع مَن سُجِّل للتوّ في القاع (صمته صفر)، والسقف عشرون —
   * فتُحفظ البطاقة ولا تُرى. مقيس: العدّاد ٢٠ ← ٢١ والبطاقة غير موجودة في الشاشة.
   */
  const sorted = useMemo(() => {
    const s = SORTS.find((x) => x.key === sort) ?? SORTS[0];
    const out = [...rows].sort(s.fn);
    if (!highlightId) return out;
    const i = out.findIndex((r) => r.id === highlightId);
    if (i > 0) out.unshift(out.splice(i, 1)[0]);
    return out;
  }, [rows, sort, highlightId]);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <Users className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium">
          {emptyBecauseFiltered ? "لا أحد هنا" : "لا يوجد عملاء بعد"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {emptyBecauseFiltered ? "امسح الترشيح أو جرّب مرحلة أخرى." : "أضف أول عميل وابدأ."}
        </p>
      </div>
    );
  }

  const shown = sorted.slice(0, limit);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-muted-foreground">رتّب:</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSort(s.key)}
            aria-pressed={sort === s.key}
            className={cn(
              "rounded-full px-2 py-0.5 transition-colors",
              "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              sort === s.key
                ? "bg-foreground font-medium text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* قائمةٌ لا شبكة: البطاقة تعيش في عمودٍ واحد كي تبقى صالحةً حين تُوضع في عمودٍ ضيّق. */}
      <ul className="space-y-2">
        {shown.map((lead) => (
          <li key={lead.id}>
            <LeadListCard lead={lead} highlight={lead.id === highlightId} />
          </li>
        ))}
      </ul>

      {/* السقف يُقال حين يُبلَغ — البتر الصامت يُقرأ «هذا كل ما عندنا». */}
      {sorted.length > shown.length && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => setLimit((n) => n + PAGE)}
        >
          اعرض المزيد — باقٍ {formatCount(sorted.length - shown.length)}
        </Button>
      )}
    </div>
  );
}
