import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { checkSalesDesk } from "@/lib/require-sales-desk";
import { getSalesCommissions, type RepCommission } from "@/lib/commissions/get-sales-commissions";
import { formatOrderMoney } from "@/lib/orders/format-order-money";

export const dynamic = "force-dynamic";

const COUNTRY: Record<string, string> = { EGP: "مصر", SAR: "السعودية" };
const day = (d: Date) => d.toISOString().slice(0, 10);
const pct = (bp: number | null) => (bp === null ? "—" : `${(bp / 100).toLocaleString("ar-EG")}٪`);

interface Line {
  at: Date;
  label: string;
  detail: string;
  href?: string;
  credit: number;
  debit: number;
}

/**
 * The rep's commission ledger (Khalid, 1 Oct 2026: «كشف حساب… الأدمن يقدر يشوف كل حاجة ولكن كل موظف
 * يشوف بس كشف حسابه»). Every line comes from `getSalesCommissions` — the same source as the payout
 * page and the order faces — so the balance here is the «لسه ما انصرف» there.
 *
 * - each deal credits what it earned: the paid-out snapshot once settled, today's figure while
 *   unpaid, nothing once refunded (its commission falls away);
 * - each payout debits its amount — a clawback inside a payout already lowers that amount.
 * So the running balance ends on `owedMinor`: unpaid − clawback.
 */
function ledger(rep: RepCommission, currency: string): Line[] {
  const lines: Line[] = [
    ...rep.deals
      .filter((d) => d.currency === currency)
      .map((d) => ({
        at: d.soldOn,
        label: `${d.number} — ${d.kind === "new" ? "جديد" : "تجديد"}`,
        detail: d.refunded
          ? `${d.clientName} · مسترد — سقطت العمولة`
          : `${d.clientName} · ${formatOrderMoney(d.baseMinor, currency)} قبل الضريبة × ${pct(d.rateBp)}`,
        href: `/orders/${d.orderId}`,
        credit: d.refunded ? 0 : d.state === "settled" ? d.paidMinor : d.commissionMinor,
        debit: 0,
      })),
    ...rep.payouts
      .filter((p) => p.currency === currency)
      .map((p) => ({
        at: p.paidOn,
        label: "صرف",
        detail: `${p.items.length} طلب${p.note ? ` · ${p.note}` : ""}`,
        credit: 0,
        debit: p.amountMinor,
      })),
  ];
  // By day; within a day the orders first, then the payout that settled them (a payout's date is
  // typed without a time, so by the clock it would land before the orders it paid).
  return lines.sort((a, b) => day(a.at).localeCompare(day(b.at)) || Number(b.credit > 0) - Number(a.credit > 0) || a.at.getTime() - b.at.getTime());
}

