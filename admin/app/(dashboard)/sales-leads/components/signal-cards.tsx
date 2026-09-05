"use client";

import { AlertTriangle, CalendarClock, CalendarX, MessageSquareOff, Wallet } from "lucide-react";

import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { formatCount } from "../helpers/format-count";
import { formatMoney } from "../helpers/funnel";
import type { LeadsSummary } from "../helpers/summarize-leads";

/** مرشّح الموعد — قيمةٌ واحدة تحكم الجدول، فلا يتنازع مرشّحان على نفس الصفوف. */
export type DueFilter = "all" | "overdue" | "today" | "noDate" | "silent";

/**
 * أربع بطاقات بمقاس واحد وهيكل واحد — **معيار كيانات الأدمن #٤**.
 *
 * كانت مبنيّةً بيدي بارتفاع `98` ثم `63`، وبشكلٍ ثالثٍ للفانل تحتها، فصار في الصفحة لغتان
 * بصريتان. والمعيار عنده الجواب من ٢٦ يوليو: صفٌّ أفقيّ — مربّع أيقونة `24×24` ملوّن دلالياً،
 * ثم الرقم `text-base font-bold`، ثم وصفه `11px` بجانبه. نفس ما يراه خالد في «الحسابات».
 *
 * والألوان من أعراف المعيار #٣ لا من ذوقي: `red` حرج · `amber` تحذير · `slate` خامل ·
 * `muted` لا شيء. والصيغة `bg-<tone>-500/15 text-<tone>-600 dark:text-<tone>-400`.
 */
const SIGNALS = [
  {
    key: "overdue" as const,
    icon: AlertTriangle,
    meta: {
      label: "متأخّر",
      tone: "bg-red-500/15 text-red-600 dark:text-red-400",
      ring: "ring-red-500",
    } satisfies KpiMeta,
  },
  {
    key: "today" as const,
    icon: CalendarClock,
    meta: {
      label: "موعد اليوم",
      tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      ring: "ring-amber-500",
    } satisfies KpiMeta,
  },
  {
    key: "noDate" as const,
    icon: CalendarX,
    meta: {
      label: "بلا موعد",
      tone: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
      ring: "ring-orange-500",
    } satisfies KpiMeta,
  },
  {
    // مقيس: ١٧ من ٢٠ — أصدق رقمٍ عن صحّة الفانل، ولم يكن في الشاشة.
    key: "silent" as const,
    icon: MessageSquareOff,
    meta: {
      label: "ساكت ٣٠+ يوم",
      tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      ring: "ring-rose-500",
    } satisfies KpiMeta,
  },
];

/** الرابعة تُقرأ ولا تُضغط: لا يوجد «اعرض لي القيمة»، فلونها محايد بحسب أعراف المعيار. */
const VALUE_TONE = { tone: "bg-muted text-foreground", ring: "ring-foreground/40" };

export function SignalCards({
  summary,
  active,
  onPick,
}: {
  summary: LeadsSummary;
  active: DueFilter;
  onPick: (f: DueFilter) => void;
}) {
  const money = [formatMoney(summary.pipeline.SAR, "SAR"), formatMoney(summary.pipeline.EGP, "EGP")]
    .filter(Boolean)
    .join(" · ");

  return (
    // خمسٌ في صفٍّ واحد — مكانها صار رأس الصفحة بعرضها كلّه، لا رفّاً ضيّقاً.
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {SIGNALS.map((s) => {
        const n = summary[s.key];
        return (
          <KpiToggle
            key={s.key}
            meta={s.meta}
            icon={s.icon}
            value={formatCount(n)}
            active={active === s.key}
            // الصفر لا يُضغط: الترشيح عليه يعطي جدولاً فارغاً — طريقٌ مسدود يُدخَل ثم يُخرَج منه.
            disabled={n === 0}
            onClick={() => onPick(active === s.key ? "all" : s.key)}
          />
        );
      })}

      <KpiToggle
        meta={{ ...VALUE_TONE, label: `قيمة ${formatCount(summary.open)} صفقة مفتوحة` }}
        icon={Wallet}
        // العدد انتقل إلى التسمية، فـ«—» هنا لا يُقرأ «سالب عشرين» كما كان.
        value={money || <span className="text-muted-foreground">—</span>}
        active={false}
        disabled
        onClick={() => {}}
      />
    </div>
  );
}
