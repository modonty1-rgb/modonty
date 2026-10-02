import { db } from "@/lib/db";
import { getFxRates, toSarMinor } from "@/lib/money/get-fx-rates";
import type { RepCommission } from "@/lib/commissions/get-sales-commissions";

export interface TargetSales {
  currency: string;
  /** Sold this month in that currency, before VAT, refunds out. */
  minor: number;
  /** The same in riyals at today's rate; null when the rate is missing. */
  sarMinor: number | null;
  /** How many units of this currency make one riyal today. */
  perSar: number | null;
}

export interface TargetProgress {
  repId: string;
  repName: string;
  /** Null when no target is in force for this month. */
  targetSarMinor: number | null;
  sales: TargetSales[];
  achievedSarMinor: number;
  /** A currency sold this month has no rate today, so `achievedSarMinor` is short. */
  missingRate: boolean;
  fxOk: boolean;
}

/** `YYYY-MM` in UTC — the month key the commission statement uses everywhere. */
const monthKeyOf =(d: Date) => d.toISOString().slice(0, 7);

/**
 * This month against the target, for each rep given — one source for the commission statement and
 * the orders page, so the two never show different percentages.
 *
 * The target is in riyals (Khalid, 1 Oct 2026), so every currency the rep sold in is converted at
 * today's rate. Same base as the commission: before VAT, refunded deals out. The target in force is
 * the latest one whose `effectiveFrom` has passed.
 */
export async function getTargetProgress(reps: RepCommission[], now: Date = new Date()): Promise<TargetProgress[]> {
  if (!reps.length) return [];
  const [targets, fx] = await Promise.all([
    db.salesTarget.findMany({
      where: { staffId: { in: reps.map((r) => r.id) }, effectiveFrom: { lte: now } },
      orderBy: [{ effectiveFrom: "desc" }, { createdAt: "desc" }],
      select: { staffId: true, monthlySarMinor: true },
    }),
    getFxRates(),
  ]);
  // Newest first, so the first row seen per rep is the one in force.
  const targetOf = new Map<string, number>();
  for (const t of targets) if (!targetOf.has(t.staffId)) targetOf.set(t.staffId, t.monthlySarMinor);

  const month = monthKeyOf(now);
  return reps.map((rep) => {
    const sales: TargetSales[] = [...new Set(rep.deals.map((d) => d.currency))].map((currency) => {
      const minor = rep.deals
        .filter((d) => d.currency === currency && !d.refunded && monthKeyOf(d.soldOn) === month)
        .reduce((sum, d) => sum + d.baseMinor, 0);
      return {
        currency,
        minor,
        sarMinor: toSarMinor(minor, currency, fx),
        perSar: currency === "SAR" ? 1 : fx.perSar[currency] ?? null,
      };
    });
    const sold = sales.filter((s) => s.minor > 0);
    return {
      repId: rep.id,
      repName: rep.name,
      targetSarMinor: targetOf.get(rep.id) ?? null,
      sales,
      achievedSarMinor: sold.reduce((sum, s) => sum + (s.sarMinor ?? 0), 0),
      missingRate: sold.some((s) => s.sarMinor === null),
      fxOk: fx.ok,
    };
  });
}
