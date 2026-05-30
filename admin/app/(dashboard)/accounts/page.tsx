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
      subscriptionStatus: true,
      paymentStatus: true,
      subscriptionStartDate: true,
      subscriptionEndDate: true,
      articlesPerMonth: true,
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return clients.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    tier: c.subscriptionTier,
    accountStatus: c.subscriptionStatus,
    paymentStatus: c.paymentStatus,
    startDate: fmtDate(c.subscriptionStartDate),
    endDate: fmtDate(c.subscriptionEndDate),
    daysLeft: daysLeft(c.subscriptionEndDate),
    articlesPerMonth: c.articlesPerMonth ?? 0,
  }));
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
