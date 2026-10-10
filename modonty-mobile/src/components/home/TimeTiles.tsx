import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ModontyIconName } from '@/components/brand/ModontyIcon';
import { Icon } from '@/components/ui/Icon';
import { Tap } from '@/components/ui/Tap';
import { plainNumber } from '@/lib/format';
import type { ReadBucket } from '@/lib/models';
import type { ArchiveReadingTime } from '@/services/api-types';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ds, dsType, type AppColors } from '@/theme/tokens';
import { SectionTitle } from './SectionTitle';

/** الفئات الثلاث بأسماء الموقع (ReadingTimeBucket) وألوانها الوظيفية الثابتة في الوضعين (Tokens §٠٥). */
const TILES: { key: ReadBucket; label: string; hint: string; icon: ModontyIconName; bg: keyof AppColors; fg: keyof AppColors }[] = [
  { key: 'short', label: 'على الماشي', hint: '٣ دقائق أو أقل', icon: 'footprints', bg: 'actionListen', fg: 'onActionListen' },
  { key: 'medium', label: 'فنجان قهوة', hint: '٤ إلى ٧ دقائق', icon: 'coffee', bg: 'actionSave', fg: 'onActionSave' },
  { key: 'long', label: 'جلسة روقان', hint: '٨ دقائق فأكثر', icon: 'armchair', bg: 'actionShare', fg: 'onActionShare' },
];

/**
 * «عندك كم دقيقة؟» — ثلاث بلاطات ٧٦ ملوّنة (زاوية ١٦) بأيقونة وعدد المقالات. العدد يغيب إن لم يرجعه الخادم.
 * بلا `onSelect`: كل بلاطة تفتح أرشيف فئتها (الرئيسية). مع `onSelect`: فلتر في مكانه (المقالات) — المختارة
 * كاملة والباقي باهت، والضغط ثانيةً يلغي الفلتر.
 */
export const TimeTiles = memo(function TimeTiles({
  counts,
  title = 'عندك كم دقيقة؟',
  value,
  onSelect,
}: {
  counts: Partial<Record<ArchiveReadingTime, number>> | null;
  title?: string | null;
  value?: ReadBucket | null;
  onSelect?: (bucket: ReadBucket | null) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View>
      {title ? <SectionTitle title={title} /> : null}
      <View style={styles.grid}>
        {TILES.map((t) => {
          const n = counts?.[t.key];
          const fg = colors[t.fg];
          return (
            <Tap
              key={t.key}
              label={`${t.label} — ${t.hint}${n != null ? `، ${plainNumber(n)} مقالاً` : ''}${onSelect && value === t.key ? '، اضغط لإلغاء الفلتر' : ''}`}
              role={onSelect ? 'button' : 'link'}
              accessibilityState={onSelect ? { selected: value === t.key } : undefined}
              scale={0.97}
              onPress={() =>
                onSelect ? onSelect(value === t.key ? null : t.key) : router.push({ pathname: '/articles', params: { time: t.key, title: t.label } })
              }
              style={[styles.tile, { backgroundColor: colors[t.bg] }, value && value !== t.key ? styles.dim : null]}
            >
              <View style={styles.top}>
                {/* المختارة تُظهر × مكان أيقونتها: الضغط ثانيةً يلغي الفلتر — والعلامة تقول ذلك */}
                <Icon name={onSelect && value === t.key ? 'close' : t.icon} size={20} tone={t.fg} monochrome />
                {n != null ? (
                  <Text style={[styles.count, { color: fg }]} maxFontSizeMultiplier={1.2}>
                    {plainNumber(n)}
                  </Text>
                ) : null}
              </View>
              <Text style={[dsType.label, { color: fg }]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                {t.label}
              </Text>
            </Tap>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: ds.space.s2, paddingHorizontal: ds.layout.gutter },
  tile: { flex: 1, minHeight: 76, borderRadius: ds.radius.ml, paddingVertical: 10, paddingHorizontal: ds.space.s3, justifyContent: 'space-between', gap: ds.space.s1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dim: { opacity: 0.4 },
  count: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 15, lineHeight: 20 },
});
