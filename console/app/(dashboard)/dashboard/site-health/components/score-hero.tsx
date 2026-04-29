import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import type { OverallHealthReport } from "@/lib/health/types";

const GRADE_COLORS: Record<OverallHealthReport["grade"], string> = {
  "A+": "text-emerald-600 bg-emerald-50 ring-emerald-200",
  A: "text-emerald-600 bg-emerald-50 ring-emerald-200",
  B: "text-amber-600 bg-amber-50 ring-amber-200",
  C: "text-orange-600 bg-orange-50 ring-orange-200",
  D: "text-red-600 bg-red-50 ring-red-200",
  F: "text-red-700 bg-red-100 ring-red-300",
};

const GRADE_LABEL: Record<OverallHealthReport["grade"], string> = {
  "A+": "ممتاز",
  A: "جيد جداً",
  B: "جيد",
  C: "مقبول",
  D: "ضعيف",
  F: "يحتاج تحسين عاجل",
};

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function ScoreHero({ report }: { report: OverallHealthReport }) {
  const colors = GRADE_COLORS[report.grade];
  const gradeLabel = GRADE_LABEL[report.grade];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" />
          درجة Modonty الإجمالية للصحة
        </CardTitle>
        <CardDescription>
          مجموع فحوصاتنا الخاصة (الأمان، DNS، SEO essentials، CWV) — منفصلة عن درجات Google
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div
            className={`grid h-24 w-24 shrink-0 place-items-center rounded-full ring-4 ${colors}`}
          >
            <div className="text-center">
              <p className="text-3xl font-bold tabular-nums leading-none">
                {report.totalScore}
              </p>
              <p className="text-xs font-semibold mt-0.5 opacity-80">/100</p>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-bold ring-1 ${colors}`}
              >
                {report.grade}
              </span>
              <span className="text-base font-semibold text-foreground">
                {gradeLabel}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground" dir="ltr">
              {report.url}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              آخر فحص: {formatTime(report.generatedAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:max-w-xs">
          {report.categories.slice(0, 4).map((c) => (
            <div
              key={c.category}
              className="rounded-lg border bg-card p-3 text-center"
            >
              <p className="text-xs text-muted-foreground">
                {categoryLabel(c.category)}
              </p>
              <p className="text-lg font-bold tabular-nums">
                {c.score}/100
              </p>
              <p className="text-[11px] text-muted-foreground">
                {c.passed}/{c.total} نجح
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function categoryLabel(c: string): string {
  if (c === "security") return "الأمان";
  if (c === "performance") return "الأداء";
  if (c === "seo") return "SEO";
  if (c === "dns") return "DNS";
  if (c === "uptime") return "Uptime";
  return c;
}
