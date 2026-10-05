import { StyleSheet, View } from 'react-native';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { SkeletonBar } from '@/src/components/ui/MobileUI';
import { BadgeTone, LargeTitle, PressableScale, StatusBadge } from '@/src/components/ui/Nabd';
import { control, nabd, skeleton, spacing } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

/**
 * رأس **كل** شاشة مدفوعة — واحدٌ لا اثنان، والرجوع **يميناً** في بداية القراءة كما يفعل أندرويد.
 *
 * «نبض»: صفّ ٥٦ فيه زرّ رجوع دائري على سطح `surfaceRaised` (٤٤ مرئياً داخل هدف ٤٨)، ثم العنوان
 * الكبير ٢٨/٣٦ في أوّل المحتوى بدل عنوان صغير يزاحم الرجوع — الشاشة المدفوعة مكان مهمّة،
 * والعنوان الكبير يقول «أين أنا» بلا ترويسة.
 *
 * `title === null` = العنوان لم يصل من العقد بعد → شريط هيكل، والرجوع يبقى مضغوطاً:
 * التنقّل لا ينتظر البيانات.
 */
export function ScreenHeader({ title, backLabel, onBack, subtitle, padded = false, badge, titleSize = 'large', backOnly = false }: {
  title: string | null;
  backLabel: string;
  onBack: () => void;
  subtitle?: string | null;
  /** الشاشة بلا حشو جانبي (قائمة تحشو محتواها بنفسها). */
  padded?: boolean;
  /** شارة حالة فوق العنوان (لوحة مراجعة المقال). */
  badge?: { label: string; tone: BadgeTone } | null;
  /** عنوان المقال نفسه طويل: ٢٤/٣٢ بدل ٢٨/٣٦ كما في الموكب. */
  titleSize?: 'large' | 'medium';
  /** شاشة نصّ المقال: الرجوع وحده، والعنوان جزء من المحتوى تحت الصورة. */
  backOnly?: boolean;
}) {
  const { theme } = useAppTheme();
  return <View style={[styles.block, padded && styles.padded]}>
    <View style={styles.bar}>
      <PressableScale accessibilityLabel={backLabel} onPress={onBack} style={styles.backTarget}>
        <View style={[styles.back, { backgroundColor: theme.colors.surfaceRaised }]}>
          {/* السهم مرآةٌ في العربية: `arrow-left` يشير إلى بداية القراءة بعد القلب. */}
          <View style={styles.mirrored}><ModontyIcon name="arrow-left" size={control.headerIconSize} primary={theme.colors.text} accent={theme.colors.accent} /></View>
        </View>
      </PressableScale>
    </View>
    {backOnly ? null : <View style={styles.title}>
      {badge ? <StatusBadge label={badge.label} tone={badge.tone} /> : null}
      {title === null ? <SkeletonBar height={skeleton.titleHeight} width="55%" /> : <LargeTitle title={title} subtitle={subtitle} size={titleSize} />}
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  block: { paddingBottom: spacing.sm },
  padded: { paddingHorizontal: spacing.screenHorizontal },
  bar: { alignItems: 'center', flexDirection: 'row-reverse', height: control.headerHeight },
  backTarget: { alignItems: 'center', height: control.minTouchTarget, justifyContent: 'center', width: control.minTouchTarget },
  back: { alignItems: 'center', borderRadius: nabd.pill, height: nabd.backButtonSize, justifyContent: 'center', width: nabd.backButtonSize },
  mirrored: { transform: [{ scaleX: -1 }] },
  title: { gap: spacing.xs, marginTop: spacing.xxs },
});
