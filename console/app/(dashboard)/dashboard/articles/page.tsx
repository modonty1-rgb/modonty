import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
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

  const [pendingArticles, publishedArticles, allArticles, pendingCount] =
    await Promise.all([
      getPendingArticles(clientId),
      getPublishedArticles(clientId),
      getAllArticles(clientId),
      getPendingArticlesCount(clientId),
    ]);

  return (
    <ArticlesPageClient
      pendingArticles={pendingArticles}
      publishedArticles={publishedArticles}
      allArticles={allArticles}
      pendingCount={pendingCount}
      initialTab={tab}
    />
  );
}
