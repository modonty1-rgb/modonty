import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/src/components/ui/AppText';
import { SkeletonBar } from '@/src/components/ui/MobileUI';
import { StatStrip, TonalCard } from '@/src/components/ui/Nabd';
import { onLiveRefresh } from '@/src/services/live-refresh';
import { mobileRequest, type MobileStat } from '@/src/services/mobile-api';
import { fonts, nabd, skeleton, spacing, typography } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type Performance = { title: string; subtitle: string; stats: MobileStat[] };

/**
 * «زوّارك آخر ٢٨ يوماً» في الرئيسية (CMOB-FEATURES · ٥ أكتوبر ٢٠٢٦) — نفس أرقام رئيسية الويب.
 *
 * تُجلب وحدها بعد الرئيسية (`/dashboard/performance`) كي لا يؤخّر نداء جوجل بطل المهام.
 * أثناء الجلب هيكلٌ بنفس شكلها (لا فراغ ثم قفزة — جوال خالد ٥ أكتوبر ٢٠٢٦)، وعند الفشل تختفي:
 * خطأ هنا ضجيجٌ في شاشة غرضها «ما ينتظرني».
 */
export function PerformanceCard({ accessToken }: { accessToken: string }) {
  const { theme } = useAppTheme();
  const [data, setData] = useState<Performance | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    mobileRequest<Performance>('/dashboard/performance', accessToken, 'تعذّر تحميل أرقام الزوّار.')
      .then((next) => { setData(next); setFailed(false); })
      .catch(() => setFailed(true));
  }, [accessToken]);

  useEffect(() => {
    load();
    return onLiveRefresh(load);
  }, [load]);

  if (data === null) {
    if (failed) return null;
    return <TonalCard style={styles.card}>
      <View accessibilityLabel="جاري التحميل" style={styles.skeleton}>
        <SkeletonBar height={skeleton.titleHeight} width="55%" />
        <SkeletonBar width="40%" />
        <View style={styles.skeletonStats}>
          {[0, 1, 2].map((key) => <View key={key} style={styles.skeletonStat}><SkeletonBar height={STAT_SKELETON_HEIGHT} radius={nabd.statRadius} /></View>)}
        </View>
      </View>
    </TonalCard>;
  }
  return <TonalCard style={styles.card}>
    <Text style={[styles.title, { color: theme.colors.text }]}>{data.title}</Text>
    <Text style={[styles.subtitle, { color: theme.colors.muted }]}>{data.subtitle}</Text>
    <StatStrip stats={data.stats} />
  </TonalCard>;
}

/** ارتفاع خانة رقم في `StatStrip` (رقم + سطرا عنوان) كي لا تقفز البطاقة عند وصول الأرقام. */
const STAT_SKELETON_HEIGHT = 92;

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  skeleton: { gap: spacing.xs },
  skeletonStats: { flexDirection: 'row-reverse', gap: spacing.xs, marginTop: spacing.xxs },
  skeletonStat: { flex: 1 },
  title: { fontFamily: fonts.medium, fontSize: typography.sectionTitle, lineHeight: typography.lineHeightSection, textAlign: 'right', writingDirection: 'rtl' },
  subtitle: { fontFamily: fonts.regular, fontSize: typography.secondary, lineHeight: typography.lineHeightSecondary, textAlign: 'right', writingDirection: 'rtl' },
});
