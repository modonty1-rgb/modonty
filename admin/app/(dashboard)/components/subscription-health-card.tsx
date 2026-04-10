import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

interface SubscriptionHealthCardProps {
  subscriptions: {
    active: number;
    expired: number;
    cancelled: number;
    pending: number;
  };
  payments: {
    paid: number;
    pending: number;
    overdue: number;
  };
  expiring: {
    in7Days: number;
  };
}

export function SubscriptionHealthCard({ subscriptions, payments, expiring }: SubscriptionHealthCardProps) {
  const rows: {
    label: string;
    value: number;
    href: string;
    icon: React.ReactNode;
    valueColor: string;
    dimWhenZero?: boolean;
  }[] = [
    {
      label: "Active",
      value: subscriptions.active,
      href: "/clients?filter=active",
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
      valueColor: "text-emerald-600",
    },
    {
      label: "Expiring in 7 days",
      value: expiring.in7Days,
      href: "/clients?filter=expiring",
      icon: <Clock className="h-3.5 w-3.5 text-amber-500" />,
      valueColor: expiring.in7Days > 0 ? "text-amber-600" : "text-muted-foreground",
      dimWhenZero: true,
    },
    {
      label: "Overdue payments",
      value: payments.overdue,
      href: "/clients?filter=overdue",
      icon: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,
      valueColor: payments.overdue > 0 ? "text-red-600" : "text-muted-foreground",
      dimWhenZero: true,
    },
    {
      label: "Expired",
      value: subscriptions.expired,
      href: "/clients?filter=expired",
      icon: <XCircle className="h-3.5 w-3.5 text-red-400" />,
      valueColor: subscriptions.expired > 0 ? "text-red-600" : "text-muted-foreground",
      dimWhenZero: true,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Subscription Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {rows.map((row) => (
          <Link
            key={row.label}
            href={row.href}
            className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-2">
              {row.icon}
              <span className={`text-xs ${row.dimWhenZero && row.value === 0 ? "text-muted-foreground" : "text-foreground"}`}>
                {row.label}
              </span>
            </div>
            <span className={`text-sm font-bold tabular-nums ${row.valueColor}`}>
              {row.value}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
