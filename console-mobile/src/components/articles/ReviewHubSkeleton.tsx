import { StyleSheet, View } from 'react-native';
import { Card, SkeletonBar } from '@/src/components/ui/MobileUI';
import { control, radii, skeleton, spacing } from '@/src/theme/tokens';

/**
 * هيكل لوحة «مراجعة المقال» — مقصوصٌ على شكل ما سيأتي، لا مستطيلات عامّة.
 *
 * كان الهيكل ثلاث بطاقات عامّة يعلوها شريط بعرض ٦٠٪:
 *  - **ثلاث** بينما اللوحة بارَان، فالصفحة تقفز عند وصول البيانات.
 *  - الشريط العلويّ كان يمثّل بطاقة السياق **التي حُذفت**، فصار يعد بشيء لا يجيء.
 *  - البطاقة العامّة (عنوان + سطران) لا تشبه البار (شارة صغيرة · عنوان سطران · حالة · صفّ فعل).
 * والهيكل الذي لا يشبه محتواه ليس هيكلاً بل وميضاً — يُبطل الغرض منه أصلاً.
 *
 * الرأس ليس من مسؤوليته: يُرسم فوقه دائماً كي يبقى زرّ الرجوع **مضغوطاً أثناء التحميل**؛
 * كان يختفي، فيعلق العميل في شاشة فارغة بلا مخرج إن تأخّرت الشبكة.
 */
export function ReviewHubSkeleton() {
  return <View style={styles.list}>
    {[0, 1].map((index) => <Card key={index} style={styles.bar}>
      <SkeletonBar height={styles.chip.height} width={styles.chip.width} radius={radii.field} />
      <SkeletonBar height={skeleton.titleHeight} />
      <SkeletonBar height={skeleton.titleHeight} width="65%" />
      <SkeletonBar width="45%" />
      <View style={styles.action}><SkeletonBar width="35%" /></View>
    </Card>)}
  </View>;
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  bar: { gap: spacing.xs },
  // مقاس الشارة الحقيقية: نصّ ١١ بسطر ١٦ داخل حشو ٤ رأسياً، وعرضٌ يسع «بانتظارك».
  chip: { height: spacing.xl, width: spacing.xxl * 2.5 },
  action: { justifyContent: 'center', marginTop: spacing.xs, minHeight: control.minTouchTarget },
});
