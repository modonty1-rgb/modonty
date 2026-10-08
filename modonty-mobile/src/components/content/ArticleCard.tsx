import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { FeedCard } from '@/components/content/FeedCard';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import type { ArticleCardModel } from '@/lib/models';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control, media, radius, space } from '@/theme/tokens';

type Props = {
  item: ArticleCardModel;
  /** نمط الموزِّع: البطاقة تستدعي onOpen(slug) ودالّة واحدة تتلقّى (ENGINEERING §١ب٣). */
  onOpen: (slug: string) => void;
  layout?: 'card' | 'row';
};

/**
 * بطاقة المقال. الصورة `featuredImage` ١٦:٩ دائماً، وتُحذف إن غابت — لا بديل مخترَع (UIUX §٣).
 * العنوان سطران ثم «…». المؤشّر في الطرف النهائي لأنها تفتح صفحة أخرى (BRANDING).
 */
export const ArticleCard = memo(function ArticleCard({ item, onOpen, layout = 'card' }: Props) {
  const { colors } = useAppTheme();
  const surface = { backgroundColor: colors.surface, borderColor: colors.border };
  if (layout === 'row') {
    return (
      <Tap label={item.title} role="link" onPress={() => onOpen(item.slug)} style={[styles.row, surface]}>
        {item.image ? (
          <Image
            source={item.image}
            placeholder={item.imageBlur ? { uri: item.imageBlur } : undefined}
            style={styles.thumb}
            contentFit="cover"
            transition={200}
            accessibilityIgnoresInvertColors
          />
        ) : null}
        <View style={styles.rowText}>
          <AppText variant="label" numberOfLines={2}>
            {item.title}
          </AppText>
          <AppText variant="secondary" tone="muted" numberOfLines={1}>
            {[item.publisher, item.meta].filter(Boolean).join('، ')}
          </AppText>
        </View>
        <Icon name="forward" size={control.iconSmall} tone="muted" />
      </Tap>
    );
  }
  // كل قوائم المقالات بالبطاقة المدمجة نفسها التي في الموقع (MobilePostCard) — بطاقة واحدة لا نسختان.
  if (layout === 'card') return <FeedCard item={item} onOpen={onOpen} />;
  return (
    <Tap label={item.title} role="link" onPress={() => onOpen(item.slug)} style={[styles.card, surface]}>
      {item.image ? (
        <Image
          source={item.image}
          placeholder={item.imageBlur ? { uri: item.imageBlur } : undefined}
          style={styles.cover}
          contentFit="cover"
          transition={200}
          accessibilityIgnoresInvertColors
        />
      ) : null}
      {item.publisher ? (
      <View style={styles.publisher}>
        {item.publisherLogo ? <Image source={item.publisherLogo} style={styles.logo} contentFit="cover" /> : null}
        <AppText variant="label" tone="muted" numberOfLines={1} style={styles.flex}>
          {item.publisher}
        </AppText>
        {item.verified ? <Icon name="trust" size={control.iconInline} tone="interactive" /> : null}
        {item.hasAudio ? <Icon name="audio" size={control.iconInline} tone="muted" /> : null}
      </View>
      ) : null}
      <AppText variant="sectionTitle" numberOfLines={2}>
        {item.title}
      </AppText>
      {item.excerpt ? (
        <AppText variant="body" tone="muted" numberOfLines={2}>
          {item.excerpt}
        </AppText>
      ) : null}
      <View style={styles.footer}>
        <AppText variant="secondary" tone="muted" numberOfLines={1} style={styles.flex}>
          {[item.meta, item.stats].filter(Boolean).join('، ')}
        </AppText>
        <Icon name="forward" size={control.iconSmall} tone="muted" />
      </View>
    </Tap>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth, padding: space.card, gap: space.xs },
  cover: { width: '100%', aspectRatio: media.articleAspect, borderRadius: radius.image, marginBottom: space.xxs },
  publisher: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  logo: { width: control.iconSmall, height: control.iconSmall, borderRadius: radius.pill },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.sm,
  },
  thumb: { width: media.thumbWidth, aspectRatio: media.articleAspect, borderRadius: radius.image },
  rowText: { flex: 1, gap: space.xxs },
});
