import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ArticleCard } from '@/components/content/ArticleCard';
import { AppText } from '@/components/ui/AppText';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { PagedList } from '@/components/ui/PagedList';
import { Screen } from '@/components/ui/Screen';
import { usePagedList } from '@/hooks/usePagedList';
import { articleRow, type ArticleCardModel } from '@/lib/models';
import { open, openExternal } from '@/lib/nav';
import { moreContentApi } from '@/services/api-content';
import type { AuthorData } from '@/services/api-types-content';
import { control, radius, space } from '@/theme/tokens';

/** S29 — صفحة الكاتب (C18): التعريف · الاعتمادات · الروابط · مقالاته. */
export default function AuthorScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [info, setInfo] = useState<Omit<AuthorData, 'articles' | 'page' | 'hasMore'> | null>(null);
  const list = usePagedList<ArticleCardModel, number>(
    async (page, signal) => {
      const p = page ?? 1;
      const d = await moreContentApi.author(slug, p, signal);
      if (p === 1) setInfo({ author: d.author, isOrganization: d.isOrganization, socialLinks: d.socialLinks });
      return { items: d.articles.map((a) => articleRow({ slug: a.slug, title: a.title, excerpt: a.excerpt, image: a.image, imageBlur: a.imageBlur, date: a.datePublished })), next: d.hasMore ? p + 1 : null };
    },
    [slug],
  );
  const a = info?.author;
  const links = a ? [...(info?.socialLinks ?? []).map((l) => ({ href: l.href, label: l.label })), ...[a.linkedIn, a.twitter, a.facebook, a.url].filter((x): x is string => !!x).map((href) => ({ href, label: href }))] : [];
  return (
    <Screen>
      <Header back title={a?.name} />
      <PagedList
        list={list}
        renderItem={({ item }) => <ArticleCard item={item} onOpen={open.article} layout="row" />}
        keyOf={(x) => x.key}
        what="صفحة الكاتب"
        header={
          a ? (
            <View style={styles.head}>
              <View style={styles.row}>
                {a.image ? <Image cachePolicy="memory-disk" source={a.image} style={styles.avatar} contentFit="cover" accessibilityLabel={a.imageAlt ?? a.name} /> : <Icon name="profile" size={control.iconLarge} />}
                <View style={styles.flex}>
                  <View style={styles.row}>
                    <AppText variant="pageTitle">{a.name}</AppText>
                    {a.verified ? <Icon name="trust" size={control.iconSmall} tone="interactive" /> : null}
                  </View>
                  {a.jobTitle ? (
                    <AppText variant="secondary" tone="muted">
                      {a.jobTitle}
                    </AppText>
                  ) : null}
                </View>
              </View>
              {a.bio ? <AppText variant="body">{a.bio}</AppText> : null}
              {a.credentials.length > 0 ? (
                <AppText variant="secondary" tone="muted">{`الاعتمادات: ${a.credentials.join('، ')}`}</AppText>
              ) : null}
              {a.expertiseAreas.length > 0 ? (
                <AppText variant="secondary" tone="muted">{`مجالات الخبرة: ${a.expertiseAreas.join('، ')}`}</AppText>
              ) : null}
              {links.length > 0 ? (
                <View style={styles.links}>
                  {links.map((l) => (
                    <IconButton key={l.href} icon="directions" label={l.label} onPress={() => void openExternal(l.href)} />
                  ))}
                </View>
              ) : null}
            </View>
          ) : null
        }
        empty={{ icon: 'articles', title: 'لا مقالات منشورة لهذا الكاتب بعد' }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { padding: space.screen, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1, gap: space.xxs },
  avatar: { width: control.avatarLarge, height: control.avatarLarge, borderRadius: radius.pill },
  links: { flexDirection: 'row', flexWrap: 'wrap' },
});
