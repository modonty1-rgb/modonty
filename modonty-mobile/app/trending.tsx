import { useState } from 'react';

import { ArticleCard } from '@/components/content/ArticleCard';
import { ChipRow } from '@/components/ui/ChipRow';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SimpleList } from '@/components/ui/SimpleList';
import { fromArticleResponse } from '@/lib/article-response';
import type { ArticleCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { moreContentApi } from '@/services/api-content';

type Days = 7 | 14 | 30;
const PERIODS = [
  { value: '7', label: 'آخر أسبوع' },
  { value: '14', label: 'آخر أسبوعين' },
  { value: '30', label: 'آخر شهر' },
] as const;

/** S31 — الرائج (C19 — getTrendingArticles). */
export default function TrendingScreen() {
  const [days, setDays] = useState<Days>(7);
  return (
    <Screen>
      <Header back title="الرائج" />
      <SimpleList<ArticleCardModel>
        deps={[days]}
        load={async (signal) => (await moreContentApi.trending(days, signal)).items.map(fromArticleResponse)}
        header={<ChipRow label="الفترة" options={PERIODS} value={String(days) as '7' | '14' | '30'} onChange={(v) => setDays(Number(v) as Days)} />}
        renderItem={({ item }) => <ArticleCard item={item} onOpen={open.article} />}
        keyOf={(a) => a.key}
        what="الرائج"
        skeleton="card"
        empty={{ icon: 'trending', title: 'لا مقالات رائجة في هذه الفترة' }}
      />
    </Screen>
  );
}
