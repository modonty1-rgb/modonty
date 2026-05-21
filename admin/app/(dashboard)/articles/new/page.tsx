import { getClients, getCategories, getAuthors, createArticle } from '../actions/articles-actions';
import { getTags } from '../../tags/actions/tags-actions';
import { getAllSettings } from '../../settings/actions/settings-actions';
import { getArticleDefaultsFromSettings } from '../../settings/helpers/get-article-defaults-from-settings';
import { ArticleFormProvider } from '../components/article-form-context';
import { ArticleFormTabs } from '../components/article-form-tabs';
import { ArticleFormActionBar } from '../components/article-form-action-bar';

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
      <div className="pb-6 md:pb-8">
        <ArticleFormTabs />
      </div>
      <ArticleFormActionBar />
    </ArticleFormProvider>
  );
}
