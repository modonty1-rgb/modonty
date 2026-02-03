import { redirect } from "next/navigation";
import { getArticleById, getClients, getCategories, getAuthors, createArticle } from "../../actions/articles-actions";
import { getTags } from "../../../tags/actions/tags-actions";
import { getAllSettings } from "../../../settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "../../../settings/helpers/get-article-defaults-from-settings";
import { ArticleFormProvider } from "../../components/article-form-context";
import { ArticleFormNavigation } from "../../components/article-form-navigation";
import { ArticleFormTabs } from "../../components/article-form-tabs";
import { transformArticleToFormData } from "../../helpers/article-form-helpers";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [article, clients, categories, authors, tags, settings] = await Promise.all([
    getArticleById(id),
    getClients(),
    getCategories(),
    getAuthors(),
    getTags(),
    getAllSettings(),
  ]);

  if (!article) {
    redirect("/articles");
  }

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
      onSubmit={createArticle}
      clients={clients}
      categories={categories}
      authors={authors}
      tags={tags}
      articleId={id}
    >
      <div className="container mx-auto max-w-[1128px] px-4 md:px-6 pb-6 md:pb-8">
        <ArticleFormNavigation />
        <div className="mt-6">
          <ArticleFormTabs />
        </div>
      </div>
    </ArticleFormProvider>
  );
}
