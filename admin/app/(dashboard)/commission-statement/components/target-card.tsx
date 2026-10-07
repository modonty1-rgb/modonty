import Link from "next/link";
import { Target } from "lucide-react";

import { formatOrderMoney } from "@/lib/orders/format-order-money";

interface TargetCardProps {
  monthLabel: string;
  /** Null when no target is set for this month. */
  targetSarMinor: number | null;
  /** This month's sales before VAT, per currency, as sold. */
  sales: { currency: string; minor: number; sarMinor: number | null; perSar: number | null }[];
  fxOk: boolean;
  /** For the admin: where the target is set. Absent for the rep. */
  setHref?: string;
}

const CURRENCY_AR: Record<string, string> = { EGP: "جنيه", SAR: "ريال" };

/**
 * «تارجتك هالشهر» — in Saudi riyals, with every pound converted in plain sight (Khalid, 1 Oct 2026:
 * «في صفحة المندوب المفروض يكون في تحويل عملة واضحة قدامه»). Today's rate, said with its number,
 * so the rep can redo the sum himself.
 */
export function TargetCard({ monthLabel, targetSarMinor, sales, fxOk, setHref }: TargetCardProps) {
  const sar = (m: number) => formatOrderMoney(m, "SAR");
  const converted = sales.filter((s) => s.minor > 0);
  const achieved = converted.reduce((s, x) => s + (x.sarMinor ?? 0), 0);
  const missingRate = converted.some((x) => x.sarMinor === null);
  const ratio = targetSarMinor ? achieved / targetSarMinor : 0;
  const pctLabel = `${Math.round(ratio * 100).toLocaleString("ar-EG")}٪`;

  return (
    <section className="rounded-xl border bg-card px-5 py-4 shadow-sm" aria-label="التارجت">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Target className="size-4 text-primary" aria-hidden />
          تارجتك لشهر {monthLabel}
        </p>
        {targetSarMinor ? (
          <p className="text-2xl font-extrabold tabular-nums">{sar(targetSarMinor)}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            ما تحدّد تارجت بعد
            {setHref && (
              <Link href={setHref} className="ms-2 font-semibold text-primary hover:underline">
                حدّده من صفحة المندوب
              </Link>
            )}
          </p>
        )}
      </div>

      {targetSarMinor ? (
        <>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className={ratio >= 1 ? "h-full bg-emerald-600" : "h-full bg-primary"} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm">
            <span>
              حقّقت <b className="tabular-nums">{sar(achieved)}</b> <span className="text-muted-foreground">({pctLabel})</span>
            </span>
            <span className={ratio >= 1 ? "font-semibold text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}>
              {ratio >= 1 ? `تعدّيت التارجت بـ ${sar(achieved - targetSarMinor)}` : `باقي ${sar(targetSarMinor - achieved)}`}
            </span>
          </div>
        </>
      ) : null}

      {/* The conversion, line by line — what was sold, at what rate, into how many riyals. */}
      <ul className="mt-3 space-y-1 border-t pt-3 text-xs text-muted-foreground">
        {converted.length === 0 ? (
          <li>ما فيه مبيعات هالشهر لسه.</li>
        ) : (
          converted.map((s) => (
            <li key={s.currency} className="tabular-nums">
              مبيعاتك بال{CURRENCY_AR[s.currency] ?? s.currency}: <b className="text-foreground">{formatOrderMoney(s.minor, s.currency)}</b>
              {s.currency === "SAR" ? null : s.sarMinor === null ? (
                <span className="ms-1 text-amber-700 dark:text-amber-400">— ما قدرنا نجيب سعر الصرف اليوم</span>
              ) : (
                <>
                  {" "}— تساوي <b className="text-foreground">{sar(s.sarMinor)}</b>
                  <span className="ms-1">· سعر اليوم: الريال بـ {s.perSar?.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} {CURRENCY_AR[s.currency] ?? s.currency}</span>
                </>
              )}
            </li>
          ))
        )}
        <li>المبيعات قبل الضريبة، والطلب المسترد ما ينحسب.</li>
        {!fxOk && missingRate ? <li className="text-amber-700 dark:text-amber-400">الرقم ناقص لين يرجع سعر الصرف.</li> : null}
      </ul>
    </section>
  );
}
