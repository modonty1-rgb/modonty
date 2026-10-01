import Link from "next/link";

import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { formatOrderMoney } from "@/lib/orders/format-order-money";
import { cn } from "@/lib/utils";

import { DeletePayoutButton } from "./components/delete-payout-button";
import { UnpaidOrdersTable } from "./components/unpaid-orders-table";
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
              <h2 className="text-sm font-semibold text-muted-foreground">٢ · حدّد الطلبات واصرف — {selected.name}</h2>
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

          <UnpaidOrdersTable
            key={`${selected.id}-${currency}-${selected.deals.map((d) => d.orderId + d.state).join()}`}
            staffId={selected.id}
            staffName={selected.name}
            currency={currency}
            format={{ locale: LOCALE[currency] ?? "ar-SA", currency }}
            rows={selected.deals
              .filter((d) => d.currency === currency && (d.state === "unpaid" || d.state === "clawback"))
              .sort((a, b) => a.soldOn.getTime() - b.soldOn.getTime())
              .map((d) => ({
                orderId: d.orderId,
                number: d.number,
                clientName: d.clientName,
                soldOn: day(d.soldOn),
                kind: d.kind,
                base: money(d.baseMinor),
                rate: d.rateBp === null ? "بلا نسبة" : pct(d.rateBp),
                amountMinor: d.state === "clawback" ? -d.clawbackMinor : d.commissionMinor,
                clawback: d.state === "clawback",
              }))}
          />

          {/* ③ what was paid to him */}
          <details className="group rounded-xl border bg-card shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium">
              <span>
                ما انصرف له — {COUNTRY[currency]} <span className="text-muted-foreground">({money(tot.paidOutMinor)})</span>
              </span>
              <span className="text-xs text-muted-foreground group-open:hidden">عرض</span>
            </summary>
            {selected.payouts.filter((p) => p.currency === currency).length === 0 ? (
              <p className="border-t px-4 py-3 text-xs text-muted-foreground">لم يُصرف له شيء بهذه العملة بعد.</p>
            ) : (
              <ul className="divide-y border-t">
                {selected.payouts
                  .filter((p) => p.currency === currency)
                  .map((p) => (
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
            )}
          </details>
        </section>
      )}
    </div>
  );
}
