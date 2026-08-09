import { redirect } from "next/navigation";
import { Globe, ExternalLink, Star } from "lucide-react";

import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";

import { loadSiteArticles } from "./helpers/load-site-articles";
import { PullAddressPanel } from "./components/pull-address-panel";
import { SiteSeoCheck } from "./components/site-seo-check";

export const dynamic = "force-dynamic";

function formatMoment(value: Date | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function SiteArticlesPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string } | null)?.clientId;
  if (!clientId) redirect("/");

  const data = await loadSiteArticles(clientId);
  if (!data.enabled) redirect("/dashboard");

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Globe className="h-5 w-5 text-violet-600" aria-hidden="true" />
          مقالاتك على موقعك
        </h1>
        <p className="text-sm text-muted-foreground">
          هذي المقالات اللي نكتبها لك وتُنشر على موقعك أنت، مو على مودونتي. الصفحة للعرض فقط.
        </p>
      </div>

      <PullAddressPanel
        clientId={clientId}
        articlesBaseUrl={data.articlesBaseUrl}
        suspended={data.keySuspended}
        lastFetchedAt={data.lastFetchedAt ? formatMoment(data.lastFetchedAt) : null}
      />

      {data.articlesBaseUrl && <SiteSeoCheck articlesBaseUrl={data.articlesBaseUrl} />}

      {data.articles.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          ما فيه مقال منشور على موقعك بعد. أول ما توافق على مقال وننشره، يظهر هنا.
        </Card>
      ) : (
        <Card className="divide-y overflow-hidden">
          {data.articles.map((article) => (
            <div key={article.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {article.isMain && (
                    <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" aria-label="المقال الرئيسي" />
                  )}
                  <span className="truncate font-medium">{article.title}</span>
                </div>
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 truncate font-mono text-[11px] text-violet-700 hover:underline dark:text-violet-300"
                    dir="ltr"
                  >
                    {article.url}
                    <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                  </a>
                )}
              </div>
              <div className="shrink-0 text-xs text-muted-foreground">
                <div>نُشر: {formatMoment(article.publishedAt)}</div>
                <div>آخر تعديل: {formatMoment(article.updatedAt)}</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        أي تعديل نسوّيه على مقال يظهر على موقعك خلال ساعة كحدّ أقصى — موقعك يسحب المحتوى منّا
        ويحتفظ به ساعة قبل ما يسأل من جديد.
      </p>
    </div>
  );
}
