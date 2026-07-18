import { redirect } from "next/navigation";
import { getArticleById, getClients, getCategories, getAuthors, createArticle } from "../../actions/articles-actions";
import { getTags } from "../../../tags/actions/tags-actions";
import { getAllSettings } from "../../../settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "../../../settings/helpers/get-article-defaults-from-settings";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { db } from "@/lib/db";
import { getArticleSeoScore, ARTICLE_SEO_SELECT } from "@/lib/seo/article-seo-score";
import { ArticleFormProvider } from "../../components/article-form-context";
import { ArticleFormLayout } from "../../components/article-form-layout";
import { ArticleFormTabs } from "../../components/article-form-tabs";
import { transformArticleToFormData } from "../../helpers/article-form-helpers";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [article, clients, categories, authors, tags, settings, siteUrl, seoRow] = await Promise.all([
    getArticleById(id),
    getClients(),
    getCategories(),
    getAuthors(),
    getTags(),
    getAllSettings(),
    loadSiteUrl(),
    // Real SEO score from the SHARED scorer — the same number the tables and dashboard
    // show. Read the STORED fields (ARTICLE_SEO_SELECT), never the draft form, so the
    // "SEO %" on this page can never disagree with the list.
    db.article.findUnique({ where: { id }, select: ARTICLE_SEO_SELECT }),
  ]);

  if (!article) {
    redirect("/articles");
  }

  const realSeoScore = seoRow ? getArticleSeoScore(seoRow) : 0;

  const transformedData = transformArticleToFormData(article);
  const settingsArticleDefaults = getArticleDefaultsFromSettings(settings);
  const initialData = { ...transformedData, ...settingsArticleDefaults };

  const dbMetaAndJsonLd = {
    nextjsMetadata: (article.nextjsMetadata ?? null) as Record<string, unknown> | null,
    jsonLdStructuredData: article.jsonLdStructuredData ?? null,
  };

  return (
    <ArticleFormProvider
      initialData={initialData}
      settingsArticleDefaults={settingsArticleDefaults}
      dbMetaAndJsonLd={dbMetaAndJsonLd}
      realSeoScore={realSeoScore}
      onSubmit={createArticle}
      clients={clients}
      categories={categories}
      authors={authors}
      tags={tags}
      articleId={id}
      siteUrl={siteUrl}
    >
      <ArticleFormLayout>
        <ArticleFormTabs />
      </ArticleFormLayout>
    </ArticleFormProvider>
  );
}
