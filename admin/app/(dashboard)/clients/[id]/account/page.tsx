import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Users } from "lucide-react";

import { db } from "@/lib/db";
import { getActiveTierConfigs } from "../../../subscription-tiers/actions/tier-actions";
import { resolvePricing } from "../../../subscription-tiers/lib/pricing";
import { getStaffScope, isClientOutOfScope } from "../../helpers/sales-scope";

import { AccountLedger } from "./components/account-ledger";
import type { LedgerInvoice, Currency } from "./components/account-ledger";

export const metadata = {
  title: "Account - Modonty",
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" });

function fmtDate(d: Date | null): string {
  return d ? dateFmt.format(d) : "—";
}

function daysLeft(end: Date | null): number | null {
  if (!end) return null;
  return Math.ceil((end.getTime() - Date.now()) / 86_400_000);
}

// Egypt → EGP, everything else (default Saudi) → SAR.
function currencyForCountry(country: string | null): Currency {
  const c = (country ?? "").toLowerCase();
  return /مصر|egypt|\beg\b/.test(c) ? "EGP" : "SAR";
}

function localizeCountry(country: string | null, currency: Currency): string {
  if (!country) return currency === "EGP" ? "مصر" : "السعودية";
  const c = country.toLowerCase();
  if (/مصر|egypt|\beg\b/.test(c)) return "مصر";
  if (/سعود|saudi|\bsa\b|ksa/.test(c)) return "السعودية";
  return country;
}

function money(amount: number, currency: Currency): string {
  return `${new Intl.NumberFormat("en-US").format(amount)} ${currency}`;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientAccountPage({ params }: PageProps) {
  const { id: clientId } = await params;

  const [client, tierConfigs, invoices, firstPublished] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        subscriptionTierConfig: { select: { name: true } },
        subscriptionStatus: true,
        subscriptionEndDate: true,
        addressCountry: true,
        createdAt: true,
        openingBalance: true,
        salesRepId: true,
        salesRep: { select: { name: true, email: true } },
      },
    }),
    getActiveTierConfigs(),
    db.invoice.findMany({ where: { clientId }, orderBy: { issuedAt: "desc" } }),
    // Activation = first published article (billing anchor).
    db.article.findFirst({
      where: { clientId, status: "PUBLISHED" },
      orderBy: { datePublished: "asc" },
      select: { datePublished: true },
    }),
  ]);

  if (!client) {
    notFound();
  }

  // A sales rep can only open the accounts they brought. Instead of a jarring 404, show a
  // calm explanation naming the rep this client belongs to (Khalid 2026-07-25: «ما تفجع المندوب»).
  const scope = await getStaffScope();
  if (isClientOutOfScope(scope, client.salesRepId)) {
    const repName = client.salesRep?.name || client.salesRep?.email || null;
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center" dir="rtl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Users className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">هذا الحساب ليس ضمن عملائك</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          العميل <b className="text-foreground">«{client.name}»</b>{" "}
          {repName ? (
            <>مسجّل باسم المندوب <b className="text-foreground">{repName}</b>.</>
          ) : (
            <>غير مُسنَد لك.</>
          )}{" "}
          تقدر تدير عملاءك أنت فقط — لأي استفسار عن هذا الحساب تواصل مع المندوب المسؤول أو الإدارة.
        </p>
        <Link
          href="/clients/accounts"
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          رجوع لحساباتي
        </Link>
      </div>
    );
  }

  const currency = currencyForCountry(client.addressCountry);
  const currentTierName = client.subscriptionTierConfig?.name ?? client.subscriptionTier;
  // Billing period follows the most-recent invoice (default annual).
  const currentPeriod = invoices[0]?.period ?? "annual";
  const periodLabel = currentPeriod === "monthly" ? "شهري" : "سنوي";

  // Default amount for the issue dialog = reference price for current tier+period.
  let defaultAmount: number | null = null;
  const cfg = tierConfigs.find((c) => c.tier === client.subscriptionTier);
  if (cfg) {
    const p = resolvePricing(cfg.name, cfg.pricing);
    const bucket = currency === "EGP" ? p.EG : p.SA;
    defaultAmount = currentPeriod === "monthly" ? bucket.mo : Math.round(bucket.yr * 12);
  }

  // Opening balance → the founding payment. It shows the «Auto Button» that documents it as
  // the first invoice, but only while it hasn't been converted yet (a fromOpeningBalance
  // invoice = already done). Compute this first — the collected total below depends on it.
  const openingBalanceConverted = invoices.some((i) => i.fromOpeningBalance);
  const openingBalance = client.openingBalance ?? 0;
  // Before conversion the founding cash lives only on the client; after conversion it lives
  // in the PAID fromOpeningBalance invoice. Count it exactly once so «إجمالي المدفوع» is the
  // real collected figure and doesn't jump when the balance is turned into its invoice.
  const collectedOpening = !openingBalanceConverted ? openingBalance : 0;

  // Accounting bottom line (derived from invoices + the unconverted opening balance).
  // Archived invoices are void: they stay in the ledger for the record but owe nothing.
  const due = invoices
    .filter((i) => i.paymentStatus !== "PAID" && !i.archivedAt)
    .reduce((s, i) => s + i.amount, 0);
  const paid =
    invoices.filter((i) => i.paymentStatus === "PAID" && !i.archivedAt).reduce((s, i) => s + i.amount, 0) +
    collectedOpening;
  const hasPaid = paid > 0;

  const end = client.subscriptionEndDate;
  const left = daysLeft(end);
  const expired = end ? Date.now() > end.getTime() : false;
  const derivedPaid = end ? !expired : hasPaid;

  const ledger: LedgerInvoice[] = invoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    issuedAtLabel: fmtDate(inv.issuedAt),
    description: `${inv.tierName} · ${inv.period === "monthly" ? "شهري" : "سنوي"}`,
    amount: inv.amount,
    currency: inv.currency === "EGP" ? "EGP" : "SAR",
    status: inv.paymentStatus === "PAID" ? "PAID" : "DUE",
    emailSent: !!inv.emailSentAt,
    isArchived: !!inv.archivedAt,
    archivedReason: inv.archivedReason ?? null,
  }));

  return (
    <div className="space-y-4">
      <Link
        href="/clients/accounts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowRight className="h-4 w-4" />
        كل الحسابات
      </Link>

      {/* ── HEADER — identity + status, one compact line ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold leading-tight">{client.name}</h1>
          <p className="text-xs text-muted-foreground">{client.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold">
            {client.subscriptionStatus}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              derivedPaid
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            }`}
          >
            {derivedPaid ? `مدفوعة · حتى ${fmtDate(end)}` : "مستحقّة"}
          </span>
        </div>
      </div>

      {/* Two columns: the account's facts on the side, the ledger — the actual work —
          taking the width. Stacked full-width bands left 469px of the page empty while
          six one-word facts were spread across 1280px (Khalid 2026-07-24). */}
      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-3">
          {/* The three numbers this page exists to answer */}
          <div className="divide-y rounded-lg border bg-card">
            <div className="px-3.5 py-2.5">
              <p className="text-[11px] text-muted-foreground">المستحق الآن</p>
              <p className="mt-0.5 text-xl font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
                {money(due, currency)}
              </p>
            </div>
            <div className="px-3.5 py-2.5">
              <p className="text-[11px] text-muted-foreground">إجمالي المدفوع</p>
              <p className="mt-0.5 text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                {money(paid, currency)}
              </p>
              {openingBalance > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  منها رصيد افتتاحي {money(openingBalance, currency)}
                  {openingBalanceConverted ? " · محوّل لفاتورة" : " · بانتظار أول مقال"}
                </p>
              )}
            </div>
            <div className="px-3.5 py-2.5">
              <p className="text-[11px] text-muted-foreground">نهاية الاشتراك</p>
              <p className="mt-0.5 text-xl font-extrabold tabular-nums">{fmtDate(end)}</p>
              {left !== null && (
                <p
                  className={`text-[11px] ${expired ? "text-red-500" : "text-emerald-600/80 dark:text-emerald-400/80"}`}
                >
                  {expired ? "انتهى" : `${left} يوم متبقّي`}
                </p>
              )}
            </div>
          </div>

          {/* Read-only DB facts — two per row instead of six across the screen */}
          <div className="rounded-lg border bg-card p-2.5">
            <div className="mb-2.5 flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2">
              <span className="text-[11px] text-muted-foreground">المندوب</span>
              <span className="ms-auto text-sm font-semibold">
                {client.salesRep?.name || client.salesRep?.email || "— بدون —"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border">
              <Fact label="الباقة" value={currentTierName} accent="violet" />
              <Fact label="الفترة" value={periodLabel} accent="violet" />
              <Fact label="أول مقال" value={fmtDate(firstPublished?.datePublished ?? null)} accent="amber" />
              <Fact label="التسجيل" value={fmtDate(client.createdAt)} />
              <Fact label="العملة" value={currency} />
              <Fact label="الدولة" value={localizeCountry(client.addressCountry, currency)} />
            </div>
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              عرض فقط — تُعدَّل من <b className="text-foreground">صفحة العميل</b>.
            </p>
          </div>
        </aside>

        {/* ── LEDGER — the invoices ── */}
        <AccountLedger
          clientId={client.id}
          invoices={ledger}
          firstPublishedAt={firstPublished?.datePublished?.toISOString().slice(0, 10) ?? null}
          currentEnd={client.subscriptionEndDate?.toISOString().slice(0, 10) ?? null}
          planLabel={`${currentTierName} · ${periodLabel}`}
          currency={currency}
          defaultAmount={defaultAmount}
          openingBalance={client.openingBalance ?? null}
          openingBalanceConverted={openingBalanceConverted}
        />
      </div>
    </div>
  );
}

function Fact({ label, value, accent }: { label: string; value: string; accent?: "violet" | "amber" }) {
  const ring =
    accent === "violet"
      ? "ring-1 ring-inset ring-violet-500/25"
      : accent === "amber"
        ? "ring-1 ring-inset ring-amber-500/30"
        : "";
  const labelTone =
    accent === "violet" ? "text-violet-600/80 dark:text-violet-300/70" : accent === "amber" ? "text-amber-600/80 dark:text-amber-400/70" : "text-muted-foreground";
  const valueTone =
    accent === "violet" ? "text-violet-700 dark:text-violet-200" : accent === "amber" ? "text-amber-700 dark:text-amber-300" : "";
  return (
    <div className={`bg-card px-3 py-2 ${ring}`}>
      <p className={`text-[10px] ${labelTone}`}>{label}</p>
      <p className={`text-[13px] font-semibold tabular-nums ${valueTone}`}>{value}</p>
    </div>
  );
}
