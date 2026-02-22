import { auth } from "@/lib/auth";
import { ar } from "@/lib/ar";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  getClientArticles,
  getMonthlyArticleCount,
} from "./helpers/content-queries";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return null;

  const [client, articles, monthlyPublished] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: { name: true, articlesPerMonth: true },
    }),
    getClientArticles(clientId),
    getMonthlyArticleCount(clientId),
  ]);

  if (!client) return null;

  const quota = client.articlesPerMonth ?? 0;
  const quotaUsed = monthlyPublished;
  const quotaLabel = quota > 0 ? `${quotaUsed} / ${quota}` : `${quotaUsed} ${ar.content.thisMonth}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {ar.nav.content}
        </h1>
        <p className="text-muted-foreground mt-1">
          {ar.content.articlesProgress}
        </p>
      </div>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">{ar.content.monthlyQuota}</CardTitle>
          <CardDescription>{ar.content.publishedThisMonth}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium text-foreground">{quotaLabel}</p>
          {quota > 0 && (
            <div className="mt-2 h-2 w-full max-w-xs rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (quotaUsed / quota) * 100)}%`,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">{ar.content.recentArticles}</CardTitle>
          <CardDescription>{ar.content.yourContentLibrary}</CardDescription>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <p className="text-sm text-muted-foreground">{ar.dashboard.noArticles}</p>
          ) : (
            <ul className="space-y-3">
              {articles.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.category?.name ?? "—"} · {a.status} ·{" "}
                      {a.datePublished
                        ? new Date(a.datePublished).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {a.slug}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
