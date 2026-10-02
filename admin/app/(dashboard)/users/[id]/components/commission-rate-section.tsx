import Link from "next/link";
import { ArrowLeft, HandCoins, Target } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { formatOrderMoney } from "@/lib/orders/format-order-money";

import { RateDialog } from "./rate-dialog";
import { TargetDialog } from "./target-dialog";

const pct = (bp: number) => `${(bp / 100).toLocaleString("ar-EG", { maximumFractionDigits: 2 })}٪`;
const day = (d: Date) => d.toISOString().slice(0, 10);

/**
 * The rep's sales terms on his staff page — **first on the page, two cards side by side**
 * (Khalid, 1 Oct 2026: «رتّب لي صفحة المندوبة»). They sat at the bottom under the password field;
 * on a rep's page they are the reason the admin opens it, so they lead and the account form follows.
 *
 * - «نسبة العمولة» — set here (Khalid, 30 Sep 2026: «النسب المفروض تكون في الستاف السيلز»). The
 *   history is kept whole: each change starts from its own date; deals before it keep their rate.
 * - «التارجت الشهري» — in riyals, before VAT; shown to the rep in his statement.
 */
export function CommissionRateSection({
  staffId,
  staffName,
  rates,
  target,
}: {
  staffId: string;
  staffName: string;
  /** Oldest first. */
  rates: { id: string; newRateBp: number; renewalRateBp: number; effectiveFrom: Date }[];
  /** The target in force this month — null when none is set. */
  target: { monthlySarMinor: number } | null;
}) {
  const now = new Date();
  let current = rates[0] ?? null;
  for (const r of rates) if (r.effectiveFrom <= now) current = r;
  const upcoming = rates.filter((r) => r.effectiveFrom > now);

  return (
    <section dir="rtl" className="mb-6 space-y-3" aria-label="المبيعات">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">المبيعات — {staffName}</h2>
        <Link href={`/commission-statement?rep=${staffId}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          كشف حسابه
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardContent className="flex h-full flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <HandCoins className="size-4" aria-hidden />
                نسبة العمولة
              </p>
              <RateDialog
                staffId={staffId}
                staffName={staffName}
                current={current ? { newRate: current.newRateBp / 100, renewalRate: current.renewalRateBp / 100 } : null}
              />
            </div>
            {current ? (
              <div className="flex gap-6">
                <p>
                  <span className="block text-2xl font-extrabold tabular-nums">{pct(current.newRateBp)}</span>
                  <span className="text-xs text-muted-foreground">عميل جديد</span>
                </p>
                <p>
                  <span className="block text-2xl font-extrabold tabular-nums">{pct(current.renewalRateBp)}</span>
                  <span className="text-xs text-muted-foreground">تجديد</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">ما تحدّدت نسبة — عمولته صفر لين تحدّدها.</p>
            )}
            <p className="text-xs text-muted-foreground">من المبلغ قبل الضريبة. التغيير يبدأ من تاريخه ولا يمسّ اللي قبله.</p>
            {upcoming.length > 0 && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                قادمة: {upcoming.map((r) => `من ${day(r.effectiveFrom)} جديد ${pct(r.newRateBp)} · تجديد ${pct(r.renewalRateBp)}`).join(" ← ")}
              </p>
            )}
            {rates.length > 1 && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">النسب السابقة ({rates.length.toLocaleString("ar-EG")})</summary>
                <ul className="mt-2 divide-y rounded-lg border">
                  {[...rates].reverse().map((r) => (
                    <li key={r.id} className="flex justify-between gap-2 px-3 py-1.5">
                      <span className="text-muted-foreground" dir="ltr">من {day(r.effectiveFrom)}</span>
                      <span className="tabular-nums">جديد {pct(r.newRateBp)} · تجديد {pct(r.renewalRateBp)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="flex h-full flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Target className="size-4" aria-hidden />
                التارجت الشهري
              </p>
              <TargetDialog staffId={staffId} staffName={staffName} current={target ? { amount: target.monthlySarMinor / 100 } : null} />
            </div>
            {target ? (
              <p className="text-2xl font-extrabold tabular-nums">{formatOrderMoney(target.monthlySarMinor, "SAR")}</p>
            ) : (
              <p className="text-sm text-muted-foreground">ما تحدّد تارجت بعد.</p>
            )}
            <p className="text-xs text-muted-foreground">بالريال، مبيعات قبل الضريبة. يشوفه في كشف حسابه مع مبيعاته بالجنيه محوّلة بسعر اليوم.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
