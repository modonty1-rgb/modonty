import { useCallback, type ReactElement } from 'react';

import { ArticleCard } from '@/components/content/ArticleCard';
import { PagedList } from '@/components/ui/PagedList';
import { usePagedList } from '@/hooks/usePagedList';
import { toArticleCard, type ArticleCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { contentApi } from '@/services/api';

/**
 * مقالات تصنيف أو وسم: الأرشيف مفلتراً (C3)، وهو نفس الرابط الذي تفتحه صفحة الويب («اقرأ المقالات»).
 */
export function ArchiveForTerm({ filter, header, what }: { filter: { category?: string; tag?: string }; header: ReactElement | null; what: string }) {
  const list = usePagedList<ArticleCardModel, number>(
    async (page, signal) => {
      const p = page ?? 1;
      const d = await contentApi.archive({ page: p, ...filter }, signal);
      return { items: d.items.map(toArticleCard), next: d.hasMore ? p + 1 : null };
    },
    [filter.category, filter.tag],
  );
  const renderItem = useCallback(({ item }: { item: ArticleCardModel }) => <ArticleCard item={item} onOpen={open.article} />, []);
  return (
    <PagedList
      list={list}
      renderItem={renderItem}
      keyOf={(a) => a.key}
      what={what}
      header={header}
      empty={{ icon: 'articles', title: 'لا مقالات منشورة هنا بعد' }}
    />
  );
}
