import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";
import {
  getPendingArticles,
  getPublishedArticles,
  getAllArticles,
  getPendingArticlesCount,
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

  const [pendingArticles, publishedArticles, allArticles, pendingCount, settings, client] =
    await Promise.all([
      getPendingArticles(clientId),
      getPublishedArticles(clientId),
      getAllArticles(clientId),
      getPendingArticlesCount(clientId),
      db.settings.findUnique({ where: SETTINGS_SINGLETON_WHERE, select: { siteUrl: true } }),
      // Admin-controlled switch for the «مجدولة» tab. Read, never filtered on — clients
      // saved before the field existed have the key absent in Mongo, and Prisma answers
      // those with the schema default (true), which is the behaviour they already have.
      db.client.findUnique({ where: { id: clientId }, select: { showSchedule: true } }),
    ]);

  const siteUrl = settings?.siteUrl ?? "";
  const showSchedule = client?.showSchedule ?? true;

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
      pendingCount={pendingCount}
      initialTab={tab}
      siteUrl={siteUrl}
      showSchedule={showSchedule}
    />
  );
}
