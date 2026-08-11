import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";
import {
  getPendingArticles,
  getPublishedArticles,
  getAllArticles,
  getSiteArticles,
  getPendingArticlesCount,
  getMonthlyPublishedCount,
} from "./helpers/article-queries";
import { ArticlesPageClient } from "./components/articles-page-client";

export const dynamic = "force-dynamic";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) {
    redirect("/");
  }

  const params = await searchParams;
  const tab = params.tab || "pending";

  const [
    pendingArticles,
    publishedArticles,
    allArticles,
    siteArticles,
    pendingCount,
    monthlyPublished,
    settings,
    client,
  ] = await Promise.all([
    getPendingArticles(clientId),
    getPublishedArticles(clientId),
    getAllArticles(clientId),
    // Fetched unconditionally rather than after reading the permission: gating it would
    // put the client read in front of the article read, and a waterfall costs more than
    // an indexed query that answers with nothing for a client without the feature.
    getSiteArticles(clientId),
    getPendingArticlesCount(clientId),
    getMonthlyPublishedCount(clientId),
    db.settings.findUnique({ where: SETTINGS_SINGLETON_WHERE, select: { siteUrl: true } }),
    // Admin-controlled switch for the «مجدولة» tab. Read, never filtered on — clients
    // saved before the field existed have the key absent in Mongo, and Prisma answers
    // those with the schema default (true), which is the behaviour they already have.
    db.client.findUnique({
      where: { id: clientId },
      select: { showSchedule: true, canPublishToOwnSite: true, articlesPerMonth: true },
    }),
  ]);

  const siteUrl = settings?.siteUrl ?? "";
  // Formatted here, never in the browser: the reset day is derived from «now», and a
  // client component would compute it against the visitor's clock and mismatch on hydration.
  const now = new Date();
  const quotaResetDate = new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(now.getFullYear(), now.getMonth() + 1, 1));
  const showSchedule = client?.showSchedule ?? true;
  // The permission decides the tab, not the article count — a client who was just
  // switched on must find the tab (empty) before their first piece is published.
  const canSeeSiteArticles = client?.canPublishToOwnSite ?? false;

  // Hiding the tab is not hiding the schedule: «كل المقالات» lists every status, so a
  // client with the switch off could still read the scheduled pieces and their dates
  // there. Filtered on the SERVER rather than in the tab component so the rows never
  // reach the browser at all.
  const visibleArticles = showSchedule
    ? allArticles
    : allArticles.filter((a) => a.status !== "SCHEDULED");

  return (
    <ArticlesPageClient
      pendingArticles={pendingArticles}
      publishedArticles={publishedArticles}
      allArticles={visibleArticles}
      siteArticles={siteArticles}
      canSeeSiteArticles={canSeeSiteArticles}
      pendingCount={pendingCount}
      monthlyPublished={monthlyPublished}
      monthlyQuota={client?.articlesPerMonth ?? 0}
      quotaResetDate={quotaResetDate}
      initialTab={tab}
      siteUrl={siteUrl}
      showSchedule={showSchedule}
    />
  );
}
