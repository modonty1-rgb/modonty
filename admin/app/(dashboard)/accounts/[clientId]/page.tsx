import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Wallet, FileText, ReceiptText } from "lucide-react";

import { db } from "@/lib/db";
import { getActiveTierConfigs } from "../../subscription-tiers/actions/tier-actions";
import { resolvePricing } from "../../subscription-tiers/lib/pricing";

import { IssueInvoiceForm } from "./components/issue-invoice-form";
import type { TierOption } from "./components/issue-invoice-form";
import { AccountStatement } from "./components/account-statement";
import type { StatementEntry } from "./components/account-statement";

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

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "تحويل بنكي",
  mada: "مدى",
  instapay: "InstaPay",
  card: "بطاقة (Visa / Mastercard)",
  stc_pay: "STC Pay",
  apple_pay: "Apple Pay",
  cash: "نقدي",
};

// Egypt → EGP, everything else (default Saudi) → SAR.
function defaultCurrency(country: string | null): "SAR" | "EGP" {
  const c = (country ?? "").toLowerCase();
  return /مصر|egypt|\beg\b/.test(c) ? "EGP" : "SAR";
}

const STATUS_TONE: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  EXPIRED: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  CANCELLED: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const PAYMENT_TONE: Record<string, string> = {
  PAID: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  OVERDUE: "bg-red-500/15 text-red-600 dark:text-red-400",
};

interface PageProps {
  params: Promise<{ clientId: string }>;
}

export default async function ClientAccountPage({ params }: PageProps) {
  const { clientId } = await params;

  const [client, tierConfigs, invoices] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        paymentStatus: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        articlesPerMonth: true,
        addressCountry: true,
      },
    }),
    getActiveTierConfigs(),
    db.invoice.findMany({ where: { clientId }, orderBy: { issuedAt: "desc" } }),
  ]);

  if (!client) {
    notFound();
  }

  // Real invoices → statement timeline entries.
  const statementEntries: StatementEntry[] = invoices.map((inv) => ({
    id: inv.id,
    kind: "invoice",
    label: `فاتورة ${inv.tierName} (${inv.period === "monthly" ? "شهري" : "سنوي"})`,
    date: inv.issuedAt,
    amount: inv.amount,
    status: inv.paymentStatus === "PAID" ? "PAID" : "DUE",
    currency: inv.currency === "EGP" ? "EGP" : "SAR",
    invoiceNumber: inv.number,
    method: PAYMENT_METHOD_LABELS[inv.paymentMethod] ?? inv.paymentMethod,
    periodLabel: inv.period === "monthly" ? "شهري" : "سنوي",
    rangeStart: inv.subscriptionStart ?? undefined,
    rangeEnd: inv.subscriptionEnd ?? undefined,
  }));

  const tierOptions: TierOption[] = tierConfigs.map((c) => {
    // Reference prices only (display hint) — the amount field stays manual.
    // jbrseo `yr` = monthly-equivalent under annual → annual total = yr × 12.
    const p = resolvePricing(c.name, c.pricing);
    return {
      tier: c.tier,
      name: c.name,
      priceMonthly: { SAR: p.SA.mo, EGP: p.EG.mo },
      priceAnnual: { SAR: Math.round(p.SA.yr * 12), EGP: Math.round(p.EG.yr * 12) },
    };
  });

  // Real display name for the client's current tier (jbrseo name, not the raw enum).
  const currentTierName =
    tierConfigs.find((c) => c.tier === client.subscriptionTier)?.name ?? client.subscriptionTier;

  const left = daysLeft(client.subscriptionEndDate);

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div>
        <Link
          href="/accounts"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowRight className="h-4 w-4" />
          كل الحسابات
        </Link>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-x-10 gap-y-4 flex-wrap">
            {/* Name + email */}
            <div className="min-w-0">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {client.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">{client.email}</p>
            </div>

            {/* Stats beside the name */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <Meta label="بداية الاشتراك" value={fmtDate(client.subscriptionStartDate)} />
              <Meta label="نهاية الاشتراك" value={fmtDate(client.subscriptionEndDate)} />
              <Meta
                label="المتبقّي"
                value={left === null ? "—" : left < 0 ? "انتهى" : `${left} يوم`}
                tone={left !== null && left < 0 ? "text-red-500" : undefined}
              />
              <Meta label="مقالات/شهر" value={String(client.articlesPerMonth)} />
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] px-2 py-1 rounded-full bg-muted-foreground/15 font-medium">
                {currentTierName}
              </span>
              <span
                className={`text-[11px] px-2 py-1 rounded-full font-medium ${STATUS_TONE[client.subscriptionStatus] || "bg-muted text-muted-foreground"}`}
              >
                {client.subscriptionStatus}
              </span>
              <span
                className={`text-[11px] px-2 py-1 rounded-full font-medium ${PAYMENT_TONE[client.paymentStatus] || "bg-muted text-muted-foreground"}`}
              >
                {client.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Issue invoice */}
      <Section icon={FileText} title="إصدار فاتورة">
        <IssueInvoiceForm
          clientId={client.id}
          clientName={client.name}
          tiers={tierOptions}
          currentTier={client.subscriptionTier}
          defaultCurrency={defaultCurrency(client.addressCountry)}
          currentEndDate={client.subscriptionEndDate ? client.subscriptionEndDate.toISOString() : null}
        />
      </Section>

      {/* Statement — real invoices timeline */}
      <Section icon={ReceiptText} title="كشف الحساب">
        <AccountStatement entries={statementEntries} clientName={client.name} />
      </Section>
    </div>
  );
}


function Meta({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="leading-tight">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${tone ?? ""}`}>{value}</p>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium">
            {badge}
          </span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
