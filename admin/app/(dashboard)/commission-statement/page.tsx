import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { checkSalesDesk } from "@/lib/require-sales-desk";
import { getSalesCommissions, type RepCommission } from "@/lib/commissions/get-sales-commissions";
import { formatOrderMoney } from "@/lib/orders/format-order-money";

import { getTargetProgress } from "@/lib/commissions/get-target-progress";

import { MonthlySalesChart } from "./components/monthly-sales-chart";
import { TargetCard } from "./components/target-card";

export const dynamic = "force-dynamic";

const COUNTRY: Record<string, string> = { EGP: "مصر", SAR: "السعودية" };
const UNIT: Record<string, string> = { EGP: "ج.م", SAR: "ر.س" };
const day = (d: Date) => d.toISOString().slice(0, 10);
const monthOf = (d: Date) => d.toISOString().slice(0, 7);
const count = (n: number) => n.toLocaleString("ar-EG");
/** One grid for the header, the month rows and the empty months — the columns line up. */
const GRID = "grid grid-cols-[2rem_8rem_8rem_1fr_1fr_1fr_1fr] items-center gap-3 px-3";
const monthName = (key: string) => new Date(`${key}-01T00:00:00Z`).toLocaleDateString("ar-EG", { month: "long", year: "numeric", timeZone: "UTC" });
/** What a deal credits the rep — the same rule as the ledger line. */
const creditOf = (d: RepCommission["deals"][number]) => (d.refunded ? 0 : d.state === "settled" ? d.paidMinor : d.commissionMinor);

interface MonthStat {
  key: string;
  newCount: number;
  renewalCount: number;
  salesMinor: number;
  commissionMinor: number;
  paidOutMinor: number;
}

/**
 * Month by month (Khalid, 1 Oct 2026: «كل شهر كم المندوب عمل مبيعات وكم عمولته… الشهر اللي زاد
 * فيه والشهر اللي قل فيه»). Every month from his first deal to this one — an empty month is a
 * zero, not a gap, or the curve would skip the very dip it is there to show. A refunded deal is
 * not a sale and earns nothing, as in the ledger.
 */
function months(rep: RepCommission, currency: string): MonthStat[] {
  const deals = rep.deals.filter((d) => d.currency === currency);
  const payouts = rep.payouts.filter((p) => p.currency === currency);
  const keys = [...deals.map((d) => monthOf(d.soldOn)), ...payouts.map((p) => monthOf(p.paidOn))].sort();
  if (keys.length === 0) return [];
  const out: MonthStat[] = [];
  const last = [keys[keys.length - 1], monthOf(new Date())].sort()[1];
  for (let k = keys[0]; k <= last; ) {
    const inMonth = deals.filter((d) => monthOf(d.soldOn) === k && !d.refunded);
    out.push({
      key: k,
      newCount: inMonth.filter((d) => d.kind === "new").length,
      renewalCount: inMonth.filter((d) => d.kind === "renewal").length,
      salesMinor: inMonth.reduce((s, d) => s + d.baseMinor, 0),
      commissionMinor: inMonth.reduce((s, d) => s + creditOf(d), 0),
      paidOutMinor: payouts.filter((p) => monthOf(p.paidOn) === k).reduce((s, p) => s + p.amountMinor, 0),
    });
    const [y, m] = k.split("-").map(Number);
    k = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  }
  return out;
}
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
        credit: creditOf(d),
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

