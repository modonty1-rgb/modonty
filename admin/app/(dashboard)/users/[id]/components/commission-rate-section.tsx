import { HandCoins } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { RateDialog } from "./rate-dialog";

const pct = (bp: number) => `${(bp / 100).toLocaleString("ar-EG", { maximumFractionDigits: 2 })}٪`;
const day = (d: Date) => d.toISOString().slice(0, 10);

/**
 * «عمولة المندوب» on a SALES staff member's page — where his rate is set (Khalid, 30 Sep 2026:
 * «النسب المفروض تكون في الستاف السيلز»). The rate history is kept whole: each change starts
 * from its own date, and deals before it keep the rate they were sold under.
 */
export function CommissionRateSection({
  staffId,
  staffName,
  rates,
}: {
  staffId: string;
  staffName: string;
  /** Oldest first. */
  rates: { id: string; newRateBp: number; renewalRateBp: number; effectiveFrom: Date }[];
}) {
  const now = new Date();
  let current = rates[0] ?? null;
  for (const r of rates) if (r.effectiveFrom <= now) current = r;
  const upcoming = rates.filter((r) => r.effectiveFrom > now);

  return (
    <Card dir="rtl" className="mt-4 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-base font-semibold text-foreground">
              <HandCoins className="size-4 text-muted-foreground" aria-hidden />
              عمولة المندوب
            </p>
            <p className="mt-1 text-sm text-foreground">
              {current
                ? `الصفقة الجديدة ${pct(current.newRateBp)} · التجديد ${pct(current.renewalRateBp)}`
                : "لا نسبة محدّدة — عمولته صفر حتى تحدّدها"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              على المبلغ قبل الضريبة من طلباته المدفوعة · تغيير النسبة يسري من تاريخه ولا يمسّ ما قبله.
            </p>
          </div>
          <RateDialog
            staffId={staffId}
            staffName={staffName}
            current={current ? { newRate: current.newRateBp / 100, renewalRate: current.renewalRateBp / 100 } : null}
          />
        </div>

        {upcoming.length > 0 && (
          <p className="text-xs text-amber-700">
            قادمة: {upcoming.map((r) => `من ${day(r.effectiveFrom)} جديد ${pct(r.newRateBp)} · تجديد ${pct(r.renewalRateBp)}`).join(" ← ")}
          </p>
        )}

        {rates.length > 0 && (
          <ul className="divide-y rounded-lg border text-xs">
            {[...rates].reverse().map((r) => (
              <li key={r.id} className="flex justify-between gap-2 px-3 py-1.5">
                <span className="text-muted-foreground">من {day(r.effectiveFrom)}</span>
                <span className="tabular-nums text-foreground">
                  جديد {pct(r.newRateBp)} · تجديد {pct(r.renewalRateBp)}
                </span>
              </li>
            ))}
          </ul>
        )}

      </CardContent>
    </Card>
  );
}
