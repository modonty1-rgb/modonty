import { Wallet, CheckCircle2, AlertTriangle, CalendarClock } from "lucide-react";

import { db } from "@/lib/db";

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
  const clients = await db.client.findMany({
    where: { subscriptionStatus: { not: "PENDING" } },
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
      select: { clientId: true, period: true },
    }),
  ]);

  const activationMap = new Map(firstPublished.map((g) => [g.clientId, g._min.datePublished]));
  const billingMap = new Map<string, string>();
  for (const inv of invoices) if (!billingMap.has(inv.clientId)) billingMap.set(inv.clientId, inv.period);

  return clients.map((c) => {
    const activation = activationMap.get(c.id) ?? null;
    return {
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

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-md ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default async function AccountsPage() {
  const rows = await getAccounts();

  const total = rows.length;
  const active = rows.filter((r) => r.accountStatus === "ACTIVE").length;
  const overdue = rows.filter((r) => r.paymentStatus === "OVERDUE").length;
  const expiring = rows.filter((r) => r.daysLeft !== null && r.daysLeft >= 0 && r.daysLeft <= 30).length;

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

      {/* Smart alert: only screams when there is money at risk. */}
      {overdue > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-red-500/15 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-red-700 dark:text-red-400">
              {overdue} account{overdue > 1 ? "s" : ""} overdue
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/70">
              راجعها وأرسل تذكير الدفع قبل انقطاع الخدمة.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={Wallet} label="إجمالي الحسابات" value={total} tone="bg-muted text-foreground" />
        <Kpi icon={CheckCircle2} label="نشط" value={active} tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" />
        <Kpi icon={AlertTriangle} label="متأخّر السداد" value={overdue} tone="bg-red-500/15 text-red-600 dark:text-red-400" />
        <Kpi icon={CalendarClock} label="قرب الانتهاء (٣٠ يوم)" value={expiring} tone="bg-violet-500/15 text-violet-600 dark:text-violet-400" />
      </div>

      <AccountsTable rows={rows} />
    </div>
  );
}
