"use client";

import { AlertTriangle, CalendarClock, CalendarX } from "lucide-react";

import { KpiToggle, type KpiMeta } from "@/components/admin/kpi-toggle";
import { formatCount } from "../helpers/format-count";
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
];

export function SignalCards({
  summary,
  active,
  onPick,
}: {
  summary: LeadsSummary;
  active: DueFilter;
  onPick: (f: DueFilter) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
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

    </div>
  );
}
