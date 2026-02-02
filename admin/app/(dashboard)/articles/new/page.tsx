import { getClients, getCategories, getAuthors, createArticle } from '../actions/articles-actions';
import { getTags } from '../../tags/actions/tags-actions';
import { getAllSettings } from '../../settings/actions/settings-actions';
import { getArticleDefaultsFromSettings } from '../../settings/helpers/get-article-defaults-from-settings';
import { ArticleFormProvider } from '../components/article-form-context';
import { ArticleFormNavigation } from '../components/article-form-navigation';
import { ArticleFormTabs } from '../components/article-form-tabs';

export default async function NewArticlePage() {
  const [clients, categories, authors, tags, settings] = await Promise.all([
    getClients(),
    getCategories(),
    getAuthors(),
    getTags(),
    getAllSettings(),
  ]);

  const settingsArticleDefaults = getArticleDefaultsFromSettings(settings);

  return (
    <ArticleFormProvider
      initialData={undefined}
      settingsArticleDefaults={settingsArticleDefaults}
      onSubmit={createArticle}
      clients={clients}
      categories={categories}
      authors={authors}
      tags={tags}
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
