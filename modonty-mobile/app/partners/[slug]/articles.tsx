import { useLocalSearchParams } from 'expo-router';

import { ArticleCard } from '@/components/content/ArticleCard';
import { Header } from '@/components/ui/Header';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { usePagedList } from '@/hooks/usePagedList';
import { articleRow, type ArticleCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { moreContentApi } from '@/services/api-content';

/** S09c — مقالات الشريك (C13 — كتلة مقالاته كما صفحة الويب /clients/[slug]/articles). */
export default function PartnerArticlesScreen() {
  const { slug, name } = useLocalSearchParams<{ slug: string; name?: string }>();
  const list = usePagedList<ArticleCardModel, number>(
    async (page, signal) => {
      const p = page ?? 1;
      const d = await moreContentApi.partnerArticles(slug, p, signal);
      return { items: d.items.map((a) => articleRow({ slug: a.slug, title: a.title, excerpt: a.excerpt, image: a.imageUrl, dateLabel: a.date, publisher: a.category })), next: d.hasMore ? p + 1 : null };
    },
    [slug],
  );
  return (
    <Screen>
      <Header back title={name ? `مقالات ${name}` : 'المقالات'} />
      <PagedList list={list} renderItem={({ item }) => <ArticleCard item={item} onOpen={open.article} />} keyOf={(a) => a.key} what="المقالات" empty={{ icon: 'articles', title: 'لا مقالات منشورة بعد' }} />
    </Screen>
  );
}