export default async function CommissionStatementPage({ searchParams }: { searchParams: Promise<{ rep?: string; cur?: string }> }) {
  const desk = await checkSalesDesk();
  if (desk.status === "unauthenticated") redirect("/login");
  if (desk.status !== "ok") {
    return <p dir="rtl" className="px-5 py-10 text-sm text-muted-foreground">هذه الصفحة للمبيعات والأدمن.</p>;
  }
  const isAdmin = (await checkFinanceAdmin()).status === "ok";
  const viewerId = ((await auth())?.user as { id?: string } | undefined)?.id;

  const { rep: repParam, cur: curParam } = await searchParams;
  const all = await getSalesCommissions();
  // A rep sees his own statement whatever the URL says; the admin picks.
  const reps = isAdmin ? all.filter((r) => r.deals.length > 0 || r.payouts.length > 0 || r.isActive) : all.filter((r) => r.id === viewerId);
  const rep = isAdmin ? reps.find((r) => r.id === repParam) ?? reps[0] : reps[0];

  const currencies = rep ? rep.totals.map((t) => t.currency) : [];
  const currency = currencies.includes(curParam ?? "") ? curParam! : currencies[0];
  const tot = rep && currency ? rep.totals.find((t) => t.currency === currency) : undefined;
  const money = (m: number) => formatOrderMoney(m, currency ?? "SAR");
  const lines = rep && currency ? ledger(rep, currency) : [];
  let running = 0;
  const rows = lines.map((l) => ({ ...l, balance: (running += l.credit - l.debit) }));
  const earned = lines.reduce((s, l) => s + l.credit, 0);
  const inCur = rep ? rep.deals.filter((d) => d.currency === currency) : [];
  const href = (q: Record<string, string>) => `/commission-statement?${new URLSearchParams({ ...(isAdmin && rep ? { rep: rep.id } : {}), ...(currency ? { cur: currency } : {}), ...q })}`;

  return (
    <div dir="rtl" className="mx-auto max-w-5xl space-y-5 px-4 pb-8 sm:px-5">
      <header className="pt-1">
        <h1 className="text-xl font-semibold">كشف حساب العمولات{rep ? ` — ${rep.name}` : ""}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {isAdmin ? "اختر المندوب لترى كشفه." : "كشف عمولاتك: ما استحققته، وما انصرف لك، والباقي."}
          {rep?.currentRate && ` النسبة الحالية: جديد ${pct(rep.currentRate.newRateBp)} · تجديد ${pct(rep.currentRate.renewalRateBp)} — على المبلغ قبل الضريبة.`}
        </p>
      </header>

      {isAdmin && reps.length > 1 && (
        <nav className="flex flex-wrap gap-2" aria-label="المندوب">
          {reps.map((r) => (
            <Link
              key={r.id}
              href={`/commission-statement?rep=${r.id}`}
              className={cn("rounded-full border px-3 py-1 text-xs font-semibold", r.id === rep?.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}
            >
              {r.name}
            </Link>
          ))}
        </nav>
      )}

      {!rep ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">ما في عمولات مسجّلة لك بعد.</p>
      ) : (
        <>
          {currencies.length > 1 && (
            <nav className="flex gap-2" aria-label="العملة">
              {currencies.map((c) => (
                <Link key={c} href={href({ cur: c })} className={cn("rounded-md border px-3 py-1 text-xs font-semibold", c === currency ? "border-primary text-primary" : "text-muted-foreground hover:text-foreground")}>
                  {COUNTRY[c] ?? c}
                </Link>
              ))}
            </nav>
          )}

          {tot && (
            <section className="grid gap-3 sm:grid-cols-3" aria-label="الملخّص">
              <Card
                label="استحققت"
                value={money(earned)}
                hint={`${inCur.filter((d) => d.kind === "new" && !d.refunded).length} جديد · ${inCur.filter((d) => d.kind === "renewal" && !d.refunded).length} تجديد`}
              />
              <Card label="انصرف لك" value={money(tot.paidOutMinor)} hint={`${rep.payouts.filter((p) => p.currency === currency).length} صرفية`} />
              <Card label="الباقي لك" value={money(tot.owedMinor)} hint={tot.clawbackMinor ? `بعد خصم ${money(tot.clawbackMinor)} مستردّة` : "لسه ما انصرف"} strong />
            </section>
          )}

          <section className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-start font-semibold">التاريخ</th>
                  <th className="px-3 py-2 text-start font-semibold">البيان</th>
                  <th className="px-3 py-2 text-end font-semibold">له</th>
                  <th className="px-3 py-2 text-end font-semibold">انصرف</th>
                  <th className="px-3 py-2 text-end font-semibold">الرصيد</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">لا حركة بعد.</td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums text-muted-foreground" dir="ltr">{day(r.at)}</td>
                      <td className="px-3 py-2">
                        {r.href ? <Link href={r.href} className="font-medium hover:underline">{r.label}</Link> : <span className="font-semibold">{r.label}</span>}
                        <span className="block text-xs text-muted-foreground">{r.detail}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-end tabular-nums text-emerald-700 dark:text-emerald-400">{r.credit ? money(r.credit) : "—"}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-end tabular-nums text-rose-700 dark:text-rose-400">{r.debit ? money(r.debit) : "—"}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-end font-semibold tabular-nums">{money(r.balance)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

function Card({ label, value, hint, strong }: { label: string; value: string; hint: string; strong?: boolean }) {
  return (
    <div className={cn("rounded-xl border bg-card px-5 py-4 shadow-sm", strong && "border-primary/40")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-extrabold tabular-nums", strong && "text-primary")}>{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
