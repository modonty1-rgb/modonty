import Link from "next/link";
import { AlertTriangle, CreditCard, XCircle, Gauge } from "lucide-react";

interface AlertData {
  expiringSubscriptions: Array<{ id: string; name: string }>;
  overduePayments: Array<{ id: string; name: string }>;
  expiredSubscriptions: Array<{ id: string; name: string }>;
  clientsAtLimit: Array<{ id: string; name: string }>;
}

interface DashboardAlertsBannerProps {
  alerts: AlertData;
}

export function DashboardAlertsBanner({ alerts }: DashboardAlertsBannerProps) {
  const chips: { label: string; count: number; href: string; color: string; icon: React.ReactNode }[] = [];

  if (alerts.expiringSubscriptions.length > 0) {
    chips.push({
      label: "Expiring soon",
      count: alerts.expiringSubscriptions.length,
      href: "/clients?filter=expiring",
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
    });
  }
  if (alerts.overduePayments.length > 0) {
    chips.push({
      label: "Overdue payments",
      count: alerts.overduePayments.length,
      href: "/clients?filter=overdue",
      color: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
      icon: <CreditCard className="h-3.5 w-3.5" />,
    });
  }
  if (alerts.expiredSubscriptions.length > 0) {
    chips.push({
      label: "Expired",
      count: alerts.expiredSubscriptions.length,
      href: "/clients?filter=expired",
      color: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
      icon: <XCircle className="h-3.5 w-3.5" />,
    });
  }
  if (alerts.clientsAtLimit.length > 0) {
    chips.push({
      label: "At article limit",
      count: alerts.clientsAtLimit.length,
      href: "/clients?filter=at-limit",
      color: "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20",
      icon: <Gauge className="h-3.5 w-3.5" />,
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium">Needs attention:</span>
      {chips.map((chip) => (
        <Link
          key={chip.href}
          href={chip.href}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-colors ${chip.color}`}
        >
          {chip.icon}
          {chip.count} {chip.label}
        </Link>
      ))}
    </div>
  );
}
