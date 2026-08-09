import { getClients, getCategories, getAuthors, createArticle } from '../actions/articles-actions';
import { getTags } from '../../tags/actions/tags-actions';
import { getAllSettings } from '../../settings/actions/settings-actions';
import { getArticleDefaultsFromSettings } from '../../settings/helpers/get-article-defaults-from-settings';
import { loadSiteUrl } from '@/lib/seo/site-url';
import { ArticleFormProvider } from '../components/article-form-context';
import { ArticleFormLayout } from '../components/article-form-layout';
import { ArticleFormTabs } from '../components/article-form-tabs';

/**
 * `?clientSite=<clientId>` is how the «Client Articles» section hands the destination
 * over — there is no checkbox anywhere and no button that moves an article between
 * sections. The section IS the destination (Khalid 2026-08-08), so an article started
 * from there is marked for the client's own website at birth and gets its canonical
 * URL baked on their domain from the first save. The eligibility of that client is
 * re-checked server-side in createArticle; this only carries the intent.
 */
export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ clientSite?: string }>;
}) {
  const { clientSite } = await searchParams;

  const [clients, categories, authors, tags, settings, siteUrl] = await Promise.all([
    getClients(),
    getCategories(),
    getAuthors(),
    getTags(),
    getAllSettings(),
    loadSiteUrl(),
  ]);

  const settingsArticleDefaults = getArticleDefaultsFromSettings(settings);

  return (
    <ArticleFormProvider
      initialData={clientSite ? { clientId: clientSite, isClientSiteArticle: true } : undefined}
      settingsArticleDefaults={settingsArticleDefaults}
      onSubmit={createArticle}
      clients={clients}
      categories={categories}
      authors={authors}
      tags={tags}
      siteUrl={siteUrl}
    >
      <ArticleFormLayout>
        <ArticleFormTabs />
      </ArticleFormLayout>
    </ArticleFormProvider>
  );
}
