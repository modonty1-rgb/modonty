import Link from "next/link";
import { TrendingUp, Wallet, Clock, UserX, FileText, Package, CalendarX } from "lucide-react";

import type { Money, SalesReport, Period } from "../actions/get-sales-report";
import { InvoicesTable } from "./invoices-table";
import { currencyLabel } from "@modonty/shared/lib/commercial/format-money";

const nf = new Intl.NumberFormat("en-US");
const money = (n: number) => nf.format(Math.round(n));

// One fixed color per currency, reused everywhere so the eye reads currency by hue:
// SAR = emerald (السعودي) · EGP = blue (المصري).
const CURRENCY_BADGE: Record<"SAR" | "EGP", string> = {
  SAR: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  EGP: "bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:text-blue-400",
};


function CurBadge({ code, value }: { code: "SAR" | "EGP"; value: number }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ring-1 ring-inset ${CURRENCY_BADGE[code]}`}>
      {money(value)}
      <span className="text-[9px] font-semibold opacity-70">{currencyLabel(code)}</span>
    </span>
  );
}

function CountBadge({ value, danger }: { value: number; danger?: boolean }) {
  const cls =
    danger && value > 0
      ? "bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-400"
      : "bg-muted text-foreground ring-border";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ring-1 ring-inset ${cls}`}>
      {nf.format(value)}
    </span>
  );
}


/** SAR and/or EGP on their own lines — never summed together. */
// Currency-colored badges, same hues as everywhere else (SAR emerald · EGP blue).
function MoneyCell({ sar, egp }: { sar: number; egp: number }) {
  if (sar === 0 && egp === 0) return <span className="text-muted-foreground/50">—</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {sar > 0 && <CurBadge code="SAR" value={sar} />}
      {egp > 0 && <CurBadge code="EGP" value={egp} />}
    </span>
  );
}

function Kpi({
  icon: Icon,
  label,
  children,
  accent,
}: {
  icon: typeof Wallet;
  label: string;
  children: React.ReactNode;
  accent: "emerald" | "amber" | "primary" | "muted" | "red";
}) {
  const ring: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    primary: "text-primary bg-primary/10",
    muted: "text-muted-foreground bg-muted",
    red: "text-red-600 dark:text-red-400 bg-red-500/10",
  };
  return (
    <div className="flex items-center gap-2.5 px-4 py-3">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${ring[accent]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      <span className="ms-auto flex flex-wrap items-center justify-end gap-1.5">{children}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: typeof Wallet; children: React.ReactNode }) {
  return (
    <h2 className="mb-2 flex items-center gap-2 text-[13px] font-bold text-muted-foreground">
      <Icon className="h-4 w-4" />
      {children}
    </h2>
  );
}

const th = "px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const hasMoney = (m: Money) => m.paid > 0 || m.due > 0;

