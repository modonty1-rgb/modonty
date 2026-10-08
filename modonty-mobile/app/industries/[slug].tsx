import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { ArticleCard } from '@/components/content/ArticleCard';
import { TermHeader } from '@/components/content/TermHeader';
import { Header } from '@/components/ui/Header';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { usePagedList } from '@/hooks/usePagedList';
import { plainNumber } from '@/lib/format';
import { toArticleCard, type ArticleCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { contentApi } from '@/services/api';
import type { IndustryData } from '@/services/api-types';

/** S07b — صفحة مجال (C10b): المجال وشركاؤه في الصفحة الأولى، ثم صفحات فيده. */
export default function IndustryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [info, setInfo] = useState<Omit<IndustryData, 'articles'> | null>(null);
  const list = usePagedList<ArticleCardModel, number>(
    async (page, signal) => {
      const p = page ?? 1;
      const d = await contentApi.industry(slug, p, signal);
      if (p === 1) setInfo({ industry: d.industry, partners: d.partners });
      return { items: d.articles.items.map(toArticleCard), next: d.articles.hasMore ? p + 1 : null };
    },
    [slug],
  );
  const renderItem = useCallback(({ item }: { item: ArticleCardModel }) => <ArticleCard item={item} onOpen={open.article} />, []);
  return (
    <Screen>
      <Header back title={info?.industry.name} />
      <PagedList
        list={list}
        renderItem={renderItem}
        keyOf={(a) => a.key}
        what="المجال"
        header={
          info ? (
            <TermHeader
              name={info.industry.name}
              description={info.industry.description}
              image={info.industry.socialImage}
              imageAlt={info.industry.socialImageAlt}
              meta={`${plainNumber(info.partners.length)} شريك`}
              partners={info.partners.map((p) => ({ id: p.id, name: p.name, slug: p.slug, logo: p.logo, line: p.credential ?? p.city }))}
            />
          ) : null
        }
        empty={{ icon: 'articles', title: 'لا مقالات في هذا المجال بعد' }}
      />
    </Screen>
  );
}
