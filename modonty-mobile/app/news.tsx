import { ArticleCard } from '@/components/content/ArticleCard';
import { Header } from '@/components/ui/Header';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { usePagedList } from '@/hooks/usePagedList';
import { fromArticleResponse } from '@/lib/article-response';
import type { ArticleCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { moreContentApi } from '@/services/api-content';

/** S32 — آخر الأخبار (C19 news — getArticles الأحدث من كل الناشرين، كصفحة /news). */
export default function NewsScreen() {
  const list = usePagedList<ArticleCardModel, number>(async (page, signal) => {
    const p = page ?? 1;
    const d = await moreContentApi.news(p, signal);
    return { items: d.items.map(fromArticleResponse), next: d.hasMore ? p + 1 : null };
  }, []);
  return (
    <Screen>
      <Header back title="آخر الأخبار" />
      <PagedList list={list} renderItem={({ item }) => <ArticleCard item={item} onOpen={open.article} />} keyOf={(a) => a.key} what="الأخبار" empty={{ icon: 'articles', title: 'لا أخبار بعد' }} />
    </Screen>
  );
}