export function SalesReportView({ report, period }: { report: SalesReport; period: Period }) {
  const { totals, invoiceCount, byTier, recent, reps, unassignedCount, monthlyTotals, yearTotal, expiredCount } = report;
  /**
   * العملةُ تُعرض حين يكون فيها مالٌ في الدفتر — لا عمودَ «ر.س. 0» في كلّ خانة والسوقُ
   * السعوديّ بلا مبيعات. وإن خلا الدفترُ كلُّه يبقى الجنيه (٨٨٪ من الجمهور مصريّ).
   */
  const showSar = totals.sar.paid + totals.sar.due + yearTotal.sar > 0;
  const showEgp = totals.egp.paid + totals.egp.due + yearTotal.egp > 0 || !showSar;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header + period filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <TrendingUp className="h-5 w-5" />
            تقرير المبيعات
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            الفواتير والإيرادات الفعلية — إجمالاً، حسب الباقة، وحسب المندوب. الأرقام مفصولة بالعملة.
          </p>
        </div>
      </div>

      {/**
        * **الفترة: السنةُ كاملة، ثمّ شهورُها حتى الشهر الحاليّ** (خالد ٢٣ سبتمبر ٢٠٢٦: «الدول
        * والأشهر فيها لخبطة كثير»). كانت ثلاثَ عشرةَ بطاقةً بأسماءٍ إنجليزيّة، في كلٍّ عملتان
        * ولو صفراً، والشهورُ القادمة معروضةٌ بأصفارها — فتُقرأ الشاشةُ أصفاراً.
        *
        * الآن: شهرٌ عربيّ، ولا تظهر إلّا العملةُ التي فيها مال؛ والشهرُ الفارغ باهتٌ بشَرطة.
        */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { key: "all" as const, label: `سنة ${new Date().getFullYear()}`, sar: yearTotal.sar, egp: yearTotal.egp },
          ...monthlyTotals
            .filter((t) => t.month <= new Date().getMonth() + 1)
            .map((t) => ({ key: t.month, label: MONTHS[t.month - 1], sar: t.sar, egp: t.egp })),
        ].map((item) => {
          const active = period === item.key;
          const empty = item.sar === 0 && item.egp === 0;
          const href = item.key === "all" ? "/clients/sales-report" : `/clients/sales-report?month=${item.key}`;
          return (
            <Link
              key={item.label}
              href={href}
              className={`flex min-w-[88px] flex-col items-center gap-0.5 rounded-lg border px-3 py-1.5 transition-colors ${
                active ? "border-primary bg-primary/10" : "bg-card hover:border-primary/50"
              } ${empty && !active ? "opacity-50" : ""}`}
            >
              <span className={`text-[12px] font-bold ${active ? "text-primary" : "text-foreground"}`}>{item.label}</span>
              {empty ? (
                <span className="text-[11px] text-muted-foreground">—</span>
              ) : (
                <>
                  {showEgp && item.egp > 0 ? (
                    <span className="text-[11px] font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                      {money(item.egp)} <span className="text-[9px] opacity-70">{currencyLabel("EGP")}</span>
                    </span>
                  ) : null}
                  {showSar && item.sar > 0 ? (
                    <span className="text-[11px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {money(item.sar)} <span className="text-[9px] opacity-70">{currencyLabel("SAR")}</span>
                    </span>
                  ) : null}
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* KPIs — one compact strip */}
      <div className="flex flex-wrap items-stretch overflow-hidden rounded-xl border bg-card shadow-sm [&>*]:flex-1 [&>*]:min-w-[160px] [&>*:not(:first-child)]:border-s [&>*:not(:first-child)]:border-border">
        <Kpi icon={Wallet} label="المحصّل" accent="emerald">
          {showEgp ? <CurBadge code="EGP" value={totals.egp.paid} /> : null}
          {showSar ? <CurBadge code="SAR" value={totals.sar.paid} /> : null}
        </Kpi>
        <Kpi icon={Clock} label="المستحق" accent="amber">
          {showEgp ? <CurBadge code="EGP" value={totals.egp.due} /> : null}
          {showSar ? <CurBadge code="SAR" value={totals.sar.due} /> : null}
        </Kpi>
        <Kpi icon={CalendarX} label="منتهي" accent="red">
          <CountBadge value={expiredCount} danger />
        </Kpi>
        <Kpi icon={FileText} label="الفواتير" accent="primary">
          <CountBadge value={invoiceCount} />
        </Kpi>
      </div>

      {/* Invoices for the active period — the toggle above drives it (no static title). */}
      <div>
        <SectionTitle icon={FileText}>
          فواتير <span className="text-foreground">{period === "all" ? "كل الفترات" : MONTHS[period - 1]}</span>
        </SectionTitle>
        <InvoicesTable rows={recent} />
      </div>

      {/* Two-up: by tier · by rep */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* By tier */}
        <div>
          <SectionTitle icon={Package}>حسب الباقة</SectionTitle>
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className={`${th} text-start`}>الباقة</th>
                  <th className={`${th} text-start`}>المحصّل</th>
                  <th className={`${th} text-start`}>المستحق</th>
                </tr>
              </thead>
              <tbody>
                {byTier.filter((t) => hasMoney(t.sar) || hasMoney(t.egp)).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">لا بيانات.</td>
                  </tr>
                ) : (
                  byTier
                    .filter((t) => hasMoney(t.sar) || hasMoney(t.egp))
                    .map((t) => (
                      <tr key={t.tierName} className="border-b last:border-b-0 hover:bg-muted/30">
                        <td className="px-4 py-3 font-semibold">{t.tierName}</td>
                        <td className="px-4 py-3">
                          <MoneyCell sar={t.sar.paid} egp={t.egp.paid} />
                        </td>
                        <td className="px-4 py-3">
                          <MoneyCell sar={t.sar.due} egp={t.egp.due} />
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* By rep */}
        <div>
          <SectionTitle icon={TrendingUp}>حسب المندوب</SectionTitle>
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className={`${th} text-start`}>المندوب</th>
                  <th className={`${th} text-center`}>العملاء</th>
                  <th className={`${th} text-start`}>المحصّل</th>
                </tr>
              </thead>
              <tbody>
                {reps.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                      لا مناديب مُسندون بعد.
                    </td>
                  </tr>
                ) : (
                  reps.map((rep) => (
                    <tr key={rep.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-semibold">{rep.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-bold tabular-nums text-primary">
                          {rep.clientCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <MoneyCell sar={rep.sar.paid} egp={rep.egp.paid} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Unassigned clients — lost attribution */}
      {unassignedCount > 0 && (
        <Link
          href="/clients"
          className="flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 transition-colors hover:bg-amber-500/[0.1]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <UserX className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{unassignedCount} عميل بدون مندوب</p>
            <p className="text-[11px] text-muted-foreground">
              مبيعاتهم غير منسوبة لأحد — أسنِد لهم مندوباً عشان تتوزّع على «حسب المندوب».
            </p>
          </div>
        </Link>
      )}
    </div>
  );
}
