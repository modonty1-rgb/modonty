import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ar } from "@/lib/ar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { getArticleStats, getArticleComments, getArticleQuestions } from "./helpers/article-stats-queries";
import { getArticleForApproval } from "../helpers/article-queries";
import { CommentsTable } from "../../comments/components/comments-table";
import { QuestionsTable } from "../../questions/components/questions-table";

export const dynamic = "force-dynamic";

export default async function ArticleStatsPage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const { articleId } = await params;

  const [article, stats, comments, questions] = await Promise.all([
    getArticleForApproval(articleId, clientId),
    getArticleStats(articleId, clientId),
    getArticleComments(articleId, clientId),
    getArticleQuestions(articleId, clientId),
  ]);

  if (!article || !stats) redirect("/dashboard/articles");

  const a = ar.articleStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link href="/dashboard/articles">
            <Button variant="ghost" size="sm" className="gap-1 h-7 px-2">
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              {ar.articles.backToArticles}
            </Button>
          </Link>
        </div>
        <h1 className="text-xl font-semibold leading-tight text-foreground line-clamp-2">
          {article.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {article.category?.name ?? "—"} ·{" "}
          {article.datePublished
            ? new Date(article.datePublished).toLocaleDateString("ar-SA")
            : new Date(article.createdAt).toLocaleDateString("ar-SA")}
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">{a.views}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <p className="text-2xl font-semibold tabular-nums">{stats.viewsCount.toLocaleString("ar-SA")}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">{a.likes}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <p className="text-2xl font-semibold tabular-nums">{stats.likesCount.toLocaleString("ar-SA")}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-orange-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">{a.dislikes}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <p className="text-2xl font-semibold tabular-nums">{stats.dislikesCount.toLocaleString("ar-SA")}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">{a.comments}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <p className="text-2xl font-semibold tabular-nums">{stats.commentsCount.toLocaleString("ar-SA")}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">{a.questions}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <p className="text-2xl font-semibold tabular-nums">{stats.questionsCount.toLocaleString("ar-SA")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Comments */}
      <CommentsTable comments={comments} clientId={clientId} />

      {/* Questions */}
      <QuestionsTable questions={questions} clientId={clientId} />
    </div>
  );
}