/** Three tabs (Khalid, 1 Oct 2026: «الصفحة محتاجة ترتيب… تابس»): the target, the commissions, the sales curve. */
const TABS = [
  { key: "target", label: "التارجت" },
  { key: "commission", label: "عمولاتي" },
  { key: "sales", label: "مبيعاتي شهرياً" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default async function CommissionStatementPage({ searchParams }: { searchParams: Promise<{ rep?: string; cur?: string; tab?: string }> }) {
  const desk = await checkSalesDesk();
  if (desk.status === "unauthenticated") redirect("/login");
  if (desk.status !== "ok") {
    return <p dir="rtl" className="px-5 py-10 text-sm text-muted-foreground">هذه الصفحة للمبيعات والأدمن.</p>;
  }
  const isAdmin = (await checkFinanceAdmin()).status === "ok";
  const viewerId = ((await auth())?.user as { id?: string } | undefined)?.id;

  const { rep: repParam, cur: curParam, tab: tabParam } = await searchParams;
  const tab: TabKey = TABS.some((t) => t.key === tabParam) ? (tabParam as TabKey) : "target";
  const all = await getSalesCommissions();
  // A rep sees his own statement whatever the URL says; the admin picks.
  const reps = isAdmin ? all.filter((r) => r.deals.length > 0 || r.payouts.length > 0 || r.isActive) : all.filter((r) => r.id === viewerId);
  const rep = isAdmin ? reps.find((r) => r.id === repParam) ?? reps[0] : reps[0];

  const currencies = rep ? rep.totals.map((t) => t.currency) : [];
  const currency = currencies.includes(curParam ?? "") ? curParam! : currencies[0];
  const tot = rep && currency ? rep.totals.find((t) => t.currency === currency) : undefined;
  const money = (m: number) => formatOrderMoney(m, currency ?? "SAR");
  const lines = rep && currency ? ledger(rep, currency) : [];
  const earned = lines.reduce((s, l) => s + l.credit, 0);
  const inCur = rep ? rep.deals.filter((d) => d.currency === currency) : [];
  const monthly = rep && currency ? months(rep, currency) : [];
  // Each month carries its own lines and the balance it closed on; newest month on top.
  let running = 0;
  const monthRows = monthly
    .map((m) => {
      const inMonth = lines.filter((l) => monthOf(l.at) === m.key);
      running += inMonth.reduce((s, l) => s + l.credit - l.debit, 0);
      return { ...m, lines: inMonth, balanceMinor: running };
    })
    .reverse();
  // This month against the target — the same numbers the orders page shows (`get-target-progress.ts`).
  const thisMonth = monthOf(new Date());
  const [progress] = rep && tab === "target" ? await getTargetProgress([rep]) : [];
  const href = (q: Record<string, string>) =>
    `/commission-statement?${new URLSearchParams({ ...(isAdmin && rep ? { rep: rep.id } : {}), ...(currency ? { cur: currency } : {}), tab, ...q })}`;

  // Egypt / Saudi — inside the card whose amounts it switches (Khalid: «جوه الجدول مش برا»).
  const marketSwitch =
    currencies.length > 1 ? (
      <nav className="flex gap-1.5" aria-label="السوق">
        {currencies.map((c) => (
          <Link
            key={c}
            href={href({ cur: c })}
            className={cn("rounded-md border px-3 py-1 text-xs font-semibold", c === currency ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            {COUNTRY[c] ?? c}
          </Link>
        ))}
      </nav>
    ) : null;

  return (
    <div dir="rtl" className="mx-auto max-w-5xl space-y-5 px-4 pb-8 sm:px-5">
      <header className="pt-1">
        <h1 className="text-xl font-semibold">كشف حساب العمولات{rep ? ` — ${rep.name}` : ""}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {rep?.currentRate
            ? `نسبة عمولتك: ${pct(rep.currentRate.newRateBp)} على العميل الجديد · ${pct(rep.currentRate.renewalRateBp)} على التجديد — من المبلغ قبل الضريبة.`
            : "ما تحدّدت نسبة عمولة بعد."}
        </p>
      </header>

      {isAdmin && reps.length > 1 && (
        <nav className="flex flex-wrap gap-2" aria-label="المندوب">
          {reps.map((r) => (
            <Link
              key={r.id}
              href={`/commission-statement?rep=${r.id}&tab=${tab}`}
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
          <div className="border-b">
            <nav className="flex gap-1" aria-label="الأقسام">
              {TABS.map((t) => (
                <Link
                  key={t.key}
                  href={href({ tab: t.key })}
                  aria-current={t.key === tab ? "page" : undefined}
                  className={cn(
                    "-mb-px border-b-2 px-4 py-2 text-sm font-semibold",
                    t.key === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>

          {tab === "target" && (
            <TargetCard
              monthLabel={monthName(thisMonth).split(" ")[0]}
              targetSarMinor={progress?.targetSarMinor ?? null}
              sales={progress?.sales ?? []}
              fxOk={progress?.fxOk ?? false}
              setHref={isAdmin ? `/users/${rep.id}` : undefined}
            />
          )}

          {tab === "commission" && tot && (
            <section className="grid gap-3 sm:grid-cols-3" aria-label="الملخّص">
              <Card
                label="عمولتك كلها"
                value={money(earned)}
                hint={`من ${count(inCur.filter((d) => d.kind === "new" && !d.refunded).length)} عميل جديد و${count(inCur.filter((d) => d.kind === "renewal" && !d.refunded).length)} تجديد`}
              />
              <Card label="استلمت" value={money(tot.paidOutMinor)} hint={`على ${count(rep.payouts.filter((p) => p.currency === currency).length)} دفعة`} />
              <Card
                label="باقي لك"
                value={money(tot.owedMinor)}
                hint={tot.clawbackMinor ? `بعد ما انخصم منك ${money(tot.clawbackMinor)} — عمولة طلب استرد العميل فلوسه` : "لسه ما استلمته"}
                strong
              />
            </section>
          )}

          {tab === "sales" && monthly.length === 0 && (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">ما فيه مبيعات بعد.</p>
          )}
          {tab === "sales" && monthly.length > 0 && (
            <section className="rounded-xl border bg-card px-4 pb-3 pt-4 shadow-sm" aria-label="المبيعات شهرياً">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">المبيعات شهرياً — قبل الضريبة</h2>
                {marketSwitch}
              </div>
              <MonthlySalesChart
                currencyLabel={UNIT[currency ?? ""] ?? currency ?? ""}
                data={monthly.map((m) => ({ label: monthName(m.key), sales: m.salesMinor / 100 }))}
              />
            </section>
          )}

          {tab === "commission" && (
          <section className="overflow-x-auto rounded-xl border bg-card shadow-sm" aria-label="الأشهر">
            <div className="min-w-[680px] text-sm">
              <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
                <h2 className="text-sm font-semibold">عمولاتك شهر بشهر</h2>
                {marketSwitch}
              </div>
              <div className={cn(GRID, "border-b bg-muted/40 py-2 text-xs font-semibold text-muted-foreground")}>
                <span />
                <span>الشهر</span>
                <span>الطلبات</span>
                <span className="text-end">المبيعات</span>
                <span className="text-end">العمولة</span>
                <span className="text-end">استلمت</span>
                <span className="text-end">باقي لك</span>
              </div>
              {monthRows.length === 0 ? (
                <p className="px-3 py-8 text-center text-muted-foreground">لا حركة بعد.</p>
              ) : (
                monthRows.map((m) => {
                  const empty = m.lines.length === 0;
                  const row = (
                    <>
                      {empty ? (
                        <span />
                      ) : (
                        <span className="grid size-5 place-items-center rounded border text-muted-foreground transition-transform group-open:rotate-45">
                          <Plus className="size-3.5" aria-hidden />
                        </span>
                      )}
                      <span className="font-semibold">{monthName(m.key)}</span>
                      <span className="text-xs text-muted-foreground">
                        {m.newCount + m.renewalCount === 0 ? "—" : `${m.newCount.toLocaleString("ar-EG")} جديد · ${m.renewalCount.toLocaleString("ar-EG")} تجديد`}
                      </span>
                      <span className="text-end tabular-nums">{m.salesMinor ? money(m.salesMinor) : "—"}</span>
                      <span className="text-end tabular-nums text-emerald-700 dark:text-emerald-400">{m.commissionMinor ? money(m.commissionMinor) : "—"}</span>
                      <span className="text-end tabular-nums text-rose-700 dark:text-rose-400">{m.paidOutMinor ? money(m.paidOutMinor) : "—"}</span>
                      <span className="text-end font-semibold tabular-nums">{money(m.balanceMinor)}</span>
                    </>
                  );
                  return empty ? (
                    <div key={m.key} className={cn(GRID, "border-b py-2.5 text-muted-foreground/70 last:border-0")}>{row}</div>
                  ) : (
                    <details key={m.key} name="month" className="group border-b last:border-0">
                      <summary className={cn(GRID, "cursor-pointer list-none py-2.5 hover:bg-muted/40 [&::-webkit-details-marker]:hidden")}>{row}</summary>
                      <div className="px-3 pb-3">
                        <ul className="divide-y rounded-lg border bg-background/70 shadow-sm">
                          {m.lines.map((l, i) => (
                            <li key={i} className="flex items-center gap-4 px-4 py-2.5">
                              <span className="w-24 shrink-0 text-xs tabular-nums text-muted-foreground" dir="ltr">{day(l.at)}</span>
                              <span className="min-w-0 flex-1">
                                {l.href ? <Link href={l.href} className="font-medium hover:underline">{l.label}</Link> : <span className="font-semibold">{l.label}</span>}
                                <span className="block text-xs text-muted-foreground">{l.detail}</span>
                              </span>
                              {l.credit ? (
                                <span className="tabular-nums text-emerald-700 dark:text-emerald-400">+ {money(l.credit)}</span>
                              ) : l.debit ? (
                                <span className="tabular-nums text-rose-700 dark:text-rose-400">− {money(l.debit)}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </details>
                  );
                })
              )}
            </div>
          </section>
          )}
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
