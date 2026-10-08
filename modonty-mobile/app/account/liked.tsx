import { InfoRow } from '@/components/content/InfoRow';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SimpleList } from '@/components/ui/SimpleList';
import { cardDate } from '@/lib/format';
import { open } from '@/lib/nav';
import { meApi } from '@/services/api-actions';
import type { MeLikedData } from '@/services/api-types-actions';

type Item = MeLikedData['items'][number];
const KIND = { article: 'مقال', client: 'شريك', comment: 'تعليق' } as const;

/** S19 — ما أعجبني (A13 liked — getProfileLiked): مقالات وشركاء وتعليقات. */
export default function LikedScreen() {
  return (
    <Screen>
      <Header back title="ما أعجبني" />
      <SimpleList<Item>
        load={async (signal) => (await meApi.liked(signal)).items}
        renderItem={({ item }) => (
          <InfoRow
            icon={item.type === 'client' ? 'partner' : item.type === 'comment' ? 'comment' : 'articles'}
            title={item.item.title ?? item.item.name ?? ''}
            body={item.item.excerpt ?? item.item.description}
            badge={KIND[item.type]}
            meta={[item.item.client?.name, cardDate(item.likedAt)].filter(Boolean).join('، ')}
            onPress={item.type === 'client' ? () => open.partner(item.item.slug) : item.type === 'article' ? () => open.article(item.item.slug) : undefined}
          />
        )}
        keyOf={(i) => i.id}
        what="إعجاباتك"
        empty={{ icon: 'like', title: 'لم يعجبك شيء بعد', body: 'اضغط «أعجبني» على مقال ليظهر هنا.' }}
      />
    </Screen>
  );
}
