import Link from "next/link";
import { BadgeCheck, Plus } from "lucide-react";

import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { formatOrderMoney } from "@/lib/orders/format-order-money";
import { cn } from "@/lib/utils";

import { DeletePayoutButton } from "./components/delete-payout-button";
import { CommissionMonthsTable } from "./components/commission-months-table";
import { getSalesCommissions } from "@/lib/commissions/get-sales-commissions";

export const metadata = { title: "عمولات المناديب" };
export const dynamic = "force-dynamic";

const COUNTRY: Record<string, string> = { EGP: "مصر", SAR: "السعودية" };
const LOCALE: Record<string, string> = { EGP: "ar-EG", SAR: "ar-SA" };
const pct = (bp: number) => `${(bp / 100).toLocaleString("ar-EG", { maximumFractionDigits: 2 })}٪`;
const day = (d: Date) => d.toISOString().slice(0, 10);

/**
 * **عمولات المناديب** — pick a rep, see his orders whose commission is still unpaid, tick them,
 * pay (Khalid, 30 Sep 2026: «أختار المندوب يجيني جدول فيه كل الأوردرات اللي لسه ما انصرفت
 * عمولاتها، أعمل سيلكت وبعد كده أسوّي صرف»). ADMIN only.
 *
 * Nothing here is stored as money except the payouts: each deal is read from its order and priced
 * with the rep's rate in force that day; a payout keeps the orders it settled at their amount on
 * the day it was made.
 */
