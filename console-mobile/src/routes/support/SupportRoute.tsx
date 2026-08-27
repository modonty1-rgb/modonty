import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import { useState } from 'react';
import { Card, PrimaryAction, Screen } from '@/src/components/ui/MobileUI';
import { fonts } from '@/src/theme/tokens';
import { useAppTheme } from '@/src/theme/ThemeProvider';

export function SupportRoute({ onDone }: { onDone: () => void }) {
  const { theme } = useAppTheme(); const [message, setMessage] = useState('');
  const send = () => { if (!message.trim()) return Alert.alert('اكتب رسالتك أولًا'); Alert.alert('وصلت رسالتك', 'سيتواصل معك فريق الدعم قريبًا.'); onDone(); };
  return <Screen title="المساعدة والدعم" icon="question"><Card><Text style={[styles.title, { color: theme.colors.text }]}>كيف نساعدك؟</Text><Text style={[styles.copy, { color: theme.colors.muted }]}>أرسل رسالتك من التطبيق بدل البحث عن قناة دعم خارجية.</Text></Card><TextInput value={message} onChangeText={setMessage} multiline textAlign="right" textAlignVertical="top" placeholder="اكتب رسالتك" placeholderTextColor={theme.colors.muted} style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}/><PrimaryAction label="إرسال للدعم" icon="question" onPress={send} style={styles.action}/></Screen>;
}

const styles = StyleSheet.create({ title: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 25, textAlign: 'right', writingDirection: 'rtl' }, copy: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, textAlign: 'right', writingDirection: 'rtl', marginTop: 6 }, input: { minHeight: 140, marginTop: 20, borderWidth: 1, borderRadius: 16, padding: 14, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, writingDirection: 'rtl' }, action: { marginTop: 12 } });
