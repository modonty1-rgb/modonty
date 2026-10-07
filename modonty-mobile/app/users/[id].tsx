import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ArticleCard } from '@/components/content/ArticleCard';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { SimpleList } from '@/components/ui/SimpleList';
import { fullDate } from '@/lib/format';
import { articleRow, type ArticleCardModel } from '@/lib/models';
import { open } from '@/lib/nav';
import { moreContentApi } from '@/services/api-content';
import type { PublicUserData } from '@/services/api-types-content';
import { control, radius, space } from '@/theme/tokens';

/** S30 — صفحة مستخدم عامّة (V3 — users/[id]): الاسم والصورة وتاريخ الانضمام فقط، والبريد لا يُرسل أبداً. */
export default function PublicUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [d, setD] = useState<PublicUserData | null>(null);
  return (
    <Screen>
      <Header back title={d?.user.name ?? undefined} />
      <SimpleList<ArticleCardModel>
        deps={[id]}
        load={async (signal) => {
          const data = await moreContentApi.user(id, signal);
          setD(data);
          return data.articles.map((a) => articleRow({ id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt, date: a.datePublished, publisher: a.client.name }));
        }}
        renderItem={({ item }) => <ArticleCard item={item} onOpen={open.article} layout="row" />}
        keyOf={(a) => a.key}
        what="الملف"
        skeleton="row"
        header={
          d ? (
            <View style={styles.head}>
              {d.user.image ? <Image source={d.user.image} style={styles.avatar} contentFit="cover" /> : <Icon name="profile" size={control.iconLarge} />}
              {d.user.name ? <AppText variant="pageTitle">{d.user.name}</AppText> : null}
              <AppText variant="secondary" tone="muted">{`عضو منذ ${fullDate(d.user.createdAt) ?? ''}`}</AppText>
              {d.author ? <Button label={`صفحة الكاتب: ${d.author.name}`} kind="outlined" compact onPress={() => open.author(d.author!.slug)} /> : null}
            </View>
          ) : null
        }
        empty={{ icon: 'profile', title: 'لا مقالات منشورة' }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: space.xs, padding: space.screen },
  avatar: { width: control.avatarLarge, height: control.avatarLarge, borderRadius: radius.pill },
});
