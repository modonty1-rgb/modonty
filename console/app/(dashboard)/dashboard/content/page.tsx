import { auth } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, FilePlus2, FileEdit, CalendarClock, ExternalLink, ArrowLeft, Sparkles } from "lucide-react";
import { getMonthlyArticleCount, getContentOverview } from "./helpers/content-queries";

export const dynamic = "force-dynamic";

function formatArabicDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(d));
}

function getMonthResetDate() {
  const now = new Date();
  // First day of NEXT month
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

export default async function ContentPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return null;

  const [client, monthlyPublished, overview, settings] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: { name: true, articlesPerMonth: true },
    }),
    getMonthlyArticleCount(clientId),
    getContentOverview(clientId),
    db.settings.findFirst({ select: { siteUrl: true } }),
  ]);

  if (!client) return null;

  const quota = client.articlesPerMonth ?? 0;
  const remaining = Math.max(0, quota - monthlyPublished);
  const progressPct = quota > 0 ? Math.min(100, Math.round((monthlyPublished / quota) * 100)) : 0;
  const resetDate = getMonthResetDate();
  const siteUrl = settings?.siteUrl ?? "";
  const totalPipeline = overview.pipeline.draft + overview.pipeline.writing + overview.pipeline.scheduled;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">نشاط المحتوى</h1>
        <p className="text-muted-foreground mt-1">
          نظرة شاملة على رصيدك الشهري، خطّ الإنتاج، وآخر المقالات المنشورة.
        </p>
      </header>

      {/* ─── Monthly Quota — clear, friendly ────────────────────────────── */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold">رصيدك من المقالات هذا الشهر</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {quota > 0 ? (
                  <>
                    نُشِر <span className="font-bold text-foreground tabular-nums">{monthlyPublished}</span>{" "}
                    من <span className="font-bold text-foreground tabular-nums">{quota}</span> مقال —
                    متبقّي <span className="font-bold text-emerald-700 tabular-nums">{remaining}</span>
                  </>
                ) : (
                  <>نُشر <span className="font-bold text-foreground">{monthlyPublished}</span> مقال هذا الشهر</>
                )}
              </p>
            </div>
            {quota > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">يُجدَّد في </span>
                <span className="font-medium">{formatArabicDate(resetDate)}</span>
              </div>
            )}
          </div>

          {quota > 0 && (
            <div className="mt-4">
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    progressPct >= 100 ? "bg-emerald-500" : "bg-primary"
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground tabular-nums">{progressPct}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Stats grid: Total + Pipeline breakdown ─────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Newspaper}
          label="مقالات منشورة"
          value={overview.totalPublished}
          tone="emerald"
        />
        <StatCard
          icon={FileEdit}
          label="قيد الكتابة"
          value={overview.pipeline.writing}
          tone="primary"
        />
        <StatCard
          icon={FilePlus2}
          label="مسودات"
          value={overview.pipeline.draft}
          tone="amber"
        />
        <StatCard
          icon={CalendarClock}
          label="مجدولة للنشر"
          value={overview.pipeline.scheduled}
          tone="violet"
        />
      </div>

      {/* ─── Next scheduled — only when something is queued ────────────── */}
      {overview.nextScheduled && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">المقال القادم</p>
                <h3 className="text-base font-bold leading-tight">{overview.nextScheduled.title}</h3>
                <p className="text-xs text-muted-foreground">
                  يُنشر في {formatArabicDate(overview.nextScheduled.datePublished)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Pipeline empty state ─────────────────────────────────────── */}
      {totalPipeline === 0 && overview.totalPublished === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Newspaper className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-bold">لا يوجد محتوى بعد</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              فريق مودونتي يبدأ بكتابة محتواك بمجرد اكتمال معلومات نشاطك.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/dashboard/seo/intake">
                إكمال معلومات نشاطك
                <ArrowLeft className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─── Latest published — quick glance + link to full list ──────── */}
      {overview.latest.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">آخر المقالات المنشورة</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/articles">
                  عرض الكل
                  <ArrowLeft className="ms-1 h-3 w-3 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {overview.latest.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {a.featuredImage?.url ? (
                      <Image
                        src={a.featuredImage.url}
                        alt={a.featuredImage.altText ?? a.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.category?.name ?? "—"} · {formatArabicDate(a.datePublished)}
                    </p>
                  </div>
                  {siteUrl && (
                    <a
                      href={`${siteUrl}/articles/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-1 text-xs text-primary hover:underline"
                    >
                      عرض
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── StatCard sub-component ──────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "emerald" | "primary" | "amber" | "violet";
}) {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    primary: "bg-primary/10 text-primary ring-primary/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${toneClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-tight tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
