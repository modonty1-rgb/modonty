import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Screen, SectionTitle, StatusPill } from '@/src/components/ui/MobileUI';
import { ModontyIcon } from '@/src/components/brand/icons/ModontyIcon';
import { fonts } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

const audienceItems = [
  { id: 'question', type: 'سؤال جديد', text: 'هل تقدمون استشارة أولية قبل البدء؟', meta: 'منذ 15 دقيقة', icon: 'question' as const, status: 'يحتاج رد' },
  { id: 'comment', type: 'تعليق على مقال', text: 'مقال واضح، هل يمكن معرفة مدة التنفيذ؟', meta: 'منذ ساعة', icon: 'comment' as const, status: 'جديد' },
  { id: 'follow', type: 'متابع جديد', text: 'انضم عميل محتمل لمتابعة نشاطك', meta: 'أمس', icon: 'profile' as const, status: 'للمتابعة' },
];

export function AudienceRoute({ onReply }: { onReply: () => void }) {
  const { theme } = useAppTheme();
  return <Screen title="الجمهور" icon="comment"><Card style={styles.summary}><View><Text style={[styles.number, { color: theme.colors.text }]}>2</Text><Text style={[styles.summaryText, { color: theme.colors.muted }]}>تحتاج ردك اليوم</Text></View><ModontyIcon name="comment" size={34} primary={theme.colors.text} accent={theme.colors.primary}/></Card><SectionTitle>أحدث التفاعل</SectionTitle>{audienceItems.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`فتح ${item.type}`} onPress={onReply}><Card style={styles.row}><ModontyIcon name={item.icon} size={25} primary={theme.colors.text} accent={theme.colors.primary}/><View style={styles.copy}><View style={styles.heading}><StatusPill tone={item.status === 'يحتاج رد' ? 'warning' : 'muted'}>{item.status}</StatusPill><Text style={[styles.type, { color: theme.colors.muted }]}>{item.type}</Text></View><Text numberOfLines={2} style={[styles.text, { color: theme.colors.text }]}>{item.text}</Text><Text style={[styles.meta, { color: theme.colors.muted }]}>{item.meta}</Text></View></Card></Pressable>)}</Screen>;
}

const styles = StyleSheet.create({ summary: { minHeight: 92, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }, number: { fontFamily: fonts.medium, fontSize: 27, lineHeight: 33 }, summaryText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, writingDirection: 'rtl' }, row: { flexDirection: 'row-reverse', gap: 13, marginBottom: 12 }, copy: { flex: 1 }, heading: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }, type: { fontFamily: fonts.regular, fontSize: 11, writingDirection: 'rtl' }, text: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, textAlign: 'right', writingDirection: 'rtl', marginTop: 8 }, meta: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 16, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 } });
