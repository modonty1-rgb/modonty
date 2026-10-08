import { ArticleCard } from '@/components/content/ArticleCard';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SimpleList } from '@/components/ui/SimpleList';
import { articleRow, type ArticleCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { accountApi } from '@/services/api';
import { router } from 'expo-router';

/** S17 — المقالات المحفوظة (A13 favorites — getProfileFavorites). */
export default function FavoritesScreen() {
  return (
    <Screen>
      <Header back title="المقالات المحفوظة" />
      <SimpleList<ArticleCardModel>
        load={async (signal) =>
          (await accountApi.favorites(signal)).items.map((f) =>
            articleRow({ id: f.id, slug: f.slug, title: f.title, excerpt: f.excerpt, image: f.featuredImage?.bunnyUrl ?? f.featuredImage?.url ?? null, imageBlur: f.featuredImage?.blurDataURL, publisher: f.client.name, date: f.favoritedAt }),
          )
        }
        renderItem={({ item }) => <ArticleCard item={item} onOpen={open.article} layout="row" />}
        keyOf={(a) => a.key}
        what="المحفوظات"
        empty={{ icon: 'bookmark', title: 'لم تحفظ مقالاً بعد', body: 'اضغط «حفظ» أسفل أي مقال ليظهر هنا.', actionLabel: 'تصفّح المقالات', onAction: () => router.push('/articles') }}
      />
    </Screen>
  );
}
