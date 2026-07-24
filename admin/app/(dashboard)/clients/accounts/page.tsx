import { Wallet } from "lucide-react";

import { db } from "@/lib/db";
import { NOT_INTERNAL } from "../segment/segments";

import { AccountsTable } from "./components/accounts-table";
import type { AccountRow } from "./components/accounts-table";

export const metadata = {
  title: "Accounts - Modonty",
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" });

function fmtDate(d: Date | null): string | null {
  return d ? dateFmt.format(d) : null;
}

function daysLeft(end: Date | null): number | null {
  if (!end) return null;
  return Math.ceil((end.getTime() - Date.now()) / 86_400_000);
}

async function getAccounts(): Promise<AccountRow[]> {
  // Every billable account. PENDING used to be excluded, which made «إجمالي الحسابات»
  // silently mean «كل شيء ما عدا المعلّق» — so the total equalled the active count and a
  // waiting client was invisible on the page that exists to manage accounts. Platform /
  // demo accounts (isInternal) ARE excluded here: they are free by nature and don't
  // belong in the billing hub at all.
  const clients = await db.client.findMany({
    where: NOT_INTERNAL,
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionTier: true,
      // The real plan the client is on (named tier config), not just the enum.
      subscriptionTierConfig: { select: { name: true } },
      subscriptionStatus: true,
      paymentStatus: true,
      subscriptionStartDate: true,
      subscriptionEndDate: true,
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const ids = clients.map((c) => c.id);

  // Activation = the client's FIRST published article (billing anchor).
  // Billing cycle = the period on the client's most-recent invoice.
  const [firstPublished, invoices] = await Promise.all([
    db.article.groupBy({
      by: ["clientId"],
      where: { clientId: { in: ids }, status: "PUBLISHED" },
      _min: { datePublished: true },
    }),
    db.invoice.findMany({
      where: { clientId: { in: ids } },
      orderBy: { issuedAt: "desc" },
      select: {
        clientId: true,
        period: true,
        paymentStatus: true,
        amount: true,
        currency: true,
        archivedAt: true,
      },
    }),
  ]);

  const activationMap = new Map(firstPublished.map((g) => [g.clientId, g._min.datePublished]));
  const billingMap = new Map<string, string>();
  for (const inv of invoices) if (!billingMap.has(inv.clientId)) billingMap.set(inv.clientId, inv.period);

  // Counted from the invoices themselves. `Client.paymentStatus` looks like the answer
  // but nothing ever writes OVERDUE to it — «mark paid» only ever writes PAID — so the
  // card read PAID for a client sitting on three unpaid invoices and could never show
  // anything but zero (Khalid spotted it 2026-07-24).
  // Archived invoices are void — they stay in the ledger but owe nothing.
  const unpaidByClient = new Map<string, { count: number; amount: number; currency: string }>();
  for (const inv of invoices) {
    if (inv.paymentStatus === "PAID" || inv.archivedAt) continue;
    const cur = unpaidByClient.get(inv.clientId) ?? { count: 0, amount: 0, currency: inv.currency };
    cur.count += 1;
    cur.amount += inv.amount;
    unpaidByClient.set(inv.clientId, cur);
  }

  return clients.map((c) => {
    const activation = activationMap.get(c.id) ?? null;
    const unpaid = unpaidByClient.get(c.id) ?? null;
    return {
      unpaidCount: unpaid?.count ?? 0,
      unpaidAmount: unpaid?.amount ?? 0,
      unpaidCurrency: unpaid?.currency ?? null,
      id: c.id,
      name: c.name,
      email: c.email,
      tier: c.subscriptionTier,
      planName: c.subscriptionTierConfig?.name ?? c.subscriptionTier,
      billing: billingMap.get(c.id) ?? null,
      accountStatus: c.subscriptionStatus,
      paymentStatus: c.paymentStatus,
      subscribedDate: fmtDate(c.subscriptionStartDate),
      subscribedTs: c.subscriptionStartDate?.getTime() ?? null,
      activationDate: fmtDate(activation),
      activationTs: activation?.getTime() ?? null,
      endDate: fmtDate(c.subscriptionEndDate),
      endTs: c.subscriptionEndDate?.getTime() ?? null,
      daysLeft: daysLeft(c.subscriptionEndDate),
    };
  });
}

export default async function AccountsPage() {
  const rows = await getAccounts();

  // The KPI row and the money banner both live inside <AccountsTable/>: one definition
  // per metric drives the card's number AND the rows it filters to, so they cannot
  // disagree — and the banner sits below the cards, not above them.
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Accounts
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          مركز إدارة حسابات العملاء — التفعيل، الإيقاف، التجديد، والفواتير في مكان واحد.
        </p>
      </div>

      <AccountsTable rows={rows} />
    </div>
  );
}
