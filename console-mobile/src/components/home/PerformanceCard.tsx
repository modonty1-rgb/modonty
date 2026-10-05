import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { StatStrip, TonalCard } from '@/src/components/ui/Nabd';
import { onLiveRefresh } from '@/src/services/live-refresh';
import { mobileRequest, type MobileStat } from '@/src/services/mobile-api';
import { fonts, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type Performance = { title: string; subtitle: string; stats: MobileStat[] };

/**
 * «زوّارك آخر ٢٨ يوماً» في الرئيسية (CMOB-FEATURES · ٥ أكتوبر ٢٠٢٦) — نفس أرقام رئيسية الويب.
 *
 * تُجلب وحدها بعد الرئيسية (`/dashboard/performance`) كي لا يؤخّر نداء جوجل بطل المهام، ولا
 * تظهر أبداً قبل وصول أرقامها: بطاقة فارغة أو خطأ هنا ضجيجٌ في شاشة غرضها «ما ينتظرني».
 */
export function PerformanceCard({ accessToken }: { accessToken: string }) {
  const { theme } = useAppTheme();
  const [data, setData] = useState<Performance | null>(null);

  const load = useCallback(() => {
    mobileRequest<Performance>('/dashboard/performance', accessToken, 'تعذّر تحميل أرقام الزوّار.')
      .then(setData)
      .catch(() => undefined);
  }, [accessToken]);

  useEffect(() => {
    load();
    return onLiveRefresh(load);
  }, [load]);

  if (data === null) return null;
  return <TonalCard style={styles.card}>
    <Text style={[styles.title, { color: theme.colors.text }]}>{data.title}</Text>
    <Text style={[styles.subtitle, { color: theme.colors.muted }]}>{data.subtitle}</Text>
    <StatStrip stats={data.stats} />
  </TonalCard>;
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  title: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  subtitle: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
});
