import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import { useState } from 'react';
import { Card, PrimaryAction, Screen, StatusPill } from '@/src/components/ui/MobileUI';
import { fonts } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export function AudienceReplyRoute({ onDone }: { onDone: () => void }) {
  const { theme } = useAppTheme(); const [reply, setReply] = useState('');
  const send = () => { if (!reply.trim()) return Alert.alert('اكتب ردك أولًا'); Alert.alert('تم حفظ الرد', 'سيُرسل الرد الحقيقي عند ربط الـAPI.'); onDone(); };
  return <Screen title="رد على سؤال" icon="question"><Card><StatusPill tone="warning">يحتاج ردك</StatusPill><Text style={[styles.question, { color: theme.colors.text }]}>هل تقدمون استشارة أولية قبل البدء؟</Text><Text style={[styles.meta, { color: theme.colors.muted }]}>سؤال مباشر من زائر · اليوم، 10:38 ص</Text></Card><Text style={[styles.label, { color: theme.colors.text }]}>ردك للزائر</Text><TextInput value={reply} onChangeText={setReply} multiline textAlign="right" textAlignVertical="top" placeholder="اكتب ردًا واضحًا ومختصرًا" placeholderTextColor={theme.colors.muted} style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}/><PrimaryAction label="إرسال الرد" icon="comment" onPress={send} style={styles.action}/></Screen>;
}

const styles = StyleSheet.create({ question: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 26, textAlign: 'right', writingDirection: 'rtl', marginTop: 15 }, meta: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, textAlign: 'right', writingDirection: 'rtl', marginTop: 7 }, label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl', marginTop: 24, marginBottom: 8 }, input: { minHeight: 130, borderWidth: 1, borderRadius: 16, padding: 14, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, writingDirection: 'rtl' }, action: { marginTop: 12 } });
