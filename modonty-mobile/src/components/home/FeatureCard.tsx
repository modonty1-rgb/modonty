import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import type { ArticleRowModel } from '@/lib/models';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsFontScale, dsType } from '@/theme/tokens';
import { BUCKET_COLOR, Publisher } from './ArticleRow';

/**
 * البطاقة المميّزة — Screens A · 01 (radius.feature: ٢٨ والزاوية الحادّة ٨): صورة ١٧٦ · شارة تركواز ·
 * الناشر · العنوان title-md 18/28 w800 · نقطة الفئة والمدّة والعمر.
 * الشارة «الأحدث» لا «مميّز اليوم»: لا حقل «مميّز» في بيانات الفيد اليوم (ثغرة مسجّلة) — فلا نختلقه.
 */
export const FeatureCard = memo(function FeatureCard({ item, badge, onOpen }: { item: ArticleRowModel; badge: string; onOpen: (slug: string) => void }) {
  const { colors } = useAppTheme();
  return (
    // شارة فوق صورة داخل بطاقة مقصوصة الزوايا بظلّ — طبقة جاهزة على أندرويد (توثيق React Native › Performance).
    <Tap label={`${badge}: ${item.title}، ${item.publisher}`} role="link" scale={0.97} onPress={() => onOpen(item.slug)} renderToHardwareTextureAndroid style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={[styles.media, { backgroundColor: colors.surfaceHigh }]}>
        {item.image ? <Image cachePolicy="memory-disk" source={item.image} placeholder={item.imageBlur ?? undefined} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
        <View style={[styles.badge, { backgroundColor: colors.brandFill }]}>
          <Icon name="trending" size={16} tone="onBrandFill" monochrome />
          <Text style={[dsType.label, styles.badgeText, { color: colors.onBrandFill }]} maxFontSizeMultiplier={1.2}>
            {badge}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <Publisher name={item.publisher} logo={item.publisherLogo} />
        <Text style={[dsType.titleMd, styles.title, { color: colors.text }]} maxFontSizeMultiplier={dsFontScale.max}>
          {item.title}
        </Text>
        {item.meta ? (
          <View style={styles.meta}>
            {item.bucket ? <View style={[styles.dot, { backgroundColor: colors[BUCKET_COLOR[item.bucket]] }]} /> : null}
            <Text style={[dsType.caption, { color: colors.muted }]} maxFontSizeMultiplier={dsFontScale.max}>
              {item.meta}
            </Text>
          </View>
        ) : null}
      </View>
    </Tap>
  );
});

const R = ds.radius.feature;
const styles = StyleSheet.create({
  card: {
    borderRadius: R.round,
    borderTopEndRadius: R.sharp,
    overflow: 'hidden',
    shadowColor: '#0E065A',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: ds.elevation.card,
  },
  media: { height: 176 },
  badge: { position: 'absolute', top: 0, start: 0, height: 32, paddingHorizontal: 12, borderBottomEndRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 13 },
  body: { paddingTop: 14, paddingHorizontal: ds.space.s4, paddingBottom: ds.space.s4, gap: ds.space.s2 },
  title: { fontFamily: 'Tajawal_800ExtraBold' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: ds.space.s2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
