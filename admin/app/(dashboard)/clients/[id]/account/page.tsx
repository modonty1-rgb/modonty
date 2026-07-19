import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { db } from "@/lib/db";
import { getActiveTierConfigs } from "../../../subscription-tiers/actions/tier-actions";
import { resolvePricing } from "../../../subscription-tiers/lib/pricing";

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

  // Accounting bottom line (derived from invoices — no stored aggregate).
  const due = invoices.filter((i) => i.paymentStatus !== "PAID").reduce((s, i) => s + i.amount, 0);
  const paid = invoices.filter((i) => i.paymentStatus === "PAID").reduce((s, i) => s + i.amount, 0);
  const hasPaid = invoices.some((i) => i.paymentStatus === "PAID");

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

      {/* ── HEADER — identity + the accounting bottom line ── */}
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-xl font-bold">{client.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{client.email}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] px-3 py-1 rounded-full bg-muted font-semibold">
              {client.subscriptionStatus}
            </span>
            <span
              className={`text-[12px] px-3 py-1 rounded-full font-semibold ${
                derivedPaid
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {derivedPaid ? `مدفوعة · حتى ${fmtDate(end)}` : "مستحقّة"}
            </span>
          </div>
        </div>

        {/* The three numbers this page exists to answer */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-px rounded-md overflow-hidden border bg-border">
          <div className="bg-card px-4 py-4">
            <p className="text-[11px] text-muted-foreground">المستحق الآن</p>
            <p className="text-2xl font-extrabold tabular-nums mt-1 text-amber-600 dark:text-amber-400">
              {money(due, currency)}
            </p>
          </div>
          <div className="bg-card px-4 py-4">
            <p className="text-[11px] text-muted-foreground">إجمالي المدفوع</p>
            <p className="text-2xl font-extrabold tabular-nums mt-1 text-emerald-600 dark:text-emerald-400">
              {money(paid, currency)}
            </p>
          </div>
          <div className="bg-card px-4 py-4">
            <p className="text-[11px] text-muted-foreground">نهاية الاشتراك</p>
            <p className="text-2xl font-extrabold tabular-nums mt-1">{fmtDate(end)}</p>
            {left !== null && (
              <p className={`text-[11px] mt-0.5 ${expired ? "text-red-500" : "text-emerald-600/80 dark:text-emerald-400/80"}`}>
                {expired ? "انتهى" : `${left} يوم متبقّي`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── FACTS — read-only DB facts (secondary) ── */}
      <div className="rounded-lg border bg-card p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px rounded-md overflow-hidden border bg-border">
          <Fact label="الباقة" value={currentTierName} accent="violet" />
          <Fact label="الفترة" value={periodLabel} accent="violet" />
          <Fact label="التفعيل · أول مقال" value={fmtDate(firstPublished?.datePublished ?? null)} accent="amber" />
          <Fact label="تاريخ التسجيل" value={fmtDate(client.createdAt)} />
          <Fact label="العملة" value={currency} />
          <Fact label="الدولة" value={localizeCountry(client.addressCountry, currency)} />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          عرض فقط — الباقة والفترة تُعدَّلان من <b className="text-foreground">صفحة العميل الأساسية</b>.
        </p>
      </div>

      {/* ── LEDGER — the invoices ── */}
      <AccountLedger
        clientId={client.id}
        invoices={ledger}
        planLabel={`${currentTierName} · ${periodLabel}`}
        currency={currency}
        defaultAmount={defaultAmount}
      />
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
