import { Image } from 'expo-image';
import { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Tap } from '@/components/ui/Tap';
import { open } from '@/lib/nav';
import type { HomeIndustry } from '@/services/api-types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsType } from '@/theme/tokens';
import { SectionTitle } from './SectionTitle';

/** «تصفّح حسب المجال» — رقاقات ٤٤ برسم المجال الدائري ٣٢ واسمه، صفّ أفقي (Screens A · 01). */
export const IndustryChips = memo(function IndustryChips({ items }: { items: HomeIndustry[] }) {
  const { colors } = useAppTheme();
  if (items.length === 0) return null;
  return (
    <View style={styles.block}>
      <SectionTitle title="تصفّح حسب المجال" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {items.map((i) => (
          <Tap key={i.id} label={i.name} role="link" scale={0.96} onPress={() => open.industry(i.slug)} style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {i.socialImage ? <Image cachePolicy="memory-disk" source={i.socialImage} style={[styles.art, { backgroundColor: colors.surfaceHigh }]} contentFit="cover" /> : null}
            <Text style={[dsType.label, { color: colors.text }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {i.name}
            </Text>
          </Tap>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  block: { paddingBottom: ds.space.s5 },
  rail: { paddingHorizontal: ds.layout.gutter, gap: ds.space.s2 },
  chip: { minHeight: 44, paddingStart: 6, paddingEnd: 14, borderRadius: ds.radius.full, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: ds.space.s2 },
  art: { width: 32, height: 32, borderRadius: 16 },
});
