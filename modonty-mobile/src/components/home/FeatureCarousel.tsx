import { memo, useCallback, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import type { ArticleRowModel } from '@/lib/models';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds } from '@/theme/tokens';
import { FeatureCard } from './FeatureCard';

/**
 * بطاقات «الأحدث» تتقلّب أفقياً — Screens A · 01 (ثلاث بطاقات + نقاط: النشطة حبّة ٢٠×٦ زرقاء، والباقي ٦).
 * الصفحة النشطة state محلّي يتغيّر عند توقّف السحب فقط — لا مع كل إطار.
 */
export const FeatureCarousel = memo(function FeatureCarousel({ items, badge, onOpen }: { items: ArticleRowModel[]; badge: string; onOpen: (slug: string) => void }) {
  const { colors } = useAppTheme();
  const width = useWindowDimensions().width;
  const card = width - ds.layout.gutter * 2;
  const step = card + ds.space.s3;
  const [page, setPage] = useState(0);
  const onEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(Math.abs(e.nativeEvent.contentOffset.x) / step)),
    [step],
  );
  if (items.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={styles.rail}
        onMomentumScrollEnd={onEnd}
      >
        {items.map((it) => (
          <View key={it.key} style={{ width: card }}>
            <FeatureCard item={it} badge={badge} onOpen={onOpen} />
          </View>
        ))}
      </ScrollView>
      {items.length > 1 ? (
        <View style={styles.dots} accessibilityLabel={`البطاقة ${page + 1} من ${items.length}`}>
          {items.map((it, i) => (
            <View key={it.key} style={[styles.dot, i === page ? [styles.dotOn, { backgroundColor: colors.primary }] : { backgroundColor: colors.borderStrong }]} />
          ))}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: ds.space.s3 },
  rail: { paddingHorizontal: ds.layout.gutter, gap: ds.space.s3 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotOn: { width: 20 },
});
