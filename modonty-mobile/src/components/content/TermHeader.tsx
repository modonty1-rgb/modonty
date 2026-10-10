import { Image } from 'expo-image';
import { memo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Tap } from '@/components/ui/Tap';
import { open } from '@/lib/nav';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, media, radius, space } from '@/theme/tokens';

export type TermPartner = { id: string; name: string; slug: string; logo: string | null; line: string | null };

/** رأس صفحة تصنيف/وسم/مجال: الصورة الاجتماعية · الاسم · الوصف · العدد · شركاؤه أفقياً. */
export const TermHeader = memo(function TermHeader({
  name,
  description,
  image,
  imageAlt,
  meta,
  partners,
  articlesTitle = 'المقالات',
}: {
  name: string;
  description: string | null;
  image: string | null;
  imageAlt: string | null;
  meta: string | null;
  partners: TermPartner[];
  articlesTitle?: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.intro}>
        {image ? <Image cachePolicy="memory-disk" source={image} style={styles.image} contentFit="cover" accessibilityLabel={imageAlt ?? name} /> : null}
        <AppText variant="pageTitle" accessibilityRole="header">
          {name}
        </AppText>
        {description ? (
          <AppText variant="body" tone="muted">
            {description}
          </AppText>
        ) : null}
        {meta ? (
          <AppText variant="secondary" tone="muted">
            {meta}
          </AppText>
        ) : null}
      </View>
      {partners.length > 0 ? (
        <View style={styles.block}>
          <SectionHeader title="الشركاء" />
          <FlatList
            horizontal
            data={partners}
            keyExtractor={(p) => p.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => (
              <Tap label={item.name} role="link" onPress={() => open.partner(item.slug)} style={[styles.partner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {item.logo ? <Image cachePolicy="memory-disk" source={item.logo} style={styles.logo} contentFit="contain" /> : null}
                <AppText variant="label" numberOfLines={1}>
                  {item.name}
                </AppText>
                {item.line ? (
                  <AppText variant="secondary" tone="muted" numberOfLines={2}>
                    {item.line}
                  </AppText>
                ) : null}
              </Tap>
            )}
          />
        </View>
      ) : null}
      <SectionHeader title={articlesTitle} />
    </View>
  );
});

const PARTNER_CARD_WIDTH = 160;

const styles = StyleSheet.create({
  wrap: { gap: space.section, paddingTop: space.md },
  intro: { paddingHorizontal: space.screen, gap: space.xs },
  image: { width: '100%', aspectRatio: media.articleAspect, borderRadius: radius.image },
  block: { gap: space.sm },
  hList: { paddingHorizontal: space.screen, gap: space.xs },
  partner: { width: PARTNER_CARD_WIDTH, borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.sm, gap: space.xxs },
  logo: { width: control.logo, height: control.logo, borderRadius: radius.image },
});
