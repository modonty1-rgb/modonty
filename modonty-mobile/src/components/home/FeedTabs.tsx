import * as Haptics from 'expo-haptics';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Tap } from '@/components/ui/Tap';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsType } from '@/theme/tokens';

/**
 * تبويبات الفيد — Screens A · 01: نصّ ١٦ بارتفاع ٤٨، والنشط عريض بخطّ أزرق ٣ تحته، وخطّ فاصل أسفل الصفّ.
 * تُعرض فقط التبويبات التي يرجعها الخادم فعلاً (`/articles?view=latest|popular`).
 */
export function FeedTabs<K extends string>({ tabs, value, onChange }: { tabs: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.bar, { backgroundColor: colors.page, borderBottomColor: colors.border }]}>
      {/* تتمرّر أفقياً حين تكثر (تصنيفات المقالات) — اثنان أو ثلاثة تبقى ثابتة كما هي */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = t.key === value;
        return (
          <Tap
            key={t.key}
            label={t.label}
            role="tab"
            accessibilityState={{ selected: on }}
            onPress={() => {
              if (on) return;
              Haptics.selectionAsync().catch(() => undefined);
              onChange(t.key);
            }}
            style={styles.tab}
          >
            <Text style={[dsType.labelLg, { color: on ? colors.text : colors.muted, fontFamily: on ? dsType.labelLg.fontFamily : 'Tajawal_500Medium' }]} maxFontSizeMultiplier={1.2}>
              {t.label}
            </Text>
            <View style={[styles.line, { backgroundColor: on ? colors.primary : 'transparent' }]} />
          </Tap>
        );
      })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', paddingHorizontal: 6 },
  tab: { height: 48, paddingHorizontal: ds.space.s3, justifyContent: 'center' },
  line: { position: 'absolute', start: ds.space.s3, end: ds.space.s3, bottom: 0, height: 3, borderRadius: 2 },
});
