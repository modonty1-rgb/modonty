import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { plainNumber } from '@/lib/format';
import type { ArchiveReadingTime } from '@/services/api-types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space, type AppColors } from '@/theme/tokens';

/** `READING_TIME_BUCKETS` + أيقونات وألوان `ReadingTimeBar.tsx` في الموقع. */
const BUCKETS: { key: ArchiveReadingTime; label: string; hint: string; icon: ModontyIconName; tone: keyof AppColors; on: keyof AppColors }[] = [
  { key: 'short', label: 'على الماشي', hint: '٣ دقائق أو أقل', icon: 'footprints', tone: 'actionListen', on: 'onActionListen' },
  { key: 'medium', label: 'فنجان قهوة', hint: '٤ إلى ٧ دقائق', icon: 'coffee', tone: 'actionSave', on: 'onActionSave' },
  { key: 'long', label: 'جلسة روقان', hint: '٨ دقائق فأكثر', icon: 'armchair', tone: 'actionShare', on: 'onActionShare' },
];

/**
 * «اقرأ حسب وقتك» — ثلاث بطاقات متساوية، المختارة تمتلئ بلونها. العدد بين قوسين لا بعد «·»: الصفر
 * الهندي نقطة، فكانت «١٦ ·» تُقرأ «١٦٠» (خالد ٢٣ أغسطس). بلا أعداد حين لا يرسلها الخادم بعد.
 */
export const ReadingTimeBar = memo(function ReadingTimeBar({
  value,
  counts,
  onChange,
}: {
  value: ArchiveReadingTime | null;
  counts?: Record<ArchiveReadingTime, number>;
  onChange: (next: ArchiveReadingTime | null) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View accessibilityLabel="اقرأ حسب وقتك" style={styles.row}>
      {BUCKETS.map((b) => {
        const active = value === b.key;
        const ink = active ? colors[b.on] : null;
        return (
          <Tap
            key={b.key}
            label={`${b.label} — ${b.hint}`}
            role="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(active ? null : b.key)}
            style={[styles.card, { backgroundColor: active ? colors[b.tone] : colors.surface, borderColor: active ? colors[b.tone] : colors.border }]}
          >
            <Icon name={b.icon} size={20} tone={active ? b.on : b.tone} monochrome />
            <AppText variant="label" numberOfLines={1} style={[styles.bold, ink ? { color: ink } : null]}>
              {b.label}
            </AppText>
            <AppText variant="secondary" tone="muted" numberOfLines={1} style={ink ? { color: ink, opacity: 0.85 } : null}>
              {counts ? `${b.hint} (${plainNumber(counts[b.key])})` : b.hint}
            </AppText>
          </Tap>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.xs, paddingHorizontal: space.screen },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: space.xs,
    paddingHorizontal: 4,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  bold: { fontWeight: '700', fontSize: 13 },
});
