import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandCookieHero } from '@/src/components/brand/BrandCookieHero';
import { BackgroundGlow, EnterView } from '@/src/components/ui/Nabd';
import { ErrorState, OfflineState, SkeletonBar } from '@/src/components/ui/MobileUI';
import { networkCopy } from '@/src/services/account-api';
import { control, nabd, skeleton, spacing } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

type Props = {
  /** `offline` = لم يصل الخادم · غيره = وصل ورفض بغير ٤٠١ (عطل خادم مثلاً). */
  failure: { offline: boolean; message: string };
  isRetrying: boolean;
  onRetry: () => void;
};

/**
 * فتح التطبيق بجلسة محفوظة **وبلا شبكة**.
 *
 * كان أيّ فشل في التحقق من الجلسة يرمي العميل إلى شاشة الدخول مع «Network request failed»
 * بالإنجليزي — وجلسته سليمة محفوظة: أعاد التشغيل بالشبكة فرجع للرئيسية بلا دخول. فالرسالة
 * كانت تقول له «سجّل دخولك» والصحيح «شغّل الإنترنت». هنا الجلسة باقية، والفعل الوحيد
 * «إعادة المحاولة». شاشة الدخول لا تظهر إلا لو قال الخادم ٤٠١ صراحةً.
 */
export function SessionRestoreRoute({ failure, isRetrying, onRetry }: Props) {
  const { theme } = useAppTheme();
  return <SafeAreaView style={[styles.page, { backgroundColor: theme.colors.page }]} edges={['top', 'bottom']}>
    <BackgroundGlow />
    {/* «نبض»: نفس بطل شاشة الدخول (الكعكة) فوق حالة الاتصال — العميل يعرف أنّه في تطبيقه لا في عطل. */}
    <ScrollView contentContainerStyle={styles.content}>
      <EnterView index={0}><BrandCookieHero /></EnterView>
      <EnterView index={1}>{isRetrying
        ? <View accessibilityLabel={networkCopy.loadingLabel} style={styles.skeleton}>
            <SkeletonBar height={skeleton.titleHeight} width="50%" />
            <SkeletonBar width="70%" />
            <SkeletonBar height={control.buttonHeight} radius={nabd.pill} />
          </View>
        : failure.offline
          ? <OfflineState title={networkCopy.offlineTitle} description={networkCopy.offlineDescription} retryLabel={networkCopy.retryLabel} onRetry={onRetry} />
          : <ErrorState message={failure.message} retryLabel={networkCopy.retryLabel} onRetry={onRetry} />}</EnterView>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { flexGrow: 1, gap: spacing.xl, justifyContent: 'center', paddingHorizontal: spacing.screenHorizontal, paddingVertical: spacing.screenTop },
  skeleton: { gap: spacing.sm },
});
