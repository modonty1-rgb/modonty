import { redirect } from "next/navigation";
import { getArticleById } from "../actions/articles-actions";
import { getAllSettings } from "../../settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "../../settings/helpers/get-article-defaults-from-settings";
import { ArticleViewContainer } from "./components/article-view-container";
import { Building2, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FieldLabel } from "./components/shared/field-label";
import { ArticleSEOGuidance } from "./components/article-seo-guidance";
import { ArticleSEOScoreBadge } from "./components/article-seo-score-badge";
import { ArticleViewNavigationWrapper } from "./components/article-view-navigation-wrapper";
import { ArticleViewProvider } from "./components/article-view-provider";
import { DeleteArticleButton } from "./components/delete-article-button";
import { EditArticleButton } from "./components/edit-article-button";

export default async function ArticleViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, settings] = await Promise.all([getArticleById(id), getAllSettings()]);

  if (!article) {
    redirect("/articles");
  }

  const articleDefaults = getArticleDefaultsFromSettings(settings);
  const articleWithDefaults = { ...article, ...articleDefaults };

  return (
    <ArticleViewProvider article={articleWithDefaults}>
      <div className="container mx-auto max-w-[1128px] pt-4">
        <ArticleViewNavigationWrapper />
        <div className="flex items-center justify-between mb-6 mt-6">
          <div className="flex items-center gap-2">
            {articleWithDefaults.client?.name ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-2xl px-4 py-2 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors font-semibold">
                  <Building2 className="h-5 w-5 mr-2" />
                  {articleWithDefaults.client.name}
                </Badge>
                <FieldLabel
                  label=""
                  fieldPath="article.client"
                  fieldType="Client"
                  idValue={articleWithDefaults.client.id}
                  idLabel="Client ID"
                />
                <FieldLabel
                  label="Article ID"
                  fieldPath="article.id"
                  fieldType="String @id @db.ObjectId"
                  idValue={articleWithDefaults.id}
                  idLabel="Article ID"
                />
              </div>
            ) : (
              <h1 className="text-2xl font-semibold leading-tight">Article Details</h1>
            )}
          </div>
          <div className="flex items-center gap-4">
            <ArticleSEOScoreBadge article={articleWithDefaults} />
            <div className="flex gap-2">
              <Button variant="outline" size="icon" asChild title="Back to list">
                <Link href="/articles">
                  <FileText className="h-4 w-4" />
                </Link>
              </Button>
              <EditArticleButton articleId={articleWithDefaults.id} />
              <DeleteArticleButton articleId={articleWithDefaults.id} />
              <Button variant="default" size="icon" asChild title="View public">
                <Link href={`/articles/${articleWithDefaults.id}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
      </div>
      <ArticleViewContainer article={articleWithDefaults} />
      </div>
    </ArticleViewProvider>
  );
}
