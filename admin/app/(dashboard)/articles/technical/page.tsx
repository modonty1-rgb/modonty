import Link from "next/link";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Code,
} from "lucide-react";
import { getStatusLabel, getStatusVariant } from "../helpers/status-utils";

interface TechnicalArticleRow {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  datePublished: Date | null;
  updatedAt: Date;
  client: { name: string };
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  jsonLdStructuredData: string | null;
  jsonLdLastGenerated: Date | null;
}

function evaluateTechnicalHealth(a: TechnicalArticleRow) {
  const issues: string[] = [];
  if (!a.seoTitle?.trim()) issues.push("SEO Title");
  if (!a.seoDescription?.trim()) issues.push("SEO Description");
  if (!a.jsonLdStructuredData) issues.push("JSON-LD");

  const seoTitleOk = !!a.seoTitle && a.seoTitle.length >= 30 && a.seoTitle.length <= 60;
  const seoDescOk =
    !!a.seoDescription && a.seoDescription.length >= 120 && a.seoDescription.length <= 160;

  if (a.seoTitle && !seoTitleOk) issues.push("Title length");
  if (a.seoDescription && !seoDescOk) issues.push("Description length");

  if (issues.length === 0) return { status: "ok" as const, issues };
  if (issues.length <= 2) return { status: "warning" as const, issues };
  return { status: "critical" as const, issues };
}

export default async function TechnicalReviewListPage() {
  const articles = (await db.article.findMany({
    where: {
      status: { in: [ArticleStatus.DRAFT, ArticleStatus.AWAITING_APPROVAL, ArticleStatus.SCHEDULED, ArticleStatus.PUBLISHED] },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 200,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      datePublished: true,
      updatedAt: true,
      client: { select: { name: true } },
      seoTitle: true,
      seoDescription: true,
      canonicalUrl: true,
      jsonLdStructuredData: true,
      jsonLdLastGenerated: true,
    },
  })) as TechnicalArticleRow[];

  const evaluated = articles.map((a) => ({ a, h: evaluateTechnicalHealth(a) }));
  const okCount = evaluated.filter((x) => x.h.status === "ok").length;
  const warningCount = evaluated.filter((x) => x.h.status === "warning").length;
  const criticalCount = evaluated.filter((x) => x.h.status === "critical").length;

  // Sort: critical first, then warnings, then ok
  evaluated.sort((x, y) => {
    const rank = { critical: 0, warning: 1, ok: 2 } as const;
    return rank[x.h.status] - rank[y.h.status];
  });

  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Wrench className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Technical Review</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            مراجعة تقنية متقدّمة لكل مقال — Canonical · Robots · Open Graph · JSON-LD · Schema
            Diagnostics
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={Code}
          label="Total"
          value={articles.length}
          tone="neutral"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Healthy"
          value={okCount}
          tone="emerald"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Warnings"
          value={warningCount}
          tone="amber"
        />
        <KpiCard
          icon={XCircle}
          label="Critical"
          value={criticalCount}
          tone="red"
        />
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {evaluated.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-3" />
              <p className="text-sm font-medium">لا توجد مقالات تحتاج مراجعة تقنية</p>
              <p className="text-xs text-muted-foreground mt-1">
                كل المقالات المنشورة في حالة جيدة
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {evaluated.map(({ a, h }) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.id}/technical`}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  {/* Health indicator */}
                  <div className="shrink-0">
                    {h.status === "ok" && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                    {h.status === "warning" && (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                    {h.status === "critical" && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <Badge variant={getStatusVariant(a.status)} className="text-[10px] shrink-0">
                        {getStatusLabel(a.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span>{a.client?.name || "—"}</span>
                      <span>·</span>
                      <span>
                        {a.datePublished
                          ? `Published: ${dateFmt.format(a.datePublished)}`
                          : `Updated: ${dateFmt.format(a.updatedAt)}`}
                      </span>
                      {h.issues.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-amber-600 dark:text-amber-400 truncate">
                            {h.issues.length} مشكلة: {h.issues.slice(0, 3).join(" · ")}
                            {h.issues.length > 3 && " ..."}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <Button asChild variant="ghost" size="sm" className="shrink-0 gap-1">
                    <span>
                      <span className="hidden sm:inline">فحص</span>
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </span>
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "neutral" | "emerald" | "amber" | "red";
}) {
  const toneClasses = {
    neutral: "bg-muted/50 text-muted-foreground",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
  } as const;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-md ${toneClasses[tone]}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold tabular-nums">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