export default async function SalesCommissionsPage({ searchParams }: { searchParams: Promise<{ rep?: string; cur?: string }> }) {
  const gate = await checkFinanceAdmin();
  if (gate.status !== "ok") {
    return (
      <p dir="rtl" className="px-5 py-10 text-sm text-muted-foreground">
        هذه الصفحة لمدير النظام فقط.
      </p>
    );
  }

  const { rep: repParam, cur: curParam } = await searchParams;
  const reps = (await getSalesCommissions()).filter((r) => r.deals.length > 0 || r.payouts.length > 0 || r.isActive);
  const owedByCurrency = ["EGP", "SAR"]
    .map((c) => ({ c, minor: reps.reduce((s, r) => s + (r.totals.find((t) => t.currency === c)?.owedMinor ?? 0), 0), any: reps.some((r) => r.totals.some((t) => t.currency === c)) }))
    .filter((o) => o.any);

  const selected = reps.find((r) => r.id === repParam) ?? null;
  const currencies = selected ? selected.totals.map((t) => t.currency) : [];
  const currency = selected ? (currencies.includes(curParam ?? "") ? curParam! : (selected.totals.find((t) => t.owedMinor !== 0)?.currency ?? currencies[0])) : null;
  const tot = selected && currency ? selected.totals.find((t) => t.currency === currency) ?? null : null;
  const money = (m: number) => formatOrderMoney(m, currency ?? "SAR");
  // The day each order's commission went out — the latest payout that paid it (a clawback item is negative).
  const paidOnByOrder = new Map<string, string>();
  for (const p of selected?.payouts ?? []) for (const it of p.items) if (it.commissionMinor > 0 && !paidOnByOrder.has(it.orderId)) paidOnByOrder.set(it.orderId, day(p.paidOn));
  // His payouts in this currency by the month they went out — newest month first, as they arrive.
  const paidMonths: { key: string; label: string; totalMinor: number; payouts: NonNullable<typeof selected>["payouts"] }[] = [];
  for (const p of selected && currency ? selected.payouts.filter((x) => x.currency === currency) : []) {
    const key = day(p.paidOn).slice(0, 7);
    let m = paidMonths.find((x) => x.key === key);
    if (!m) {
      m = { key, label: new Date(`${key}-01T00:00:00Z`).toLocaleDateString("ar-EG", { month: "long", year: "numeric", timeZone: "UTC" }), totalMinor: 0, payouts: [] };
      paidMonths.push(m);
    }
    m.payouts.push(p);
    m.totalMinor += p.amountMinor;
  }

  return (
    <div dir="rtl" className="mx-auto max-w-5xl space-y-5 px-4 pb-8 sm:px-5">
      <header className="pt-1">
        <h1 className="text-xl font-semibold">عمولات المناديب</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">اختر المندوب، حدّد الطلبات اللي تبغى تصرف عمولتها، واضغط «اصرف المحدد».</p>
      </header>

      {owedByCurrency.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-2" aria-label="الباقي للمناديب">
          {owedByCurrency.map((o) => (
            <div key={o.c} className="rounded-xl border bg-card px-5 py-4 shadow-sm">
              <p className="text-sm text-muted-foreground">{o.minor < 0 ? "خصم ينتظر الصرف القادم" : "لسه ما انصرف"} — {COUNTRY[o.c]}</p>
              <p className={cn("mt-1 text-3xl font-bold tabular-nums", o.minor < 0 && "text-rose-600")}>{formatOrderMoney(o.minor, o.c)}</p>
            </div>
          ))}
        </section>
      )}

      {/* ① the reps */}
      <section aria-label="المناديب" className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">١ · اختر المندوب</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {reps.map((r) => {
            const active = selected?.id === r.id;
            const owed = r.totals.filter((t) => t.owedMinor !== 0);
            return (
              <Link
                key={r.id}
                href={`/sales-commissions?rep=${r.id}`}
                scroll={false}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "rounded-xl border bg-card px-4 py-3 shadow-sm transition-colors hover:border-primary/50",
                  active && "border-primary ring-2 ring-primary/30",
                )}
              >
                <p className="font-medium text-foreground">
                  {r.name}
                  {!r.isActive && <span className="ms-2 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">غير نشط</span>}
                </p>
                <p className="mt-1 text-sm tabular-nums">
                  {owed.length ? (
                    owed.map((t) => (
                      <span key={t.currency} className={cn("me-3 font-semibold", t.owedMinor < 0 ? "text-rose-600" : "text-emerald-700")} title={t.owedMinor < 0 ? "خصم ينتظر الصرف القادم" : undefined}>
                        {formatOrderMoney(t.owedMinor, t.currency)}
                      </span>
                    ))
                  ) : r.currentRate ? (
                    <span className="text-muted-foreground">ما عليه شي</span>
                  ) : null}
                </p>
                {!r.currentRate && <p className="mt-1 text-xs font-medium text-amber-700">لا نسبة — حدّدها من ملف الموظف</p>}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ② his unpaid orders */}
      {selected && currency && tot && (
        <section aria-label="طلبات لم تُصرف عمولتها" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground">٢ · عمولاته شهر بشهر — حدّد الباقي واصرف — {selected.name}</h2>
              <p className="text-xs text-muted-foreground">
                {selected.currentRate
                  ? `النسبة: جديد ${pct(selected.currentRate.newRateBp)} · تجديد ${pct(selected.currentRate.renewalRateBp)} — على المبلغ قبل الضريبة`
                  : "لا نسبة محدّدة — عمولته صفر حتى تحدّدها من ملف الموظف"}
              </p>
            </div>
            {currencies.length > 1 && (
              <nav className="inline-flex rounded-lg border bg-card p-0.5" aria-label="العملة">
                {currencies.map((c) => (
                  <Link
                    key={c}
                    href={`/sales-commissions?rep=${selected.id}&cur=${c}`}
                    scroll={false}
                    className={cn("rounded-md px-3 py-1.5 text-sm font-medium", c === currency ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
                  >
                    {COUNTRY[c] ?? c}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          <CommissionMonthsTable
            key={`${selected.id}-${currency}-${selected.deals.map((d) => d.orderId + d.state).join()}`}
            staffId={selected.id}
            staffName={selected.name}
            currency={currency}
            format={{ locale: LOCALE[currency] ?? "ar-SA", currency }}
            rows={selected.deals
              .filter((d) => d.currency === currency && (d.state !== "none" || d.commissionMinor > 0 || d.refunded))
              .sort((a, b) => a.soldOn.getTime() - b.soldOn.getTime())
              .map((d) => {
                // Same money as the statement's ledger line: settled → the paid-out snapshot;
                // unpaid → today's figure; refunded → nothing earned. Left = earned − paid.
                const earnedMinor = d.refunded ? 0 : d.state === "settled" ? d.paidMinor : d.commissionMinor;
                return {
                  orderId: d.orderId,
                  number: d.number,
                  clientName: d.clientName,
                  soldOn: day(d.soldOn),
                  kind: d.kind,
                  basis: d.refunded ? null : `${money(d.baseMinor)} × ${d.rateBp === null ? "بلا نسبة" : pct(d.rateBp)}`,
                  earnedMinor,
                  paidMinor: d.paidMinor,
                  leftMinor: earnedMinor - d.paidMinor,
                  paidOn: paidOnByOrder.get(d.orderId) ?? null,
                  refunded: d.refunded,
                };
              })}
          />

          {/* ③ what was paid to him — month by month (Khalid, 1 Oct 2026: «أعرف كل شهر كم انصرف»).
              Visible, not folded: «how much went out in September» is the question, so the months
              are the answer on sight; each opens to its payouts. */}
          {/* Its own colour (Khalid, 1 Oct 2026: «ما تم صرفه… لون مختلف عشان ما أتلخبط»): money that
              already left — green, apart from the table above, which is what is still to pay. */}
          <section className="overflow-hidden rounded-xl border-2 border-emerald-300 bg-emerald-50/40 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/20" aria-label="ما انصرف له">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 bg-emerald-100/70 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-900/30">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-emerald-800 dark:text-emerald-300">
                  <BadgeCheck className="size-5" aria-hidden />
                  ما تم صرفه — {COUNTRY[currency]}
                </h3>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">فلوس حوّلتها له فعلاً، كل تحويل بتاريخه. مجموعها = عمود «انصرف» في الجدول فوق.</p>
              </div>
              <span className="text-sm text-emerald-800 dark:text-emerald-300">
                الإجمالي <b className="text-lg tabular-nums">{money(tot.paidOutMinor)}</b>
              </span>
            </div>
            {paidMonths.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground">لم يُصرف له شيء بهذه العملة بعد.</p>
            ) : (
              paidMonths.map((m) => (
                <details key={m.key} name="paid-month" className="group border-b border-emerald-200 last:border-0 dark:border-emerald-900">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-2.5 text-sm hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 [&::-webkit-details-marker]:hidden">
                    <span className="grid size-5 place-items-center rounded border text-muted-foreground transition-transform group-open:rotate-45">
                      <Plus className="size-3.5" aria-hidden />
                    </span>
                    <span className="w-32 font-semibold">{m.label}</span>
                    <span className="flex-1 text-xs text-muted-foreground">{m.payouts.length.toLocaleString("ar-EG")} دفعة</span>
                    <b className="tabular-nums">{money(m.totalMinor)}</b>
                  </summary>
                  <ul className="mx-4 mb-3 divide-y rounded-lg border bg-background/70 shadow-sm">
                    {m.payouts.map((p) => (
                      <li key={p.id} className="flex items-start justify-between gap-3 px-4 py-2.5 text-sm">
                        <div className="min-w-0">
                          <p>
                            <b className="tabular-nums">{money(p.amountMinor)}</b>
                            <span className="ms-2 text-muted-foreground">{day(p.paidOn)}</span>
                            {p.note && <span className="ms-2 text-muted-foreground">· {p.note}</span>}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground" dir="ltr">
                            {p.items.length ? p.items.map((i) => `${i.orderNumber}${i.commissionMinor < 0 ? " (خصم)" : ""}`).join(" · ") : "—"}
                          </p>
                        </div>
                        <DeletePayoutButton payoutId={p.id} label={`${money(p.amountMinor)} (${day(p.paidOn)})`} />
                      </li>
                    ))}
                  </ul>
                </details>
              ))
            )}
          </section>
        </section>
      )}
    </div>
  );
}
