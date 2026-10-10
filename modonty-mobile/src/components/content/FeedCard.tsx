import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import type { ArticleCardModel } from '@/lib/models';
import { useAppTheme } from '@/theme/ThemeProvider';
import { control } from '@/theme/tokens';

type Props = {
  item: ArticleCardModel;
  onOpen: (slug: string) => void;
  /** بطاقة «الواجهة» الواحدة أعلى الفيد — مثل الموقع (`MobilePostCard` hero). */
  hero?: boolean;
};

/**
 * بطاقة الفيد بتصميم موقع مدونتي على الجوال (`modonty/components/feed/postcard/MobilePostCard.tsx`،
 * الهجين الذي اعتمده خالد ٢٣ أغسطس): بطاقة واجهة واحدة بغلاف ١٦:٩ فوق، وبقيّة البطاقات مدمجة —
 * النصّ ثم صورة ١٢٤ بنسبة ٤:٣ بجانبه — فيرى القارئ ضعف البطاقات في الشاشة.
 * الضغط ينكمش ١٫٥٪ ويعود بهدوء — لمسة لا استعراض (خالد ٨ أكتوبر: «جنتل وأنيق»).
 * كانت الوحيدة بفئات NativeWind، والمكتبة كانت تمرّ على كل عنصر في التطبيق لأجلها — أُزيلت (١٠ أكتوبر).
 */
export const FeedCard = memo(function FeedCard({ item, onOpen, hero }: Props) {
  const { colors } = useAppTheme();
  const muted = { color: colors.textSecondary };

  const publisher = item.publisher ? (
    <View style={styles.publisher}>
      {item.publisherLogo ? <Image cachePolicy="memory-disk" recyclingKey={item.key} source={item.publisherLogo} style={styles.logo} contentFit="cover" /> : null}
      <Text maxFontSizeMultiplier={1.2} style={[styles.publisherName, muted]} numberOfLines={1}>
        {item.publisher}
      </Text>
      {item.verified ? <Icon name="trust" size={control.iconInline} tone="interactive" /> : null}
    </View>
  ) : null;

  const footer = (
    <View style={styles.footer}>
      {item.hasAudio ? <Icon name="audio" size={18} tone="muted" /> : null}
      <Text maxFontSizeMultiplier={1.2} style={[styles.meta, muted]} numberOfLines={1}>
        {[item.meta, item.stats].filter(Boolean).join('، ')}
      </Text>
    </View>
  );

  return (
    <Tap label={item.title} role="link" minTarget={false} scale={0.985} onPress={() => onOpen(item.slug)} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {hero ? (
        <>
          {item.image ? (
            <View style={styles.cover}>
              <Image cachePolicy="memory-disk"
                recyclingKey={item.key}
                source={item.image}
                placeholder={item.imageBlur ? { uri: item.imageBlur } : undefined}
                style={styles.coverImage}
                contentFit="cover"
                accessibilityIgnoresInvertColors
              />
              {/* مثل الموقع: الشارة فوق الغلاف في الركن الأوّل، كحلية. */}
              <View style={[styles.badge, { backgroundColor: colors.text }]}>
                <Text maxFontSizeMultiplier={1.2} style={[styles.badgeText, { color: colors.page }]}>الأحدث</Text>
              </View>
            </View>
          ) : null}
          <Text maxFontSizeMultiplier={1.2} style={[styles.heroTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.gapTop}>{publisher}</View>
          {item.excerpt ? (
            <Text maxFontSizeMultiplier={1.2} style={[styles.heroExcerpt, muted]} numberOfLines={2}>
              {item.excerpt}
            </Text>
          ) : null}
          {footer}
        </>
      ) : (
        <>
          {publisher}
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text maxFontSizeMultiplier={1.2} style={[styles.title, { color: colors.text }]} numberOfLines={3}>
                {item.title}
              </Text>
              {item.excerpt ? (
                <Text maxFontSizeMultiplier={1.2} style={[styles.excerpt, muted]} numberOfLines={2}>
                  {item.excerpt}
                </Text>
              ) : null}
            </View>
            {item.image ? (
              <Image cachePolicy="memory-disk"
                recyclingKey={item.key}
                source={item.image}
                placeholder={item.imageBlur ? { uri: item.imageBlur } : undefined}
                style={styles.thumb}
                contentFit="cover"
                accessibilityIgnoresInvertColors
              />
            ) : null}
          </View>
          {footer}
        </>
      )}
    </Tap>
  );
});

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderRadius: 16, borderWidth: 1, padding: 10 },
  publisher: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logo: { width: 20, height: 20, borderRadius: 10 },
  publisherName: { flexShrink: 1, fontFamily: 'Tajawal_500Medium', fontSize: 12, lineHeight: 16 },
  footer: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  meta: { flex: 1, fontFamily: 'Tajawal_400Regular', fontSize: 12, lineHeight: 16 },
  cover: { marginHorizontal: -10, marginTop: -10, marginBottom: 10 },
  coverImage: { aspectRatio: 16 / 9 },
  badge: { position: 'absolute', start: 12, top: 12, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { fontFamily: 'Tajawal_700Bold', fontSize: 12, lineHeight: 16 },
  heroTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 20, lineHeight: 32 },
  gapTop: { marginTop: 6 },
  heroExcerpt: { marginTop: 4, fontFamily: 'Tajawal_400Regular', fontSize: 14, lineHeight: 24 },
  row: { marginTop: 6, flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  title: { fontFamily: 'Tajawal_700Bold', fontSize: 16, lineHeight: 24 },
  excerpt: { marginTop: 4, fontFamily: 'Tajawal_400Regular', fontSize: 13, lineHeight: 20 },
  thumb: { width: 124, aspectRatio: 4 / 3, borderRadius: 8 },
});
