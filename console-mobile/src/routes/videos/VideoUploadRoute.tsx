import { Alert, StyleSheet, Text, View } from 'react-native';
import { Card, PrimaryAction, Screen, StatusPill } from '@/src/components/ui/MobileUI';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { fonts } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export function VideoUploadRoute({ onDone }: { onDone: () => void }) {
  const { theme } = useAppTheme();
  const notify = (source: string) => Alert.alert('تم اختيار المصدر', `${source} سيُربط بمنتقي الوسائط الحقيقي عند مرحلة الـAPI.`);
  return <Screen title="رفع فيديو" icon="reels"><Card style={styles.hero}><ModontyIcon name="reels" size={48} primary={theme.colors.text} accent={theme.colors.primary}/><Text style={[styles.title, { color: theme.colors.text }]}>أضف فيديو نشاطك</Text><Text style={[styles.copy, { color: theme.colors.muted }]}>بعد الرفع يظهر الفيديو تلقائيًا في الكونسل لمراجعته وإدارته.</Text><StatusPill>سيُحفظ كـ Reel بانتظار المراجعة</StatusPill></Card><PrimaryAction label="تصوير الآن" icon="reels" onPress={() => notify('الكاميرا')} style={styles.action}/><PrimaryAction label="اختيار من الاستديو" icon="reels" tone="secondary" onPress={() => notify('الاستديو')} style={styles.action}/><View style={[styles.note, { borderColor: theme.colors.border }]}><Text style={[styles.noteText, { color: theme.colors.muted }]}>الرفع لا ينشر الفيديو مباشرة. حالته تبدأ «بانتظار المراجعة» ثم تظهر لفريق مودونتي داخل الكونسل.</Text></View><PrimaryAction label="العودة للفيديوهات" icon="reels" tone="secondary" onPress={onDone} style={styles.action}/></Screen>;
}

const styles = StyleSheet.create({ hero: { alignItems: 'center', paddingVertical: 28 }, title: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 26, writingDirection: 'rtl', marginTop: 16 }, copy: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, textAlign: 'center', writingDirection: 'rtl', marginTop: 7, marginBottom: 18 }, action: { marginTop: 12 }, note: { marginTop: 18, borderTopWidth: 1, paddingTop: 15 }, noteText: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl' } });
