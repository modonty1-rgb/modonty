import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getArticleForApproval } from "../../helpers/article-queries";
import { ArticlePreviewClient } from "../../components/article-preview-client";

export const dynamic = "force-dynamic";

export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) {
    redirect("/");
  }

  const { articleId } = await params;
  const article = await getArticleForApproval(articleId, clientId);

  if (!article) {
    redirect("/dashboard/articles");
  }

  return <ArticlePreviewClient article={article} clientId={clientId} />;
}
