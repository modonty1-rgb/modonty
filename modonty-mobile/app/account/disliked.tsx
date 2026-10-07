import { InfoRow } from '@/components/content/InfoRow';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SimpleList } from '@/components/ui/SimpleList';
import { cardDate } from '@/lib/format';
import { open } from '@/lib/nav';
import { meApi } from '@/services/api-actions';
import type { MeDislikedData } from '@/services/api-types-actions';

type Item = MeDislikedData['items'][number];
const KIND = { article: 'مقال', client: 'شريك', comment: 'تعليق' } as const;

/** S20 — ما لم يعجبني (getProfileDisliked). */
export default function DislikedScreen() {
  return (
    <Screen>
      <Header back title="ما لم يعجبني" />
      <SimpleList<Item>
        load={async (signal) => (await meApi.disliked(signal)).items}
        renderItem={({ item }) => {
          const articleSlug = item.type === 'comment' ? item.item.article?.slug : item.type === 'article' ? item.item.slug : undefined;
          return (
            <InfoRow
              icon={item.type === 'client' ? 'partner' : item.type === 'comment' ? 'comment' : 'dislike'}
              title={item.item.title ?? item.item.name ?? item.item.article?.title ?? ''}
              body={item.item.content ?? item.item.excerpt ?? item.item.description}
              badge={KIND[item.type]}
              meta={cardDate(item.dislikedAt)}
              onPress={item.type === 'client' && item.item.slug ? () => open.partner(item.item.slug!) : articleSlug ? () => open.article(articleSlug) : undefined}
            />
          );
        }}
        keyOf={(i) => i.id}
        what="القائمة"
        empty={{ icon: 'dislike', title: 'القائمة فارغة' }}
      />
    </Screen>
  );
}
