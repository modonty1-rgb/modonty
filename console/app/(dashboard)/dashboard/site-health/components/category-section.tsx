import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Gauge,
  Search,
  Globe,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MinusCircle,
} from "lucide-react";
import type { CategoryReport, CheckStatus } from "@/lib/health/types";

const CATEGORY_META: Record<
  CategoryReport["category"],
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  security: { label: "الأمان", icon: Shield },
  performance: { label: "الأداء", icon: Gauge },
  seo: { label: "SEO", icon: Search },
  dns: { label: "DNS + النطاق", icon: Globe },
  uptime: { label: "حالة الموقع", icon: Activity },
};

const STATUS_ICON: Record<CheckStatus, React.ComponentType<{ className?: string }>> = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
  skip: MinusCircle,
};

const STATUS_COLOR: Record<CheckStatus, string> = {
  pass: "text-emerald-600",
  warn: "text-amber-600",
  fail: "text-red-600",
  skip: "text-muted-foreground",
};

export function CategorySection({ report }: { report: CategoryReport }) {
  const meta = CATEGORY_META[report.category];
  const Icon = meta.icon;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {meta.label}
          </span>
          <span className="text-sm font-bold tabular-nums text-muted-foreground">
            {report.passed}/{report.total} ·{" "}
            <span
              className={
                report.score >= 80
                  ? "text-emerald-600"
                  : report.score >= 50
                    ? "text-amber-600"
                    : "text-red-600"
              }
            >
              {report.score}%
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5">
          {report.checks.map((c) => {
            const StatusIcon = STATUS_ICON[c.status];
            const color = STATUS_COLOR[c.status];
            return (
              <li
                key={c.metric}
                className="flex items-start gap-3 rounded-md border bg-card/50 px-3 py-2"
              >
                <StatusIcon className={`h-4 w-4 shrink-0 mt-0.5 ${color}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-tight text-foreground">
                    {c.message ?? c.metric}
                  </p>
                  {c.recommendation && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      💡 {c.recommendation}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
